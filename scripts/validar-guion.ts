// Comprobación de integridad del guion. Se ejecuta con:
//   npx tsx scripts/validar-guion.ts
import { storyData } from '../src/data/story';
import { evaluateCondition } from '../src/engine/expression';
import {
  choose,
  createInitialState,
  initialPersistentes,
  visibleOptions,
  GameState,
  Persistentes,
} from '../src/engine/storyEngine';

const errores: string[] = [];
const nodos = storyData.nodos;
const ids = new Set(Object.keys(nodos));
const finalIds = new Set(Object.keys(storyData.finales).filter((k) => k !== 'orden_evaluacion'));

const scopeFalso: Record<string, string | number | boolean> = { bateria: 0, confianza: 0, ruta: '' };
for (const k of Object.keys(storyData.persistentes)) scopeFalso[`persistente.${k}`] = false;

function comprobarCondicion(expr: string, donde: string) {
  try {
    evaluateCondition(expr, scopeFalso);
  } catch (e) {
    errores.push(`Condición inválida en ${donde}: "${expr}" (${(e as Error).message})`);
  }
}

// Nombres de variables y marcas que el guion declara.
const declaradas = new Set(Object.keys(storyData.variables));
const persistentesDeclaradas = new Set(Object.keys(storyData.persistentes));

function comprobarEfectos(efectos: Record<string, unknown> | undefined, donde: string) {
  for (const key of Object.keys(efectos ?? {})) {
    if (key.startsWith('persistente.')) {
      if (!persistentesDeclaradas.has(key.slice('persistente.'.length))) {
        errores.push(`Marca persistente no declarada en ${donde}: "${key}"`);
      }
    } else if (!declaradas.has(key)) {
      errores.push(`Variable no declarada en ${donde}: "${key}"`);
    }
  }
}

// 1. Destinos existentes, condiciones parseables, efectos sobre nombres reales.
for (const [id, nodo] of Object.entries(nodos)) {
  const destinos: string[] = [];
  comprobarEfectos(nodo.efectos, `${id} efectos`);
  for (const o of nodo.opciones ?? []) {
    destinos.push(o.destino);
    comprobarEfectos(o.efectos, `${id} opción "${o.texto}"`);
    if (o.condicion) comprobarCondicion(o.condicion, `${id} opción "${o.texto}"`);
  }
  for (const r of nodo.ramas ?? []) {
    comprobarCondicion(r.condicion, `${id} rama`);
    comprobarEfectos(r.efectos, `${id} rama`);
    if (r.destino) destinos.push(r.destino);
  }
  if (nodo.reglas?.destino_salida) destinos.push(nodo.reglas.destino_salida);
  if (nodo.reglas?.tras_primera_visita) destinos.push(nodo.reglas.tras_primera_visita.destino);
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

  if (!nodo.opciones?.length && !nodo.resolucion && !(nodo.ramas ?? []).some((r) => r.destino)) {
    errores.push(`Nodo "${id}" no tiene salida: ni opciones, ni resolución, ni rama con destino.`);
  }
}

for (const fid of finalIds) {
  const final = storyData.finales[fid] as { efectos?: Record<string, unknown> };
  comprobarEfectos(final.efectos, `final ${fid}`);
}

