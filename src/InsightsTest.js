import { useState } from "react";
import jsPDF from "jspdf";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';


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

const communicationInsights = {
  "Amarillo con influencia Verde": [
    "Estilo empático y positivo, con orientación a las personas.",
    "Disfruta generando buen ambiente y evitando tensiones.",
    "Puede mostrarse disperso o demasiado complaciente.",
    "Recomendación: estructura tus ideas y pon límites claros.",
    "Con perfiles analíticos: sé directo y aporta datos."
  ],
  "Amarillo con influencia Rojo": [
    "Comunicador enérgico y persuasivo, combina entusiasmo con decisión.",
    "Sabe contagiar ideas con intensidad y rapidez.",
    "Puede parecer impulsivo o poco riguroso.",
    "Recomendación: escucha más y ordena tus propuestas.",
    "Con perfiles verdes: baja el ritmo, escucha más de lo que hablas."
  ],
  "Verde con influencia Azul": [
    "Estilo cuidadoso, cooperador y reflexivo.",
    "Ofrece apoyo sereno y sentido del deber.",
    "Puede evitar confrontar o decidir con rapidez.",
    "Recomendación: trabaja la proactividad y asertividad.",
    "Con perfiles directivos: no temas expresar límites con firmeza."
  ],
  "Rojo con influencia Amarillo": [
    "Comunicador muy directo pero cercano.",
    "Impulsa decisiones rápidas con energía y persuasión.",
    "Puede mostrarse impaciente y dominante si no regula su ritmo.",
    "Recomendación: escucha activa y mejor gestión del entusiasmo.",
    "Cuidado al tratar con perfiles analíticos: dales espacio y datos."
  ],
  "Rojo con influencia Azul": [
    "Estilo firme y racional, muy enfocado a resultados y procedimientos.",
    "Busca eficacia y orden, transmite estructura y control.",
    "Puede parecer frío o inflexible con perfiles emocionales.",
    "Recomendación: flexibilidad en la forma, manteniendo el fondo.",
    "Toma en cuenta la parte humana en equipos sensibles."
  ],
  "Verde con influencia Amarillo": [
    "Comunicador empático con un toque optimista y entusiasta.",
    "Tiende a favorecer la armonía pero también contagia alegría.",
    "Puede evitar conflictos necesarios o dispersarse.",
    "Recomendación: claridad al poner límites y más foco.",
    "Cuidado con los perfiles dominantes: mantener postura sin confrontar."
  ],
  "Azul con influencia Verde": [
    "Estilo reflexivo, cuidadoso y diplomático.",
    "Excelente para trabajos con detalle y relaciones sostenidas.",
    "Puede tardar en decidir y mostrarse evasivo si hay presión.",
    "Recomendación: trabajar la asertividad y priorizar.",
    "Ante comunicadores rápidos: preparar mensajes claros y breves."
  ],
  Rojo: [
    "Estilo natural: Directo, claro y enfocado en la acción. Prefiere hechos y resultados.",
    "Buen día: Decidido y motivador, impulsa el avance con claridad.",
    "Mal día: Impaciente o autoritario, puede interrumpir y no escuchar.",
    "Recomendaciones: Escucha más, valida emociones, pregunta antes de afirmar.",
    "Trato con Azules: Usa datos, evita presionar, respeta sus tiempos."
  ],
  Amarillo: [
    "Estilo natural: Entusiasta y expresivo, comunica con energía y calidez.",
    "Buen día: Genera entusiasmo y conexión.",
    "Mal día: Puede divagar o no concretar.",
    "Recomendaciones: Escucha más, estructura tus ideas, resume.",
    "Trato con Azules: Sé claro, evita exageraciones, usa ejemplos concretos."
  ],
  Verde: [
    "Estilo natural: Paciente y empático, evita el conflicto.",
    "Buen día: Escucha activa, armonía, apoyo.",
    "Mal día: Calla lo que piensa por evitar tensiones.",
    "Recomendaciones: Afirma tus ideas, aprende a decir que no.",
    "Trato con Rojos: Sé claro y directo, sin perder tu tono calmado."
  ],
  Azul: [
    "Estilo natural: Analítico y preciso, comunica con lógica.",
    "Buen día: Rigurosidad y claridad.",
    "Mal día: Puede parecer distante o hipercrítico.",
    "Recomendaciones: Sé más expresivo, acepta que no todo es perfecto.",
    "Trato con Amarillos: Tolera la emoción, acepta ideas espontáneas."
  ]
};

const COLORS = ['#ef4444', '#facc15', '#10b981', '#3b82f6'];

