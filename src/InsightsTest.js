import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Definición de colores y mapeo de opuestos
const COLORS = ["Rojo", "Amarillo", "Verde", "Azul"];
const OPPOSITES = { Rojo: "Verde", Verde: "Rojo", Amarillo: "Azul", Azul: "Amarillo" };
const WEIGHTS = { "Muy identificado": 3, "Bastante identificado": 2, "Poco identificado": 1, "Nada identificado": 0 };
const CHART_COLORS = { Rojo: "#e6194b", Amarillo: "#ffe119", Verde: "#3cb44b", Azul: "#4363d8" };

// 30 preguntas para identificar estilos de comunicación
const questions = [
  { id: 1, text: "Cuando participo en una reunión, suelo expresar mis ideas con firmeza, incluso si no todo el mundo está de acuerdo." },
  { id: 2, text: "Me entusiasma contagiar mi energía cuando presento ideas a un grupo." },
  { id: 3, text: "Antes de actuar, necesito tener muy claro el proceso y los pasos a seguir." },
  { id: 4, text: "Me resulta natural adaptarme a lo que ocurre, incluso cuando cambian los planes de forma repentina." },
  { id: 5, text: "Tiendo a buscar datos concretos y evidencias antes de tomar una decisión." },
  { id: 6, text: "Cuando lidero, me enfoco en que se cumplan los objetivos sin desviarnos." },
  { id: 7, text: "Me esfuerzo por mantener un ambiente armónico y evitar confrontaciones innecesarias." },
  { id: 8, text: "Me gusta iniciar proyectos nuevos, incluso si implican cierto riesgo o incertidumbre." },
  { id: 9, text: "Cuando alguien está pasando por un mal momento, me sale escuchar con empatía y sin juzgar." },
  { id: 10, text: "Prefiero centrarme en la visión general más que en los detalles minuciosos." },
  { id: 11, text: "Procuro que todas las personas del equipo se sientan tenidas en cuenta." },
  { id: 12, text: "Uso ejemplos concretos y verificables cuando explico mis argumentos." },
  { id: 13, text: "Disfruto proponiendo ideas nuevas y creativas, aunque parezcan poco convencionales." },
  { id: 14, text: "Me siento incómodo cuando hay que improvisar sin planificación previa." },
  { id: 15, text: "Me gusta inspirar a otros a través de una visión compartida que genere ilusión." },
  { id: 16, text: "Antes de decidir, valoro cómo puede afectar emocionalmente a las personas implicadas." },
  { id: 17, text: "Me gusta trabajar con indicadores claros para medir avances y resultados." },
  { id: 18, text: "Cuando hay presión o conflicto, tiendo a mantener la calma y buscar soluciones prácticas." },
  { id: 19, text: "Comparto ideas y aprendizajes con entusiasmo para que otros puedan aprovecharlos." },
  { id: 20, text: "Puedo comunicar mensajes difíciles de forma directa, aunque no siempre sean bien recibidos." },
  { id: 21, text: "Me esfuerzo en dar contexto y detalles para que todo el mundo comprenda bien la situación." },
  { id: 22, text: "Transmito confianza a los demás gracias a mi entusiasmo y actitud positiva." },
  { id: 23, text: "Escucho con atención y evito interrumpir, incluso cuando quiero aportar mi punto de vista." },
  { id: 24, text: "Cuando cometo un error, lo reconozco y busco cómo solucionarlo sin demora." },
  { id: 25, text: "Si algo no sale como esperaba, reviso con detalle qué ha fallado antes de tomar decisiones nuevas." },
  { id: 26, text: "Cuando quiero causar buena impresión, adapto mi forma de comunicarme al estilo del interlocutor." },
  { id: 27, text: "En situaciones tensas, suelo volverme más impaciente o más directo de lo habitual." },
  { id: 28, text: "Bajo presión, prefiero tomar decisiones rápidas en lugar de analizar cada posibilidad." },
  { id: 29, text: "Cuando me siento juzgado, tiendo a guardar más silencio o a suavizar mis opiniones." },
  { id: 30, text: "En contextos sociales, soy más expresivo o extrovertido que cuando estoy en un entorno profesional." }
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
    const color = COLORS[(id - 1) % COLORS.length];
    scores[color] += WEIGHTS[answer];
  });
  return scores;
}

