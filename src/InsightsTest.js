import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Definición de colores y mapeo de opuestos
const COLORS = ["Rojo", "Amarillo", "Verde", "Azul"];
const OPPOSITES = { Rojo: "Verde", Verde: "Rojo", Amarillo: "Azul", Azul: "Amarillo" };
const WEIGHTS = { "Totalmente de acuerdo": 3, "De acuerdo": 2, "En desacuerdo": 1, "Para nada de acuerdo": 0 };
const CHART_COLORS = { Rojo: "#e6194b", Amarillo: "#ffe119", Verde: "#3cb44b", Azul: "#4363d8" };

// 25 preguntas para identificar estilos de comunicación
const questions = [
  { id: 1, text: "Cuando participo en una reunión, suelo expresar mis ideas con firmeza." },
  { id: 2, text: "Me encanta animar y motivar a los demás con mi energía." },
  { id: 3, text: "Prefiero planificar cada paso antes de lanzarme a la acción." },
  { id: 4, text: "Me adapto fácilmente cuando cambian las circunstancias." },
  { id: 5, text: "Me baso en datos y hechos antes de tomar una decisión." },
  { id: 6, text: "Cuando lidero un equipo, me centro en resultados y objetivos." },
  { id: 7, text: "Valoro más la armonía y la colaboración que el conflicto." },
  { id: 8, text: "Me siento cómodo asumiendo riesgos y tomando la iniciativa." },
  { id: 9, text: "Suelo ofrecer apoyo y escucha cuando otros comparten sus problemas." },
  { id: 10, text: "Tengo tendencia a centrarme en la visión global en lugar de los detalles." },
  { id: 11, text: "Me esfuerzo por asegurarme de que todos se sientan incluidos." },
  { id: 12, text: "Cuando hablo, uso ejemplos concretos para apoyar mis argumentos." },
  { id: 13, text: "Disfruto trabajando en proyectos que requieren creatividad e innovación." },
  { id: 14, text: "Me siento incómodo con la improvisación y prefiero seguir procedimientos." },
  { id: 15, text: "Me gusta inspirar a otros y persuadirlos para que sigan mi visión." },
  { id: 16, text: "Cuando tomo decisiones, considero siempre el impacto en las personas." },
  { id: 17, text: "Me centro en medir resultados y en establecer métricas claras." },
  { id: 18, text: "Mantengo la calma bajo presión y busco soluciones prácticas." },
  { id: 19, text: "Busco retroalimentación constructiva y comparto mis descubrimientos." },
  { id: 20, text: "Suelo ser directo y claro, incluso con noticias difíciles." },
  { id: 21, text: "Disfruto incluyendo detalles y contexto para asegurar comprensión." },
  { id: 22, text: "Inspiro confianza mostrando mi entusiasmo y pasión." },
  { id: 23, text: "Me esfuerzo por escuchar activamente sin interrumpir a los demás." },
  { id: 24, text: "Me hago responsable de mis errores y busco soluciones inmediatas." },
  { id: 25, text: "Cuando algo no sale según lo planeado, analizo detenidamente cada detalle antes de actuar." }
];

const options = [
  { label: "Totalmente de acuerdo" },
  { label: "De acuerdo" },
  { label: "En desacuerdo" },
  { label: "Para nada de acuerdo" }
];

// Calcula puntuaciones por color
function calculateScores(answers) {
  const scores = { Rojo: 0, Amarillo: 0, Verde: 0, Azul: 0 };
  answers.forEach(({ id, answer }) => {
    const color = mapQuestionToColor(id);
    scores[color] += WEIGHTS[answer];
  });
  return scores;
}

// Mapea pregunta a color (basado en orden)
function mapQuestionToColor(id) {
  const colorIndex = (id - 1) % COLORS.length;
  return COLORS[colorIndex];
}

// Interpreta estilos consciente e inconsciente
function interpretStyles(scores) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return { dominant: sorted[0][0], secondary: sorted[1][0] };
}

// Genera informe con recomendaciones y gráfica
function generateReport(interpretation, scores) {
  const { dominant, secondary } = interpretation;
  return {
    title: "Estilos de Comunicación Preferenciales",
    perfil: `Color dominante: ${dominant}. Color secundario: ${secondary}.`,
    comportamientos: {
      buenDia: `Cuando estás en un buen día, tu estilo ${dominant} aporta claridad y liderazgo.`,
      malDia: `En un mal día, tu estilo ${dominant} puede volverse impaciente y rígido.`
    },
    recomendaciones: `Para mejorar tu comunicación, combina tu ${dominant} con la empatía de ${secondary}. Practica la escucha activa y la flexibilidad.`,
    relacion: `Tu color opuesto es ${OPPOSITES[dominant]}. Para conectar mejor, adapta tu tono al hacerlo más pausado y detallado.`,
    chartData: COLORS.map(col => ({ name: col, value: scores[col] })),
  };
}

// Componente principal
export default function CommunicationStylesTest() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const chartRef = useRef(null);

  const handleSelect = (answer) => {
    setAnswers([...answers, { id: questions[step].id, answer }]);
    setStep(step + 1);
  };

  if (step < questions.length) {
    return (
      <div className="test-container">
        <h2>{questions[step].text}</h2>
        <div className="options">
          {options.map(opt => (
            <button key={opt.label} onClick={() => handleSelect(opt.label)}>{opt.label}</button>
          ))}
        </div>
      </div>
    );
  }

  // Cálculo final\  
  const scores = calculateScores(answers);
  const interpretation = interpretStyles(scores);
  const report = generateReport(interpretation, scores);

  // Generar PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(report.title, 10, 20);
    doc.setFontSize(12);
    doc.text(report.perfil, 10, 30);
    doc.text(report.comportamientos.buenDia, 10, 40);
    doc.text(report.comportamientos.malDia, 10, 50);
    doc.text(report.recomendaciones, 10, 60);
    doc.text(report.relacion, 10, 70);
    const canvas = chartRef.current.querySelector('canvas');
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 10, 80, 180, 90);
    doc.save('Estilos_Comunicacion_Preferenciales.pdf');
  };

  return (
    <div className="report-container">
      <h1>{report.title}</h1>
      <p>{report.perfil}</p>
      <h2>Comportamientos</h2>
      <p><strong>Buen día:</strong> {report.comportamientos.buenDia}</p>
      <p><strong>Mal día:</strong> {report.comportamientos.malDia}</p>
      <h2>Recomendaciones</h2>
      <p>{report.recomendaciones}</p>
      <h2>Relación con tu color opuesto</h2>
      <p>{report.relacion}</p>
      <h2>Gráfica de puntuaciones</h2>
      <div ref={chartRef} style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={report.chartData} dataKey="value" nameKey="name" outerRadius={100} label>
              {report.chartData.map(entry => (
                <Cell key={entry.name} fill={CHART_COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <button onClick={generatePDF}>Descargar informe</button>
    </div>
  );
}
