// Comprobación de integridad del guion. Se ejecuta con:
//   npx tsx scripts/validar-guion.ts
import { storyData } from '../src/data/story';
import { evaluateCondition } from '../src/engine/expression';
import { choose, createInitialState, visibleOptions, GameState } from '../src/engine/storyEngine';

const errores: string[] = [];
const nodos = storyData.nodos;
const ids = new Set(Object.keys(nodos));
const finalIds = new Set(Object.keys(storyData.finales).filter((k) => k !== 'orden_evaluacion'));

// 1. Todo destino apunta a un nodo existente, y toda condición parsea.
const alcanzables = new Set<string>([storyData.inicio]);
const pendientes = [storyData.inicio];

function comprobarCondicion(expr: string, donde: string) {
  try {
    evaluateCondition(expr, { bateria: 0, confianza: 0, ruta: '' });
  } catch (e) {
    errores.push(`Condición inválida en ${donde}: "${expr}" (${(e as Error).message})`);
  }
}

for (const [id, nodo] of Object.entries(nodos)) {
  const destinos: string[] = [];
  for (const o of nodo.opciones ?? []) {
    destinos.push(o.destino);
    if (o.condicion) comprobarCondicion(o.condicion, `${id} opción "${o.texto}"`);
  }
  for (const r of nodo.ramas ?? []) {
    comprobarCondicion(r.condicion, `${id} rama`);
    if (r.destino) destinos.push(r.destino);
  }
  if (nodo.reglas?.destino_salida) destinos.push(nodo.reglas.destino_salida);
  if (nodo.reglas?.bateria_agotada) {
    destinos.push(nodo.reglas.bateria_agotada.destino);
    comprobarCondicion(nodo.reglas.bateria_agotada.si, `${id} bateria_agotada`);
  }
  if (nodo.reglas?.salida_forzada_si) comprobarCondicion(nodo.reglas.salida_forzada_si, `${id} salida_forzada_si`);

  for (const d of destinos) {
    if (!ids.has(d)) errores.push(`Nodo "${id}" apunta a un destino inexistente: "${d}"`);
  }

  if (nodo.resolucion?.startsWith('final:')) {
    const fid = nodo.resolucion.slice(6);
    if (!finalIds.has(fid)) errores.push(`Nodo "${id}" apunta a un final inexistente: "${fid}"`);
  }

  // Un nodo sin opciones tiene que terminar la partida o encaminar por rama.
  if (!nodo.opciones?.length && !nodo.resolucion && !(nodo.ramas ?? []).some((r) => r.destino)) {
    errores.push(`Nodo "${id}" no tiene salida: ni opciones, ni resolución, ni rama con destino.`);
  }
}

// 2. Alcanzabilidad desde el inicio.
while (pendientes.length) {
  const id = pendientes.pop()!;
  const nodo = nodos[id];
  if (!nodo) continue;
  const siguientes = [
    ...(nodo.opciones ?? []).map((o) => o.destino),
    ...(nodo.ramas ?? []).map((r) => r.destino).filter(Boolean) as string[],
    ...(nodo.reglas?.destino_salida ? [nodo.reglas.destino_salida] : []),
    ...(nodo.reglas?.bateria_agotada ? [nodo.reglas.bateria_agotada.destino] : []),
  ];
  for (const d of siguientes) {
    if (!alcanzables.has(d)) {
      alcanzables.add(d);
      pendientes.push(d);
    }
  }
}
for (const id of ids) {
  if (!alcanzables.has(id)) errores.push(`Nodo huérfano (no se llega desde el inicio): "${id}"`);
}

// 3. Los finales declarados se usan en algún sitio.
const orden = storyData.finales.orden_evaluacion as string[];
const usados = new Set(orden);
for (const nodo of Object.values(nodos)) {
  if (nodo.resolucion?.startsWith('final:')) usados.add(nodo.resolucion.slice(6));
}
for (const fid of finalIds) {
  if (!usados.has(fid)) errores.push(`Final "${fid}" no se alcanza desde ningún nodo ni orden_evaluacion.`);
}

// 4. Exploración exhaustiva: qué finales se alcanzan de verdad jugando.
const finalesVistos = new Map<string, number>();
let partidas = 0;
const MAX = 60000;

function explorar(state: GameState, profundidad: number) {
  if (partidas > MAX) return;
  if (state.ending) {
    partidas++;
    finalesVistos.set(state.ending.id, (finalesVistos.get(state.ending.id) ?? 0) + 1);
    if (!state.ending.texto) errores.push(`Final "${state.ending.id}" sin texto para la ruta "${state.vars.ruta}".`);
    return;
  }
  if (profundidad > 40) {
    errores.push(`Recorrido demasiado largo, posible bucle en "${state.currentNodeId}".`);
    return;
  }
  const opciones = visibleOptions(storyData, state);
  if (!opciones.length) {
    errores.push(`Callejón sin salida jugable en "${state.currentNodeId}".`);
    return;
  }
  for (const o of opciones) explorar(choose(storyData, state, o), profundidad + 1);
}

explorar(createInitialState(storyData), 0);

console.log(`Nodos: ${ids.size} · partidas simuladas: ${partidas}`);
console.log('Finales alcanzados:');
for (const fid of [...finalIds].sort()) {
  const n = finalesVistos.get(fid) ?? 0;
  console.log(`  ${n > 0 ? 'OK ' : '!! '}${fid}: ${n}`);
  if (n === 0) errores.push(`Final "${fid}" no se alcanza en ninguna partida posible.`);
}

const unicos = [...new Set(errores)];
if (unicos.length) {
  console.log(`\n${unicos.length} problema(s):`);
  for (const e of unicos) console.log(`  - ${e}`);
  process.exit(1);
}
console.log('\nGuion consistente.');
