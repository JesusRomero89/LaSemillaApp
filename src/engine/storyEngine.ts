import type { EfectosNodo, Nodo, Opcion, StoryData, VariableValue, Final } from '../types/story';
import { evaluateCondition } from './expression';

export interface HubProgress {
  visitedDestinos: string[];
  visitCount: number;
}

export interface EndingResult {
  id: string;
  titulo: string;
  texto: string;
}

export interface GameState {
  currentNodeId: string;
  vars: Record<string, VariableValue>;
  hubProgress: Record<string, HubProgress>;
  displayText: string;
  ending: EndingResult | null;
}

function initialVars(story: StoryData): Record<string, VariableValue> {
  const vars: Record<string, VariableValue> = { ruta: '' };
  for (const [key, def] of Object.entries(story.variables)) {
    vars[key] = def.inicial;
  }
  return vars;
}

export function createInitialState(story: StoryData): GameState {
  const state: GameState = {
    currentNodeId: story.inicio,
    vars: initialVars(story),
    hubProgress: {},
    displayText: '',
    ending: null,
  };
  return enterNode(story, state, story.inicio);
}

function applyEffects(story: StoryData, vars: Record<string, VariableValue>, efectos?: EfectosNodo) {
  if (!efectos) return vars;
  const next = { ...vars };
  for (const [key, value] of Object.entries(efectos)) {
    const def = story.variables[key];
    if (def && def.tipo === 'int') {
      const current = typeof next[key] === 'number' ? (next[key] as number) : 0;
      let total = current + Number(value);
      const [min, max] = def.rango ?? [0, Infinity];
      total = Math.max(min, Math.min(max, total));
      next[key] = total;
    } else {
      next[key] = value;
    }
  }
  return next;
}

function resolveDisplayText(
  node: Nodo,
  vars: Record<string, VariableValue>
): { text: string; efectos?: EfectosNodo; destino?: string } {
  let text = node.texto;
  let ramaEfectos: EfectosNodo | undefined;
  let ramaDestino: string | undefined;
  if (node.ramas) {
    for (const rama of node.ramas) {
      if (evaluateCondition(rama.condicion, vars)) {
        if (rama.texto) text = `${text}\n\n${rama.texto}`;
        ramaEfectos = rama.efectos;
        ramaDestino = rama.destino;
        break;
      }
    }
  }
  return { text, efectos: ramaEfectos, destino: ramaDestino };
}

function buildEnding(story: StoryData, id: string, vars: Record<string, VariableValue>): EndingResult {
  const final = story.finales[id] as Final;
  const ruta = vars.ruta as string;
  const texto = (ruta === 'mora' ? final.texto_mora : final.texto_replicante) ?? '';
  return { id, titulo: final.titulo, texto };
}

function evaluateFinal(story: StoryData, vars: Record<string, VariableValue>): EndingResult {
  const orden = story.finales.orden_evaluacion as string[];
  for (const id of orden) {
    const final = story.finales[id] as Final;
    if (evaluateCondition(final.condicion, vars)) return buildEnding(story, id, vars);
  }
  return buildEnding(story, orden[orden.length - 1], vars);
}

// La regla de batería agotada solo se declara en un par de nodos, pero el
// frío se puede acabar en cualquier punto de la ruta del replicante: se
// aplica en todo el recorrido para que ese final no quede inalcanzable.
function reglaBateriaAgotada(story: StoryData) {
  for (const nodo of Object.values(story.nodos)) {
    if (nodo.reglas?.bateria_agotada) return nodo.reglas.bateria_agotada;
  }
  return undefined;
}

export function enterNode(story: StoryData, state: GameState, nodeId: string, prefijo = ''): GameState {
  const node = story.nodos[nodeId];
  if (!node) throw new Error(`Nodo desconocido: ${nodeId}`);

  let vars = { ...state.vars };
  if (node.ruta) vars.ruta = node.ruta;
  vars = applyEffects(story, vars, node.efectos);

  const { text, efectos: ramaEfectos, destino: ramaDestino } = resolveDisplayText(node, vars);
  vars = applyEffects(story, vars, ramaEfectos);

  const textoCompleto = prefijo ? `${prefijo}\n\n${text}` : text;

  const nextState: GameState = {
    ...state,
    currentNodeId: nodeId,
    vars,
    displayText: textoCompleto,
    ending: null,
  };

  const agotada = reglaBateriaAgotada(story);
  if (agotada && nodeId !== agotada.destino && evaluateCondition(agotada.si, vars)) {
    return enterNode(story, nextState, agotada.destino, textoCompleto);
  }

  // Un nodo que solo bifurca arrastra su texto al destino en vez de pedir
  // un clic intermedio (ver tipo "bifurcacion_automatica" en el guion).
  if (ramaDestino) {
    return enterNode(story, nextState, ramaDestino, textoCompleto);
  }

  if (node.resolucion?.startsWith('final:')) {
    const id = node.resolucion.slice('final:'.length);
    return { ...nextState, ending: buildEnding(story, id, vars) };
  }

  if (node.resolucion === 'evaluar_finales') {
    return { ...nextState, ending: evaluateFinal(story, vars) };
  }

  if (node.tipo === 'hub' && node.reglas?.destino_salida) {
    const progress = state.hubProgress[nodeId] ?? { visitedDestinos: [], visitCount: 0 };
    const forcedByBattery = node.reglas.salida_forzada_si
      ? evaluateCondition(node.reglas.salida_forzada_si, vars)
      : false;
    const exhausted = node.reglas.max_visitas != null && progress.visitCount >= node.reglas.max_visitas;

    if (forcedByBattery || exhausted) {
      return enterNode(story, nextState, node.reglas.destino_salida);
    }
  }

  return nextState;
}

export function visibleOptions(story: StoryData, state: GameState): Opcion[] {
  const node = story.nodos[state.currentNodeId];
  if (!node?.opciones) return [];
  const progress = state.hubProgress[state.currentNodeId];
  return node.opciones.filter((opcion) => {
    if (opcion.condicion && !evaluateCondition(opcion.condicion, state.vars)) return false;
    if (opcion.visitable_una_vez && progress?.visitedDestinos.includes(opcion.destino)) return false;
    const maxVisitas = node.reglas?.max_visitas;
    if (opcion.visitable_una_vez && maxVisitas != null && progress && progress.visitCount >= maxVisitas) {
      return false;
    }
    return true;
  });
}

export function choose(story: StoryData, state: GameState, opcion: Opcion): GameState {
  let vars = applyEffects(story, state.vars, opcion.efectos);
  let hubProgress = state.hubProgress;

  if (opcion.visitable_una_vez) {
    const hubId = state.currentNodeId;
    const progress = hubProgress[hubId] ?? { visitedDestinos: [], visitCount: 0 };
    hubProgress = {
      ...hubProgress,
      [hubId]: {
        visitedDestinos: [...progress.visitedDestinos, opcion.destino],
        visitCount: progress.visitCount + 1,
      },
    };
  }

  const stateWithEffects: GameState = { ...state, vars, hubProgress };
  return enterNode(story, stateWithEffects, opcion.destino);
}