function interpretStyles(scores) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return { dominant: sorted[0][0], secondary: sorted[1][0] };
}

function generateReport(interpretation, scores) {
  const { dominant, secondary } = interpretation;
  return {
    title: "Estilos de Comunicación Preferenciales",
    perfil: `Dominante: ${dominant}. Secundario: ${secondary}.`,
    comportamientos: {
      buenDia: `En un buen día, tu estilo ${dominant} se manifiesta con energía positiva y claridad en el mensaje. Tiendes a tomar la iniciativa, influir en el rumbo de la conversación y motivar al equipo para alcanzar objetivos ambiciosos. Mantienes un enfoque proactivo, proponiendo soluciones innovadoras y liderando con convicción.`,
      malDia: `En un mal día, tu estilo ${dominant} puede volverse excesivamente autoritario o impaciente. Puedes mostrar rigidez ante ideas que difieran de tu visión y tender a tomar decisiones precipitadas sin considerar el impacto emocional en los demás. Es importante reconocer estos patrones para neutralizar posibles tensiones.`
    },
    recomendaciones: `Para mejorar tu comunicación, combina la determinación de tu estilo ${dominant} con la empatía natural de ${secondary}. Practica la escucha activa, formulando preguntas abiertas para comprender mejor las perspectivas ajenas. Trabaja en modular tu tono y ritmo para crear un ambiente de diálogo cooperativo y reducir posibles malentendidos.`,
    relacion: `Tu color opuesto es ${OPPOSITES[dominant]}. Para conectar de manera efectiva, adapta tu mensaje usando un lenguaje más pausado, con ejemplos concretos y espacio para el análisis detallado. Demuestra aprecio por la precisión y los datos, y evita imponer tu visión de manera abrupta.`,
    chartData: COLORS.map(col => ({ name: col, value: scores[col] }))
  };
}

export default function CommunicationStylesTest() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const chartRef = useRef(null);

  const handleSelect = (answer) => {
    setAnswers(prev => [...prev, { id: questions[step].id, answer }]);
    setStep(prev => prev + 1);
  };

  // Durante el test, mostrar barra de progreso y pregunta actual
  if (step < questions.length) {
    const progress = Math.round((step / questions.length) * 100);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Barra de progreso */}
        <div style={{ width: '100%', backgroundColor: '#e0e0e0', height: '8px' }}>
          <div style={{ width: `${progress}%`, backgroundColor: '#3cb44b', height: '100%', transition: 'width 0.3s' }} />
        </div>
        {/* Contenido centrado */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: 600, textAlign: 'center' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>{questions[step].text}</h2>
            <p style={{ marginBottom: '1rem', color: '#666' }}>{progress}% completado</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {options.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => handleSelect(opt.label)}
                  style={{ padding: '0.75rem', fontSize: '1rem', borderRadius: 4, cursor: 'pointer' }}
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

  // Una vez completado el test, calcular y mostrar informe
  const scores = calculateScores(answers);
  const interpretation = interpretStyles(scores);
  const report = generateReport(interpretation, scores);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(report.title, 14, 20);
    doc.setFontSize(12);
    doc.text(report.perfil, 14, 30);
    doc.text(report.comportamientos.buenDia, 14, 40);
    doc.text(report.comportamientos.malDia, 14, 60);
    doc.text(report.recomendaciones, 14, 80);
    doc.text(report.relacion, 14, 100);
    const canvas = chartRef.current.querySelector('canvas');
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 14, 120, 180, 90);
    doc.save('Estilos_Comunicacion_Preferenciales.pdf');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem' }}>
      <h1 style={{ textAlign: 'center' }}>{report.title}</h1>
      <p style={{ textAlign: 'center' }}>{report.perfil}</p>
      <div style={{ maxWidth: 600, width: '100%' }}>
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
              <Pie data={report.chartData} dataKey="value" nameKey="name" outerRadius={100} label startAngle={45} endAngle={-315}>
                {report.chartData.map(entry => (
                  <Cell key={entry.name} fill={CHART_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            onClick={generatePDF}
            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', borderRadius: 4, cursor: 'pointer' }}
          >
            Descargar informe
          </button>
        </div>
      </div>
    </div>
  );
}