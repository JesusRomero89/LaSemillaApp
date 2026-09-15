import type { EfectosNodo, Nodo, Opcion, StoryData, VariableValue, Final } from '../types/story';
import { evaluateCondition } from './expression';

const PREFIJO_PERSISTENTE = 'persistente.';

export interface HubProgress {
  visitedDestinos: string[];
  visitCount: number;
  // Reglas del hub que ya se han consumido (p. ej. tras_primera_visita).
  reglasConsumidas: string[];
}

export interface EndingResult {
  id: string;
  titulo: string;
  texto: string;
}

export type Persistentes = Record<string, boolean>;

export interface GameState {
  currentNodeId: string;
  vars: Record<string, VariableValue>;
  persistentes: Persistentes;
  hubProgress: Record<string, HubProgress>;
  displayText: string;
  ending: EndingResult | null;
}

export function initialPersistentes(story: StoryData): Persistentes {
  const p: Persistentes = {};
  for (const [key, def] of Object.entries(story.persistentes)) p[key] = def.inicial;
  return p;
}

function initialVars(story: StoryData): Record<string, VariableValue> {
  const vars: Record<string, VariableValue> = { ruta: '' };
  for (const [key, def] of Object.entries(story.variables)) vars[key] = def.inicial;
  return vars;
}

export function createInitialState(story: StoryData, persistentes?: Persistentes): GameState {
  const state: GameState = {
    currentNodeId: story.inicio,
    vars: initialVars(story),
    persistentes: persistentes ?? initialPersistentes(story),
    hubProgress: {},
    displayText: '',
    ending: null,
  };
  return enterNode(story, state, story.inicio);
}

// Las condiciones leen las marcas persistentes con su nombre completo,
// así que se vuelcan al mismo diccionario que las variables normales.
function scope(state: Pick<GameState, 'vars' | 'persistentes'>): Record<string, VariableValue> {
  const s: Record<string, VariableValue> = { ...state.vars };
  for (const [key, value] of Object.entries(state.persistentes)) {
    s[`${PREFIJO_PERSISTENTE}${key}`] = value;
  }
  return s;
}

interface Estado {
  vars: Record<string, VariableValue>;
  persistentes: Persistentes;
}

function applyEffects(story: StoryData, estado: Estado, efectos?: EfectosNodo): Estado {
  if (!efectos) return estado;
  const vars = { ...estado.vars };
  let persistentes = estado.persistentes;

  for (const [key, value] of Object.entries(efectos)) {
    if (key.startsWith(PREFIJO_PERSISTENTE)) {
      persistentes = { ...persistentes, [key.slice(PREFIJO_PERSISTENTE.length)]: Boolean(value) };
      continue;
    }
    const def = story.variables[key];
    if (def && def.tipo === 'int') {
      const current = typeof vars[key] === 'number' ? (vars[key] as number) : 0;
      const [min, max] = def.rango ?? [0, Infinity];
      vars[key] = Math.max(min, Math.min(max, current + Number(value)));
    } else {
      vars[key] = value;
    }
  }
  return { vars, persistentes };
}

// Reloj: el coste del trayecto se descuenta al entrar y, si el nodo es una
// parada con corriente, se suma su recarga.
function applyClock(estado: Estado, node: Nodo): Estado {
  if (node.minutos == null && node.recarga == null) return estado;
  const actual = typeof estado.vars.bateria === 'number' ? estado.vars.bateria : 0;
  const total = actual - (node.minutos ?? 0) + (node.recarga ?? 0);
  return { ...estado, vars: { ...estado.vars, bateria: Math.max(0, total) } };
}

interface RamasResueltas {
  textos: string[];
  estado: Estado;
  destino?: string;
}

// Todas las ramas que cumplen aportan su texto y sus efectos. Las cadenas
// tipo si/si-no del guion son mutuamente excluyentes, así que solo entra
// una; las que son detalles sueltos se acumulan, que es lo que se busca.
function resolveRamas(node: Nodo, estado: Estado, story: StoryData): RamasResueltas {
  const textos: string[] = [];
  let destino: string | undefined;
  let actual = estado;

  for (const rama of node.ramas ?? []) {
    if (!evaluateCondition(rama.condicion, scope(actual))) continue;
    if (rama.texto) textos.push(rama.texto);
    actual = applyEffects(story, actual, rama.efectos);
    if (!destino) destino = rama.destino;
  }
  return { textos, estado: actual, destino };
}

function buildEnding(story: StoryData, id: string, estado: Estado): { ending: EndingResult; estado: Estado } {
  const final = story.finales[id] as Final;
  const ruta = estado.vars.ruta as string;
  const texto = (ruta === 'mora' ? final.texto_mora : final.texto_replicante) ?? '';
  return {
    ending: { id, titulo: final.titulo, texto },
    estado: applyEffects(story, estado, final.efectos),
  };
}