export default function InsightsTest() {
  const [answers, setAnswers] = useState(Array(20).fill(null));
  const [result, setResult] = useState(null);
  const [userInfo, setUserInfo] = useState({ nombre: "", email: "" });
  const [started, setStarted] = useState(false);

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
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const percentages = Object.fromEntries(
      Object.entries(counts).map(([color, count]) => [color, ((count / total) * 100).toFixed(1)])
    );
    const sortedColors = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const dominantColor = sortedColors[0][0];
    const secondaryColor = sortedColors[1] ? sortedColors[1][0] : null;
    const profileLabel = secondaryColor ? `${dominantColor} con influencia ${secondaryColor}` : dominantColor;

    setResult({ dominantColor, secondaryColor, profileLabel, counts, percentages });
  };{ dominantColor, counts, percentages });
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Resultados del Test Insights", 20, 20);
    doc.setFontSize(12);
    doc.text(`Nombre: ${userInfo.nombre}`, 20, 30);
    doc.text(`Email: ${userInfo.email}`, 20, 40);
    doc.text(`Color predominante: ${result.dominantColor}`, 20, 50);
    let y = 60;
    const insightLines = communicationInsights[result.profileLabel] || communicationInsights[result.dominantColor];
    insightLines.forEach((line) => {
      doc.text(line, 20, y, { maxWidth: 170 });
      y += 10;
    });
      y += 10;
    });
    y += 10;
    Object.entries(result.percentages).forEach(([color, percent]) => {
      doc.text(`${color}: ${percent}%`, 20, y);
      y += 10;
    });
    doc.save("resultado-insights.pdf");
  };

  if (!started) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Antes de empezar, dinos quién eres</h2>
        <input type="text" placeholder="Nombre" value={userInfo.nombre} onChange={(e) => setUserInfo({ ...userInfo, nombre: e.target.value })} style={{ display: 'block', marginBottom: '1rem', padding: '0.5rem', width: '100%' }} />
        <input type="email" placeholder="Correo electrónico" value={userInfo.email} onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })} style={{ display: 'block', marginBottom: '1rem', padding: '0.5rem', width: '100%' }} />
        <button onClick={() => userInfo.nombre && userInfo.email && setStarted(true)} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Empezar test
        </button>
      </div>
    );
  }

  const progress = Math.round((answers.filter(Boolean).length / 20) * 100);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem', textAlign: 'center' }}>
        Test de Estilo de Comunicación - Modelo Insights
      </h1>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ fontWeight: '500' }}>Progreso: {progress}%</label>
        <div style={{ backgroundColor: '#e5e7eb', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, backgroundColor: '#2563eb', height: '100%' }}></div>
        </div>
      </div>

      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#f9fafb' }}>
          <p style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Pregunta {i + 1}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {["Rojo", "Amarillo", "Verde", "Azul"].map((color, j) => (
              <button
                key={j}
                onClick={() => handleAnswer(i, color)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: answers[i] === color ? '2px solid #2563eb' : '1px solid #d1d5db',
                  backgroundColor: answers[i] === color ? '#dbeafe' : 'white',
                  cursor: 'pointer',
                  width: '100%',
                  fontWeight: '500',
                  textAlign: 'left'
                }}
              >
                {questions[i].options[j].text}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          onClick={calculateResult}
          disabled={answers.includes(null)}
          style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: answers.includes(null) ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: '600' }}
        >
          Ver resultado
        </button>
      </div>

      {result && (
        <>
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Tu perfil es: {result.profileLabel}</h2>
            <p style={{ marginBottom: '1rem', fontStyle: 'italic' }}>{communicationInsights[result.dominantColor][0]}</p>
            <div style={{ marginBottom: '1rem' }}>
              {Object.entries(result.percentages).map(([color, percent]) => (
                <p key={color}>{color}: {percent}%</p>
              ))}
            </div>
            <div style={{ marginTop: '2rem', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>Informe detallado</h3>
              <ul style={{ listStyleType: 'none', paddingLeft: 0, margin: 0 }}>
                {communicationInsights[result.dominantColor].map((line, idx) => (
                  <li key={idx} style={{ backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '6px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', marginBottom: '0.5rem', fontSize: '0.95rem', lineHeight: '1.4', borderLeft: '4px solid #2563eb' }}>{line}</li>
                ))}
              </ul>
            </div>
            <div style={{ marginTop: '2rem' }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={Object.entries(result.counts).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} dataKey="value">
                    {Object.entries(result.counts).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button onClick={downloadPDF} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}>
                Descargar PDF
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
