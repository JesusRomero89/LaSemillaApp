import type { StoryData, VariableValue } from '../types/story';

// El guion escribe {nombre} donde va el nombre del replicante, que depende
// de la variable genero.
export function nombreReplicante(story: StoryData, vars: Record<string, VariableValue>): string {
  const p = story.personajes.replicante;
  return (vars.genero === 'f' ? p.nombre_f : p.nombre_m) ?? '';
}

export function aplicarTokens(
  texto: string,
  story: StoryData,
  vars: Record<string, VariableValue>
): string {
  return texto.replace(/\{nombre\}/g, nombreReplicante(story, vars));
}