function evaluateFinal(story: StoryData, estado: Estado) {
  const orden = story.finales.orden_evaluacion as string[];
  for (const id of orden) {
    const final = story.finales[id] as Final;
    if (evaluateCondition(final.condicion, scope(estado))) return buildEnding(story, id, estado);
  }
  return buildEnding(story, orden[orden.length - 1], estado);
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

function progresoDe(state: GameState, nodeId: string): HubProgress {
  return state.hubProgress[nodeId] ?? { visitedDestinos: [], visitCount: 0, reglasConsumidas: [] };
}

export function enterNode(story: StoryData, state: GameState, nodeId: string, prefijo = ''): GameState {
  const node = story.nodos[nodeId];
  if (!node) throw new Error(`Nodo desconocido: ${nodeId}`);

  let estado: Estado = { vars: { ...state.vars }, persistentes: state.persistentes };
  if (node.ruta) estado.vars.ruta = node.ruta;
  estado = applyClock(estado, node);
  estado = applyEffects(story, estado, node.efectos);

  const { textos, estado: trasRamas, destino: ramaDestino } = resolveRamas(node, estado, story);
  estado = trasRamas;

  const partes = [prefijo, node.texto, ...textos].filter(Boolean);
  const textoCompleto = partes.join('\n\n');

  const nextState: GameState = {
    ...state,
    currentNodeId: nodeId,
    vars: estado.vars,
    persistentes: estado.persistentes,
    displayText: textoCompleto,
    ending: null,
  };

  const agotada = reglaBateriaAgotada(story);
  if (agotada && nodeId !== agotada.destino && evaluateCondition(agotada.si, scope(estado))) {
    return enterNode(story, nextState, agotada.destino, textoCompleto);
  }

  // Un nodo que solo bifurca arrastra su texto al destino en vez de pedir
  // un clic intermedio (ver tipo "bifurcacion_automatica" en el guion).
  if (ramaDestino) return enterNode(story, nextState, ramaDestino, textoCompleto);

  if (node.resolucion?.startsWith('final:')) {
    const { ending, estado: final } = buildEnding(story, node.resolucion.slice('final:'.length), estado);
    return { ...nextState, vars: final.vars, persistentes: final.persistentes, ending };
  }

  if (node.resolucion === 'evaluar_finales') {
    const { ending, estado: final } = evaluateFinal(story, estado);
    return { ...nextState, vars: final.vars, persistentes: final.persistentes, ending };
  }

  if (node.tipo === 'hub' && node.reglas) {
    const progress = progresoDe(state, nodeId);
    const { tras_primera_visita: tras, destino_salida: salida, salida_forzada_si, max_visitas } = node.reglas;

    if (tras && progress.visitCount >= 1 && !progress.reglasConsumidas.includes('tras_primera_visita')) {
      const consumido: GameState = {
        ...nextState,
        hubProgress: {
          ...nextState.hubProgress,
          [nodeId]: { ...progress, reglasConsumidas: [...progress.reglasConsumidas, 'tras_primera_visita'] },
        },
      };
      return enterNode(story, consumido, tras.destino, textoCompleto);
    }

    if (salida) {
      const forzada = salida_forzada_si ? evaluateCondition(salida_forzada_si, scope(estado)) : false;
      const agotado = max_visitas != null && progress.visitCount >= max_visitas;
      if (forzada || agotado) return enterNode(story, nextState, salida);
    }
  }

  return nextState;
}

export function visibleOptions(story: StoryData, state: GameState): Opcion[] {
  const node = story.nodos[state.currentNodeId];
  if (!node?.opciones) return [];
  const progress = state.hubProgress[state.currentNodeId];
  const s = scope(state);
  return node.opciones.filter((opcion) => {
    if (opcion.condicion && !evaluateCondition(opcion.condicion, s)) return false;
    if (opcion.visitable_una_vez && progress?.visitedDestinos.includes(opcion.destino)) return false;
    const maxVisitas = node.reglas?.max_visitas;
    if (opcion.visitable_una_vez && maxVisitas != null && progress && progress.visitCount >= maxVisitas) {
      return false;
    }
    return true;
  });
}

export function choose(story: StoryData, state: GameState, opcion: Opcion): GameState {
  const estado = applyEffects(story, { vars: state.vars, persistentes: state.persistentes }, opcion.efectos);
  let hubProgress = state.hubProgress;

  if (opcion.visitable_una_vez) {
    const hubId = state.currentNodeId;
    const progress = progresoDe(state, hubId);
    hubProgress = {
      ...hubProgress,
      [hubId]: {
        ...progress,
        visitedDestinos: [...progress.visitedDestinos, opcion.destino],
        visitCount: progress.visitCount + 1,
      },
    };
  }

  const conEfectos: GameState = {
    ...state,
    vars: estado.vars,
    persistentes: estado.persistentes,
    hubProgress,
  };
  return enterNode(story, conEfectos, opcion.destino);
}
