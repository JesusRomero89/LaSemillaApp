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
  // Una rama con destino encamina el nodo: se usa en nodos sin opciones
  // propias, que solo sirven para bifurcar (p. ej. m_05d_salida).
  destino?: string;
}

export interface ReglaBateriaAgotada {
  si: string;
  destino: string;
}

export interface ReglasNodo {
  max_visitas?: number;
  salida_forzada_si?: string;
  destino_salida?: string;
  bateria_agotada?: ReglaBateriaAgotada;
}

export interface Nodo {
  ruta?: Ruta;
  hora?: string;
  titulo?: string;
  texto: string;
  tipo?: 'hub' | 'convergencia' | 'decision_clave' | 'bifurcacion_automatica';
  efectos?: EfectosNodo;
  ramas?: Rama[];
  reglas?: ReglasNodo;
  opciones?: Opcion[];
  // "evaluar_finales" elige final por condiciones; "final:<id>" va directo
  // a ese final (muertes y cortes secos).
  resolucion?: string;
  nota?: string;
}

export interface Final {
  titulo: string;
  condicion: string;
  // Los finales directos solo traen el texto de la ruta en la que ocurren.
  texto_mora?: string;
  texto_replicante?: string;
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
