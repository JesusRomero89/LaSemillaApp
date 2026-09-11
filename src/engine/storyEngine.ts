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

function resolveDisplayText(node: Nodo, vars: Record<string, VariableValue>): { text: string; efectos?: EfectosNodo } {
  let text = node.texto;
  let ramaEfectos: EfectosNodo | undefined;
  if (node.ramas) {
    for (const rama of node.ramas) {
      if (evaluateCondition(rama.condicion, vars)) {
        if (rama.texto) text = `${text}\n\n${rama.texto}`;
        ramaEfectos = rama.efectos;
        break;
      }
    }
  }
  return { text, efectos: ramaEfectos };
}

function evaluateFinal(story: StoryData, vars: Record<string, VariableValue>): EndingResult {
  const orden = story.finales.orden_evaluacion as string[];
  const ruta = vars.ruta as string;
  for (const id of orden) {
    const final = story.finales[id] as Final;
    if (evaluateCondition(final.condicion, vars)) {
      return {
        id,
        titulo: final.titulo,
        texto: ruta === 'mora' ? final.texto_mora : final.texto_replicante,
      };
    }
  }
  const fallbackId = orden[orden.length - 1];
  const fallback = story.finales[fallbackId] as Final;
  return {
    id: fallbackId,
    titulo: fallback.titulo,
    texto: ruta === 'mora' ? fallback.texto_mora : fallback.texto_replicante,
  };
}

export function enterNode(story: StoryData, state: GameState, nodeId: string): GameState {
  const node = story.nodos[nodeId];
  if (!node) throw new Error(`Nodo desconocido: ${nodeId}`);

  let vars = { ...state.vars };
  if (node.ruta) vars.ruta = node.ruta;
  vars = applyEffects(story, vars, node.efectos);

  const { text, efectos: ramaEfectos } = resolveDisplayText(node, vars);
  vars = applyEffects(story, vars, ramaEfectos);

  let nextState: GameState = {
    ...state,
    currentNodeId: nodeId,
    vars,
    displayText: text,
    ending: null,
  };

  if (node.resolucion === 'evaluar_finales') {
    nextState = { ...nextState, ending: evaluateFinal(story, vars) };
    return nextState;
  }

  if (node.tipo === 'hub') {
    const progress = state.hubProgress[nodeId] ?? { visitedDestinos: [], visitCount: 0 };
    const forcedByBattery = node.reglas?.salida_forzada_si
      ? evaluateCondition(node.reglas.salida_forzada_si, vars)
      : false;
    const exhausted = !!node.reglas && progress.visitCount >= node.reglas.max_visitas;

    if (node.reglas && (forcedByBattery || exhausted)) {
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
    if (opcion.visitable_una_vez && node.reglas && progress && progress.visitCount >= node.reglas.max_visitas) {
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
