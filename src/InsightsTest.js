import React, { useState } from "react";

// Colors in the Insights Discovery model
const COLORS = ["Rojo", "Amarillo", "Verde", "Azul"];
// Opposite mapping
const OPPOSITES = { Rojo: "Verde", Verde: "Rojo", Amarillo: "Azul", Azul: "Amarillo" };

// 25 preguntas para identificar estilos de comunicación
const questions = [
  { id: 1, text: "Cuando participo en una reunión, suelo expresar mis ideas con firmeza.", options: [
      { label: "Totalmente de acuerdo", color: "Rojo" },
      { label: "De acuerdo", color: "Amarillo" },
      { label: "En desacuerdo", color: "Verde" },
      { label: "Para nada de acuerdo", color: "Azul" }
    ]
  },
  { id: 2, text: "Me encanta animar y motivar a los demás con mi energía.", options: [
      { label: "Totalmente de acuerdo", color: "Amarillo" },
      { label: "De acuerdo", color: "Rojo" },
      { label: "En desacuerdo", color: "Azul" },
      { label: "Para nada de acuerdo", color: "Verde" }
    ]
  },
  // ... Preguntas 3 a 24 omisas por brevedad en este ejemplo, seguir patrón para completar 25.
  { id: 25, text: "Cuando algo no sale según lo planeado, analizo detenidamente cada detalle antes de actuar.", options: [
      { label: "Totalmente de acuerdo", color: "Azul" },
      { label: "De acuerdo", color: "Verde" },
      { label: "En desacuerdo", color: "Amarillo" },
      { label: "Para nada de acuerdo", color: "Rojo" }
    ]
  }
];

// Calcula puntuaciones por color
function calculateScores(answers) {
  const scores = { Rojo: 0, Amarillo: 0, Verde: 0, Azul: 0 };
  answers.forEach((answer, idx) => {
    const question = questions.find(q => q.id === answer.id);
    if (question) {
      scores[ answer.color ] += answer.weight;
    }
  });
  return scores;
}

// Determina colores dominante, secundario y estilos consciente/inconsciente
function interpretStyles(scores) {
  const sorted = Object.entries(scores).sort((a,b) => b[1] - a[1]);
  const dominant = sorted[0][0];
  const secondary = sorted[1][0];

  // Enfoque consciente vs inconsciente
  const conscious = { color: dominant };
  const unconscious = { color: secondary };
  return { dominant, secondary, conscious, unconscious };
}

// Genera recomendaciones y comportamientos
function generateReport(interpretation) {
  const { dominant, secondary, conscious, unconscious } = interpretation;
  return {
    perfil: {
      dominante: dominant,
      secundario: secondary
    },
    comportamientos: {
      buenDia: `Cuando ${dominant} está en un buen día, aporta...`,
      malDia: `Cuando ${dominant} está en un mal día, tiende a...`
    },
    recomendaciones: `Para mejorar tu comunicación, intenta equilibrar ${dominant} con...`,
    relacionConOpuesto: `Tu color opuesto es ${OPPOSITES[dominant]}. Para conectar mejor con este perfil, ...`,
    estilos: {
      consciente: `Tu estilo adaptado (consciente) es ${conscious.color}.`, 
      inconsciente: `Tu estilo natural (inconsciente) es ${unconscious.color}.`
    }
  };
}

// Componente principal del test
export default function InsightTest() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);

  const handleAnswer = (questionId, option) => {
    setAnswers([...answers, { id: questionId, color: option.color, weight: option.label.includes("Totalmente") ? 3 : option.label.includes("De acuerdo") ? 2 : option.label.includes("En desacuerdo") ? 1 : 0 }]);
    setStep(step + 1);
  };

  if (step < questions.length) {
    const q = questions[step];
    return (
      <div>
        <h2>P{step + 1}. {q.text}</h2>
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(q.id, opt)}>{opt.label}</button>
        ))}
      </div>
    );
  }

  // Tras responder, calculamos resultados
  const scores = calculateScores(answers);
  const interpretation = interpretStyles(scores);
  const report = generateReport(interpretation);

  return (
    <div>
      <h1>Informe Insights Discovery</h1>
      <p><strong>Color dominante:</strong> {report.perfil.dominante}</p>
      <p><strong>Color secundario:</strong> {report.perfil.secundario}</p>
      <h2>Comportamientos</h2>
      <p><em>Buen día:</em> {report.comportamientos.bunDia}</p>
      <p><em>Mal día:</em> {report.comportamientos.malDia}</p>
      <h2>Recomendaciones</h2>
      <p>{report.recomendaciones}</p>
      <h2>Relación con tu color opuesto</h2>
      <p>{report.relacionConOpuesto}</p>
      <h2>Estilos</h2>
      <p>{report.estilos.consciente}</p>
      <p>{report.estilos.inconsciente}</p>
    </div>
  );
}

/*
  Mapeo de respuestas a colores:
  - "Totalmente de acuerdo": peso 3
  - "De acuerdo": peso 2
  - "En desacuerdo": peso 1
  - "Para nada de acuerdo": peso 0

  Ejemplo de informe para un perfil Verde (dominante) y Azul (secundario):
  {
    perfil: { dominante: "Verde", secundario: "Azul" },
    comportamientos: {
      buenDia: "Cuando Verde está en un buen día, muestra empatía y colaboración...",
      malDia: "Cuando Verde está en un mal día, puede volverse pasivo o indeciso..."
    },
    recomendaciones: "Para mejorar tu comunicación Verde, practica afirmarte con claridad y tomar iniciativas...",
    relacionConOpuesto: "Tu color opuesto es Rojo. Para conectar mejor, sé directo y ve al grano cuando comuniques con perfiles Rojo...",
    estilos: {
      consciente: "Tu estilo adaptado (consciente) es Verde.",
      inconsciente: "Tu estilo natural (inconsciente) es Azul."
    }
  }
*/
