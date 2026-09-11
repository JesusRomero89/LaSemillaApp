export type Ruta = 'replicante' | 'mora';

export type VariableValue = string | number | boolean;

export interface VariableDef {
  tipo: 'string' | 'int' | 'bool';
  inicial: VariableValue;
  valores?: string[];
  unidad?: string;
  nota?: string;
  rango?: [number, number];
}

export type EfectosNodo = Record<string, VariableValue>;

export interface Opcion {
  texto: string;
  destino: string;
  efectos?: EfectosNodo;
  condicion?: string;
  visitable_una_vez?: boolean;
}

export interface Rama {
  condicion: string;
  texto?: string;
  efectos?: EfectosNodo;
}

export interface ReglasHub {
  max_visitas: number;
  salida_forzada_si?: string;
  destino_salida: string;
}

export interface Nodo {
  ruta?: Ruta;
  hora?: string;
  titulo?: string;
  texto: string;
  tipo?: 'hub' | 'convergencia' | 'decision_clave';
  efectos?: EfectosNodo;
  ramas?: Rama[];
  reglas?: ReglasHub;
  opciones?: Opcion[];
  resolucion?: 'evaluar_finales';
}

export interface Final {
  titulo: string;
  condicion: string;
  texto_mora: string;
  texto_replicante: string;
}

export interface Personaje {
  id: string;
  nombre?: string;
  nombre_m?: string;
  nombre_f?: string;
  rol: string;
  motivacion?: string;
  estado?: string;
  notas?: string;
}

export interface StoryData {
  meta: {
    id: string;
    titulo: string;
    version: string;
    idioma: string;
    ambientacion: string;
    notas?: string;
  };
  mundo: Record<string, unknown>;
  personajes: Record<string, Personaje>;
  variables: Record<string, VariableDef>;
  inicio: string;
  nodos: Record<string, Nodo>;
  finales: {
    orden_evaluacion: string[];
    [key: string]: Final | string[];
  };
}
