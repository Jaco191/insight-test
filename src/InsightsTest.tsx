import React, { useState, useRef, FormEvent } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import type {
  Color,
  Answer,
  Scores,
  Styles,
  Report,
  WeightLabel,
} from "./types";
import "./InsightsTest.css";

// Configuración
const COLORS: Color[] = ["Rojo", "Amarillo", "Verde", "Azul"];
const OPPOSITES: Record<Color, Color> = {
  Rojo: "Verde",
  Verde: "Rojo",
  Amarillo: "Azul",
  Azul: "Amarillo",
};
const WEIGHTS: Record<WeightLabel, number> = {
  "Muy identificado": 3,
  "Bastante identificado": 2,
  "Poco identificado": 1,
  "Nada identificado": 0,
};
const CHART_COLORS: Record<Color, string> = {
  Rojo: "#e6194b",
  Amarillo: "#ffe119",
  Verde: "#3cb44b",
  Azul: "#4363d8",
};

// Preguntas
type Question = { id: number; text: string; color: Color };
const questions: Question[] = [
  { id: 1, text: "Cuando participo en una reunión, suelo expresar mis ideas con firmeza, incluso si no todo el mundo está de acuerdo.", color: "Rojo" },
  { id: 2, text: "Me entusiasma contagiar mi energía cuando presento ideas a un grupo.", color: "Amarillo" },
  { id: 3, text: "Antes de actuar, necesito tener muy claro el proceso y los pasos a seguir.", color: "Azul" },
  { id: 4, text: "Me resulta natural adaptarme a lo que ocurre, incluso cuando cambian los planes de forma repentina.", color: "Verde" },
  { id: 5, text: "Tiendo a buscar datos concretos y evidencias antes de tomar una decisión.", color: "Azul" },
  { id: 6, text: "Cuando lidero, me enfoco en que se cumplan los objetivos sin desviarnos.", color: "Rojo" },
  { id: 7, text: "Me esfuerzo por mantener un ambiente armónico y evitar confrontaciones innecesarias.", color: "Verde" },
  { id: 8, text: "Me gusta iniciar proyectos nuevos, incluso si implican cierto riesgo o incertidumbre.", color: "Amarillo" },
  { id: 9, text: "Cuando alguien está pasando por un mal momento, me sale escuchar con empatía y sin juzgar.", color: "Verde" },
  { id: 10, text: "Prefiero centrarme en la visión general más que en los detalles minuciosos.", color: "Amarillo" },
  { id: 11, text: "Procuro que todas las personas del equipo se sientan tenidas en cuenta.", color: "Verde" },
  { id: 12, text: "Uso ejemplos concretos y verificables cuando explico mis argumentos.", color: "Azul" },
  { id: 13, text: "Disfruto proponiendo ideas nuevas y creativas, aunque parezcan poco convencionales.", color: "Amarillo" },
  { id: 14, text: "Me siento incómodo cuando hay que improvisar sin planificación previa.", color: "Azul" },
  { id: 15, text: "Me gusta inspirar a otros a través de una visión compartida que genere ilusión.", color: "Amarillo" },
  { id: 16, text: "Antes de decidir, valoro cómo puede afectar emocionalmente a las personas implicadas.", color: "Verde" },
  { id: 17, text: "Me gusta trabajar con indicadores claros para medir avances y resultados.", color: "Rojo" },
  { id: 18, text: "Cuando hay presión o conflicto, tiendo a mantener la calma y buscar soluciones prácticas.", color: "Azul" },
  { id: 19, text: "Comparto ideas y aprendizajes con entusiasmo para que otros puedan aprovecharlos.", color: "Amarillo" },
  { id: 20, text: "Puedo comunicar mensajes difíciles de forma directa, aunque no siempre sean bien recibidos.", color: "Rojo" },
  { id: 21, text: "Me esfuerzo en dar contexto y detalles para que todo el mundo comprenda bien la situación.", color: "Azul" },
  { id: 22, text: "Transmito confianza a los demás gracias a mi entusiasmo y actitud positiva.", color: "Amarillo" },
  { id: 23, text: "Escucho con atención y evito interrumpir, incluso cuando quiero aportar mi punto de vista.", color: "Verde" },
  { id: 24, text: "Cuando cometo un error, lo reconozco y busco cómo solucionarlo sin demora.", color: "Verde" },
  { id: 25, text: "Si algo no sale como esperaba, reviso con detalle qué ha fallado antes de tomar decisiones nuevas.", color: "Azul" },
  { id: 26, text: "Cuando quiero causar buena impresión, adapto mi forma de comunicarme al estilo del interlocutor.", color: "Rojo" },
  { id: 27, text: "En situaciones tensas, suelo volverme más impaciente o más directo de lo habitual.", color: "Rojo" },
  { id: 28, text: "Bajo presión, prefiero tomar decisiones rápidas en lugar de analizar cada posibilidad.", color: "Rojo" },
  { id: 29, text: "Cuando me siento juzgado, tiendo a guardar más silencio o a suavizar mis opiniones.", color: "Azul" },
  { id: 30, text: "En contextos sociales, soy más expresivo o extrovertido que cuando estoy en un entorno profesional.", color: "Amarillo" },
  { id: 31, text: "Verifico que mi trabajo esté libre de errores antes de presentarlo.", color: "Azul" },
  { id: 32, text: "Establezco metas claras y delego responsabilidades para alcanzarlas.", color: "Rojo" },
];