// 2. Alcanzabilidad estática desde el inicio.
const alcanzables = new Set<string>([storyData.inicio]);
const pendientes = [storyData.inicio];
while (pendientes.length) {
  const nodo = nodos[pendientes.pop()!];
  if (!nodo) continue;
  const siguientes = [
    ...(nodo.opciones ?? []).map((o) => o.destino),
    ...((nodo.ramas ?? []).map((r) => r.destino).filter(Boolean) as string[]),
    ...(nodo.reglas?.destino_salida ? [nodo.reglas.destino_salida] : []),
    ...(nodo.reglas?.tras_primera_visita ? [nodo.reglas.tras_primera_visita.destino] : []),
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

// 3. Cobertura exhaustiva. Se deduplican estados equivalentes: sin eso el
// número de caminos explota y la búsqueda se corta antes de llegar al
// final de la ruta de Mora, dando por inalcanzable lo que no lo es.
function firma(state: GameState): string {
  return JSON.stringify([
    state.currentNodeId,
    Object.entries(state.vars).sort(),
    Object.entries(state.persistentes).sort(),
    Object.entries(state.hubProgress)
      .map(([k, v]) => [k, [...v.visitedDestinos].sort(), v.visitCount, [...v.reglasConsumidas].sort()])
      .sort(),
    state.ending?.id ?? null,
  ]);
}

const nodosVistos = new Set<string>();
const finalesVistos = new Set<string>();
let bateriaMinima = Infinity;
let estadosVisitados = 0;

function cubrir(persistentes: Persistentes) {
  const vistos = new Set<string>();
  const cola: GameState[] = [createInitialState(storyData, persistentes)];

  while (cola.length) {
    const state = cola.pop()!;
    const f = firma(state);
    if (vistos.has(f)) continue;
    vistos.add(f);
    estadosVisitados++;

    nodosVistos.add(state.currentNodeId);
    if (state.vars.ruta === 'replicante') {
      bateriaMinima = Math.min(bateriaMinima, state.vars.bateria as number);
    }

    if (state.ending) {
      finalesVistos.add(state.ending.id);
      if (!state.ending.texto) {
        errores.push(`Final "${state.ending.id}" sin texto para la ruta "${state.vars.ruta}".`);
      }
      continue;
    }

    const opciones = visibleOptions(storyData, state);
    if (!opciones.length) {
      errores.push(`Callejón sin salida jugable en "${state.currentNodeId}".`);
      continue;
    }
    for (const o of opciones) cola.push(choose(storyData, state, o));
  }
}

cubrir(initialPersistentes(storyData));
// Segunda pasada con las marcas activas: cubre las ramas de memoria.
cubrir({ mora_cayo: true, teo_detenido: true, semilla_sembrada: true });

console.log(`Nodos: ${ids.size} · estados distintos explorados: ${estadosVisitados}`);
console.log(`Batería mínima alcanzada en la ruta del replicante: ${bateriaMinima}`);

for (const id of ids) {
  // Los nodos de bifurcación automática nunca se quedan en pantalla: su
  // texto se arrastra al destino, así que no aparecen como nodo actual.
  if (nodos[id].tipo === 'bifurcacion_automatica') continue;
  if (!nodosVistos.has(id)) errores.push(`Nodo inalcanzable jugando (aunque esté enlazado): "${id}"`);
}

console.log('Finales alcanzados:');
for (const fid of [...finalIds].sort()) {
  const ok = finalesVistos.has(fid);
  console.log(`  ${ok ? 'OK ' : '!! '}${fid}`);
  if (!ok) errores.push(`Final "${fid}" no se alcanza en ninguna partida posible.`);
}

// 4. Distribución aproximada, por muestreo aleatorio de partidas.
const reparto = new Map<string, number>();
const MUESTRAS = 20000;
for (let i = 0; i < MUESTRAS; i++) {
  let state = createInitialState(storyData, initialPersistentes(storyData));
  let pasos = 0;
  while (!state.ending && pasos++ < 60) {
    const opciones = visibleOptions(storyData, state);
    if (!opciones.length) break;
    state = choose(storyData, state, opciones[Math.floor(Math.random() * opciones.length)]);
  }
  if (state.ending) reparto.set(state.ending.id, (reparto.get(state.ending.id) ?? 0) + 1);
}
console.log(`\nReparto en ${MUESTRAS} partidas al azar:`);
for (const [fid, n] of [...reparto.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${fid}: ${((n / MUESTRAS) * 100).toFixed(1)}%`);
}

const unicos = [...new Set(errores)];
if (unicos.length) {
  console.log(`\n${unicos.length} problema(s):`);
  for (const e of unicos) console.log(`  - ${e}`);
  process.exit(1);
}
console.log('\nGuion consistente.');
