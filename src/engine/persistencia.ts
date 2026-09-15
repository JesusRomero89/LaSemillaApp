import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoryData } from '../types/story';
import { initialPersistentes, Persistentes } from './storyEngine';

const CLAVE = 'la-semilla:persistentes:v1';

// Las marcas persistentes son pocas y siempre booleanas. Se guardan aparte
// de la partida: sobreviven al final y se leen en la siguiente.
export async function cargarPersistentes(story: StoryData): Promise<Persistentes> {
  const base = initialPersistentes(story);
  try {
    const crudo = await AsyncStorage.getItem(CLAVE);
    if (!crudo) return base;
    const guardado = JSON.parse(crudo) as Record<string, unknown>;
    const resultado: Persistentes = { ...base };
    for (const key of Object.keys(base)) {
      if (typeof guardado[key] === 'boolean') resultado[key] = guardado[key] as boolean;
    }
    return resultado;
  } catch {
    // Si el almacenamiento falla o trae basura, se juega sin marcas: es
    // contenido de sabor, nunca decide un final.
    return base;
  }
}

export async function guardarPersistentes(valores: Persistentes): Promise<void> {
  try {
    await AsyncStorage.setItem(CLAVE, JSON.stringify(valores));
  } catch {
    // Ignorado a propósito: no poder guardar no debe romper la partida.
  }
}

export async function borrarPersistentes(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CLAVE);
  } catch {
    // Ignorado a propósito.
  }
}
