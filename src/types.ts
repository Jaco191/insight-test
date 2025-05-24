// src/types.ts

// Los colores posibles
export type Color = "Rojo" | "Amarillo" | "Verde" | "Azul";

// Las etiquetas de respuesta posibles
export type WeightLabel =
  | "Muy identificado"
  | "Bastante identificado"
  | "Poco identificado"
  | "Nada identificado";

// Una pregunta del test
export interface Question {
  id: number;
  text: string;
  color: Color;
}

// La respuesta de un usuario
export interface Answer {
  id: number;
  answer: WeightLabel;
}

// Las puntuaciones acumuladas por color
export interface Scores {
  Rojo: number;
  Amarillo: number;
  Verde: number;
  Azul: number;
  [key: string]: number;  // permite indexar con cualquier string
}

// Estilos resultantes
export interface Styles {
  dominante: Color;
  secundario: Color;
  consciente: Color;
  inconsciente: Color | "Mixto";
}

// El informe final
export interface Report {
  title: string;
  perfil: {
    dominante: Color;
    secundario: Color;
    consciente: Color;
    inconsciente: Color | "Mixto";
  };
  comportamientos: {
    buenDia: string;
    malDia: string;
  };
  recomendaciones: string;
  relacion: string;
  chartData: { name: Color; value: number }[];
}