// Opciones de respuesta
const options: { label: WeightLabel }[] = [
  { label: "Muy identificado" },
  { label: "Bastante identificado" },
  { label: "Poco identificado" },
  { label: "Nada identificado" },
];

function calculateScores(answers: Answer[]): Scores {
  const scores: Scores = { Rojo: 0, Amarillo: 0, Verde: 0, Azul: 0 };
  answers.forEach(({ id, answer }) => {
    const question = questions.find((q) => q.id === id)!;
    const color = question.color;
    scores[color] += WEIGHTS[answer];
  });
  return scores;
}

function interpretStyles(scores: Scores): Styles {
  const entries = Object.entries(scores) as [Color, number][];
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const [dominante, secundario] = sorted;
  const delta = dominante[1] - secundario[1];
  const inconsciente: Color | "Mixto" = delta < 4 ? "Mixto" : secundario[0];
  return {
    dominante: dominante[0],
    secundario: secundario[0],
    consciente: dominante[0],
    inconsciente,
  };
}

function generateReport(styles: Styles, scores: Scores): Report {
  const { dominante, secundario, consciente, inconsciente } = styles;
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const chartData = COLORS.map((col) => ({ name: col, value: scores[col] }));
  return {
    title: "Estilos de Comunicación Preferenciales",
    perfil: { dominante, secundario, consciente, inconsciente },
    comportamientos: {
      buenDia: `En un buen día, tu estilo ${dominante} muestra lo mejor de ti: confianza, claridad y liderazgo, inspirando a tu equipo y facilitando decisiones efectivas.`,
      malDia: `En un mal día, tu estilo ${dominante} puede volverse excesivamente autoritario o impaciente, dificultando la colaboración y generando tensiones.`,
    },
    recomendaciones: `Para equilibrar tu estilo ${consciente}, practica la escucha activa, adapta tu tono al interlocutor y combina tu energía con la empatía de ${secundario}.`,
    relacion: `Tu color opuesto es ${OPPOSITES[dominante]}. Incorpora un enfoque pausado, basado en datos y en las emociones de los demás para conectar mejor.`,
    chartData,
  };
}

