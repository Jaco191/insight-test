import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Definición de colores y mapeo de opuestos
const COLORS = ["Rojo", "Amarillo", "Verde", "Azul"];
const OPPOSITES = { Rojo: "Verde", Verde: "Rojo", Amarillo: "Azul", Azul: "Amarillo" };
const WEIGHTS = { "Muy identificado": 3, "Bastante identificado": 2, "Poco identificado": 1, "Nada identificado": 0 };
const CHART_COLORS = { Rojo: "#e6194b", Amarillo: "#ffe119", Verde: "#3cb44b", Azul: "#4363d8" };

// 32 preguntas balanceadas (8 por color)
const questions = [
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
  { id: 32, text: "Establezco metas claras y delego responsabilidades para alcanzarlas.", color: "Rojo" }
];

const options = [
  { label: "Muy identificado" },
  { label: "Bastante identificado" },
  { label: "Poco identificado" },
  { label: "Nada identificado" }
];

function calculateScores(answers) {
  const scores = { Rojo: 0, Amarillo: 0, Verde: 0, Azul: 0 };
  answers.forEach(({ id, answer }) => {
    const question = questions.find(q => q.id === id);
    scores[question.color] += WEIGHTS[answer];
  });
  return scores;
}

function interpretStyles(scores) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0][0];
  const secondary = sorted[1][0];
  return { dominant, secondary, conscious: dominant, unconscious: secondary };
}

function generateReport(styles, scores) {
  const { dominant, secondary, conscious, unconscious } = styles;
  return {
    title: "Estilos de Comunicación Preferenciales",
    perfil: { dominante: dominant, secundario: secondary, consciente, inconsciente: unconscious },
    comportamientos: {
      buenDia: `En un buen día, tu estilo ${dominant} aporta energía, claridad y liderazgo, motivando al equipo y proponiendo soluciones con convicción.`,
      malDia: `En un mal día, tu estilo ${dominant} puede volverse autoritario o impaciente, generando tensiones si no moderas tu forma de comunicar.`
    },
    recomendaciones: `Combina tu ${conscious} con la empatía de ${secondary}. Practica escucha activa y modula tu tono para facilitar el diálogo.`,
    relacion: `Tu color opuesto es ${OPPOSITES[dominant]}. Adáptate usando un enfoque pausado y basado en datos para conectar eficazmente.`,
    chartData: COLORS.map(col => ({ name: col, value: scores[col] }))
  };
}

export default function CommunicationStylesTest() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const chartRef = useRef(null);

  const handleSelect = answer => {
    setAnswers(prev => [...prev, { id: questions[step].id, answer }]);
    setStep(prev => prev + 1);
  };

  if (step < questions.length) {
    const progress = Math.round((step / questions.length) * 100);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ width: '100%', backgroundColor: '#e0e0e0', height: '8px' }}>
          <div style={{ width: `${progress}%`, backgroundColor: '#3cb44b', height: '100%', transition: 'width 0.3s' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: 600, textAlign: 'center' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>{questions[step].text}</h2>
            <p style={{ marginBottom: '1rem', color: '#666' }}>{progress}% completado</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {options.map(opt => (
                <button key={opt.label} onClick={() => handleSelect(opt.label)} style={{ padding: '0.75rem', fontSize: '1rem', borderRadius: 4, cursor: 'pointer' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const scores = calculateScores(answers);
  const styles = interpretStyles(scores);
  const report = generateReport(styles, scores);

  const generatePDF = async () => {
    const canvas = await html2canvas(chartRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFontSize(18); doc.text(report.title, 40, 60);
    doc.setFontSize(12);
    doc.text(`Dominante: ${report.perfil.dominante}`, 40, 90);
    doc.text(`Secundario: ${report.perfil.secundario}`, 40, 110);
    doc.text(`Consciente: ${report.perfil.consciente}`, 40, 130);
    doc.text(`Inconsciente: ${report.perfil.inconsciente}`, 40, 150);
    doc.text(report.comportamientos.buenDia, 40, 180);
    doc.text(report.comportamientos.malDia, 40, 200);
    doc.text(report.recomendaciones, 40, 220);
    doc.text(report.relacion, 40, 240);
    const props = doc.getImageProperties(imgData);
    const pdfWidth = doc.internal.pageSize.getWidth() - 80;
    const pdfHeight = (props.height * pdfWidth) / props.width;
    doc.addImage(imgData, 'PNG', 40, 260, pdfWidth, pdfHeight);
    doc.save('Estilos_Comunicacion_Preferenciales.pdf');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem' }}>
      <h1 style={{ textAlign: 'center' }}>{report.title}</h1>
      <p style={{ textAlign: 'center' }}>Dominante: {report.perfil.dominante} | Secundario: {report.perfil.secundario}</p>
      <p style={{ textAlign: 'center' }}>Consciente: {report.perfil.consciente} | Inconsciente: {report.perfil.inconsciente}</p>
      <div style={{ maxWidth: 600, width: '100%' }}>
        <h2>Comportamientos</h2>
        <p><strong>Buen día:</strong> {report.comportamientos.buenDia}</p>
        <p><strong>Mal día:</strong> {report.comportamientos.malDia}</p>
        <h2>Recomendaciones</h2>
        <p>{report.recomendaciones}</p>
        <h2>Relación con tu color opuesto</h2>
        <p>{report.relacion}</p>
        <h2 ref={chartRef}>Gráfica de puntuaciones</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={report.chartData} dataKey="value" nameKey="name" outerRadius={100} label startAngle={45} endAngle={-315}>
                {report.chartData.map(entry => <Cell key={entry.name} fill={CHART_COLORS[entry.name]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <button onClick={generatePDF} style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', fontSize: '1rem', borderRadius: 4, cursor: 'pointer' }}>
          Descargar informe
        </button>
      </div>
    </div>
  );
}