import { useState } from "react";
import jsPDF from "jspdf";

const questions = Array.from({ length: 20 }, (_, i) => {
  const q = [
    ["Tomo decisiones con rapidez", "Animo al grupo con energía", "Evito tensiones en el equipo", "Recojo información antes de actuar"],
    ["Busco ganar y avanzar", "Me gusta conectar con todos", "Me adapto a lo que los demás necesiten", "Me preocupo por los procedimientos"],
    ["Soy directo aunque moleste", "Disfruto improvisar con otros", "Soy empático con las personas", "Valoro los datos bien contrastados"],
    ["Me frustra la indecisión", "Me encanta trabajar en grupo", "Prefiero entornos tranquilos", "Necesito organización y orden"],
    ["Digo lo que pienso sin rodeos", "Contagio entusiasmo", "Escucho mucho antes de hablar", "Hago muchas preguntas antes de actuar"],
    ["Me oriento a objetivos claros", "Soy muy expresivo al comunicar", "Me preocupa que todos estén cómodos", "Me gusta profundizar en los temas"],
    ["Prefiero liderar que seguir", "Hablo con entusiasmo en reuniones", "Evito imponer mis ideas", "Prefiero escribir antes que hablar"],
    ["Me gusta ser competitivo", "Soy muy sociable y espontáneo", "Me cuesta decir que no", "Reviso todo antes de entregarlo"],
    ["Afronto los problemas de frente", "Busco que las reuniones sean divertidas", "Aporto calma en los conflictos", "Me incomoda la improvisación"],
    ["Me gusta tener el control", "Hablo con facilidad incluso con desconocidos", "Me interesa el bienestar del grupo", "Soy crítico con los errores"],
    ["Soy impaciente si no hay resultados", "Me entusiasmo fácilmente con ideas nuevas", "Necesito tiempo para confiar", "Prefiero datos que opiniones"],
    ["Doy instrucciones claras y firmes", "Me gusta que haya ambiente distendido", "Me esfuerzo por no herir sensibilidades", "Me fijo mucho en los detalles"],
    ["Paso rápido a la acción", "Hablo mucho y me gusta que me escuchen", "No soporto los conflictos abiertos", "Aporto estructura a lo que hago"],
    ["Soy firme si alguien no cumple", "Me encanta convencer a otros", "Me afecta el mal ambiente", "Prefiero preparar que improvisar"],
    ["Me gusta decidir rápido en equipo", "Puedo desorganizarme si no tengo espacio para fluir", "Cedo muchas veces para evitar tensiones", "Me cuesta actuar si no tengo seguridad"],
    ["Me molestan los rodeos", "Me aburren las tareas solitarias", "Evito hablar si hay tensión", "Me gusta tener las normas claras"],
    ["Soy exigente con los resultados", "Me gusta tener la atención del grupo", "Me incomoda presionar a otros", "Soy reservado y reflexivo"],
    ["Me gusta medir el rendimiento del equipo", "Me involucro mucho en las relaciones sociales", "Me preocupa que alguien se sienta mal", "Me agobio con los cambios constantes"],
    ["No me tiembla el pulso al confrontar", "Siempre saludo y sonrío", "Me esfuerzo por mediar en los roces", "Me siento cómodo en la planificación"],
    ["Me gusta asumir riesgos controlados", "Me encanta bromear en el trabajo", "Escucho antes de opinar", "Necesito tiempo para pensar solo"]
  ];
  const options = q[i % q.length];
  return {
    id: i + 1,
    options: [
      { text: options[0], color: "Rojo" },
      { text: options[1], color: "Amarillo" },
      { text: options[2], color: "Verde" },
      { text: options[3], color: "Azul" },
    ],
  };
});

const colorDescriptions = {
  Rojo: "Directo, decidido, orientado a resultados. Te gusta liderar, actuar y avanzar rápido. Puedes parecer impaciente o autoritario si no regulas tu intensidad.",
  Amarillo: "Sociable, entusiasta y comunicativo. Te expresas con facilidad y conectas con las personas. Puedes parecer disperso o poco estructurado si no equilibras tu energía.",
  Verde: "Paciente, empático y cooperador. Prefieres la armonía y evitar conflictos. Puedes evitar confrontaciones importantes por preservar la relación.",
  Azul: "Reflexivo, analítico y meticuloso. Buscas exactitud, rigor y planificación. Puedes parecer distante o lento para decidir si priorizas demasiado la perfección."
};

export default function InsightsTest() {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [result, setResult] = useState(null);

  const handleAnswer = (questionIndex, color) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = color;
    setAnswers(newAnswers);
  };

  const calculateResult = () => {
    const counts = answers.reduce((acc, color) => {
      if (color) acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {});
    const dominantColor = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    setResult({ dominantColor, counts });
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Resultados del Test Insights", 20, 20);
    doc.setFontSize(12);
    doc.text(`Color predominante: ${result.dominantColor}`, 20, 40);
    doc.text(colorDescriptions[result.dominantColor], 20, 50, { maxWidth: 170 });
    let y = 90;
    Object.entries(result.counts).forEach(([color, count]) => {
      doc.text(`${color}: ${count} respuestas`, 20, y);
      y += 10;
    });
    doc.save("resultado-insights.pdf");
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1rem' }}>
        Test de Estilo de Comunicación - Modelo Insights
      </h1>
      {questions.map((q, i) => (
        <div key={q.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Pregunta {i + 1}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {q.options.map((opt, j) => (
              <button
                key={j}
                onClick={() => handleAnswer(i, opt.color)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: answers[i] === opt.color ? '2px solid black' : '1px solid #ccc',
                  backgroundColor: answers[i] === opt.color ? '#e2e8f0' : 'white',
                  cursor: 'pointer'
                }}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={calculateResult}
          disabled={answers.includes(null)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: answers.includes(null) ? 'not-allowed' : 'pointer'
          }}
        >
          Ver resultado
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '0.5rem' }}>Resultado</h2>
          <p style={{ marginBottom: '1rem' }}>
            Tu color predominante es: <strong>{result.dominantColor}</strong>
          </p>
          <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>{colorDescriptions[result.dominantColor]}</p>
          <ul>
            {Object.entries(result.counts).map(([color, count]) => (
              <li key={color}>{color}: {count} respuestas</li>
            ))}
          </ul>
          <button
            onClick={downloadPDF}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Descargar PDF
          </button>
        </div>
      )}
    </div>
  );
}