export default function CommunicationStylesTest() {
  const [name, setName] = useState<string>("");
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleStart = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) setStarted(true);
  };

  const handleSelect = (answer: WeightLabel) => {
    setAnswers((prev) => [...prev, { id: questions[step].id, answer }]);
    setStep((prev) => prev + 1);
  };

  // Página de inicio
  if (!started) {
    return (
      <div className="container">
        <h1>Test de Estilos de Comunicación</h1>
        <p>Responde pensando lo primero que se te venga a la cabeza.</p>
        <form onSubmit={handleStart} className="start-form">
          <input
            type="text"
            placeholder="Introduce tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit">Comenzar</button>
        </form>
      </div>
    );
  }

  // Cuestionario
  if (step < questions.length) {
    const progress = Math.round((step / questions.length) * 100);
    const question = questions[step];
    return (
      <div className="full-height">
        <h2>{name}, pregunta {step + 1} de {questions.length}</h2>
        <div className="progress-wrapper">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="question-section">
          <div className="question-card">
            <p>{question.text}</p>
            <div className="options-container">
              {options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleSelect(opt.label)}
                  className="option-button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Resultados
  const scores = calculateScores(answers);
  const styles = interpretStyles(scores);
  const report = generateReport(styles, scores);

    const generatePDF = async () => {
  if (!chartRef.current) return;
  const margin = 40;
  const pageWidth = 595.28; // ancho A4 en puntos
  const usableWidth = pageWidth - margin * 2;

  setTimeout(async () => {
    const canvas = await html2canvas(chartRef.current!, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    // 1. Título centrado y en negrita
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`${name} - ${report.title}`, pageWidth / 2, 60, {
      align: "center",
    });

    // 2. Perfil centrado
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Perfil: Dominante ${report.perfil.dominante}, Secundario ${report.perfil.secundario}`,
      pageWidth / 2,
      90,
      { align: "center", maxWidth: usableWidth }
    );

    // 3. Buen día
    doc.setFont("helvetica", "bold");
    doc.text("Buen día:", margin, 120);
    doc.setFont("helvetica", "normal");
    doc.text(report.comportamientos.buenDia, margin + 60, 120, {
      maxWidth: usableWidth - 60,
    });

    // 4. Mal día
    doc.setFont("helvetica", "bold");
    doc.text("Mal día:", margin, 150);
    doc.setFont("helvetica", "normal");
    doc.text(report.comportamientos.malDia, margin + 60, 150, {
      maxWidth: usableWidth - 60,
    });

    // 5. Recomendaciones
    doc.setFont("helvetica", "bold");
    doc.text("Recomendaciones:", margin, 180);
    doc.setFont("helvetica", "normal");
    doc.text(report.recomendaciones, margin + 120, 180, {
      maxWidth: usableWidth - 120,
    });

    // 6. Relación con opuesto
    doc.setFont("helvetica", "bold");
    doc.text("Relación con opuesto:", margin, 210);
    doc.setFont("helvetica", "normal");
    doc.text(report.relacion, margin + 160, 210, {
      maxWidth: usableWidth - 160,
    });

    // 7. Gráfica centrada
    const props = doc.getImageProperties(imgData);
    const imgWidth = usableWidth;
    const imgHeight = (props.height * imgWidth) / props.width;
    doc.addImage(imgData, "PNG", margin, 240, imgWidth, imgHeight);

    // 8. Guarda
    doc.save(`Test_Comunicacion_${name}.pdf`);
  }, 0);
};



return (
  <div className="report-container">
    <h1>{name}, tus resultados</h1>
    <p><strong>Perfil dominante:</strong> {report.perfil.dominante}</p>
    <p><strong>Perfil secundario:</strong> {report.perfil.secundario}</p>

    <div className="chart-container" ref={chartRef}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={report.chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            startAngle={45}
            endAngle={-315}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {report.chartData.map((entry) => (
              <Cell key={entry.name} fill={CHART_COLORS[entry.name]} />
            ))}
          </Pie>

          <Tooltip
            formatter={(value: number) => {
              const total = report.chartData.reduce((sum, e) => sum + e.value, 0);
              return [`${value}`, `${((value / total) * 100).toFixed(0)}%`];
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>

    <p><strong>Buen día:</strong> {report.comportamientos.buenDia}</p>
    <p><strong>Mal día:</strong> {report.comportamientos.malDia}</p>
    <p><strong>Recomendaciones:</strong> {report.recomendaciones}</p>
    <p><strong>Relación con color opuesto:</strong> {report.relacion}</p>

    <button onClick={generatePDF} className="option-button" style={{ marginTop: '1rem' }}>
      Descargar informe
    </button>
  </div>
);
}