import { useState } from "react";
import jsPDF from "jspdf";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#ef4444', '#facc15', '#10b981', '#3b82f6'];

const baseQuestionsRaw = [
  ["Tomo decisiones con rapidez", "Animo al grupo con energía", "Evito tensiones en el equipo", "Recojo información antes de actuar"],
  ["Busco ganar y avanzar", "Me gusta conectar con todos", "Me adapto a lo que los demás necesiten", "Me preocupo por los procedimientos"],
  ["Soy directo aunque moleste", "Disfruto improvisar con otros", "Soy empático con las personas", "Valoro los datos bien contrastados"],
  ["Me frustra la indecisión", "Me encanta trabajar en grupo", "Prefiero entornos tranquilos", "Necesito organización y orden"],
  ["Me oriento a objetivos claros", "Soy muy expresivo al comunicar", "Me preocupa que todos estén cómodos", "Me gusta profundizar en los temas"]
];

const controlQuestions = [
  ["He respondido con sinceridad.", "No estoy seguro.", "He respondido lo que suena mejor.", "He contestado al azar."],
  ["Prefiero terminar rápido antes que reflexionar.", "He reflexionado en cada pregunta.", "No me lo he tomado muy en serio.", "He contestado como soy de verdad."]
];

const baseQuestions = baseQuestionsRaw;

const allQuestions = [...baseQuestions, ...controlQuestions].map((opts, i) => ({
  id: i + 1,
  options: opts.map((text, j) => ({
    text,
    color: baseQuestions[i] ? ["Rojo", "Amarillo", "Verde", "Azul"][j] : null
  }))
}));

export default function TestEstilosComunicacion() {
  const [answers, setAnswers] = useState(Array(allQuestions.length).fill(null));
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  const [userInfo, setUserInfo] = useState({ nombre: "", email: "" });
  const [result, setResult] = useState(null);

  const handleAnswer = (color) => {
    const newAnswers = [...answers];
    newAnswers[current] = color;
    setAnswers(newAnswers);
    if (current < allQuestions.length - 1) {
      setCurrent(current + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (data) => {
    const baseOnly = data.slice(0, baseQuestions.length);
    const controlOnly = data.slice(baseQuestions.length);

    const consciousCounts = baseOnly.reduce((acc, color) => {
      if (color) acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {});
    const unconsciousCounts = controlOnly.reduce((acc, color) => {
      if (color) acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {});

    const totalConscious = Object.values(consciousCounts).reduce((a, b) => a + b, 0);
    const totalUnconscious = Object.values(unconsciousCounts).reduce((a, b) => a + b, 0);

    const consciousPercentages = Object.fromEntries(
      Object.entries(consciousCounts).map(([color, count]) => [color, ((count / totalConscious) * 100).toFixed(1)])
    );
    const unconsciousPercentages = Object.fromEntries(
      Object.entries(unconsciousCounts).map(([color, count]) => [color, ((count / totalUnconscious) * 100).toFixed(1)])
    );

    const sortedConscious = Object.entries(consciousCounts).sort((a, b) => b[1] - a[1]);
    const sortedUnconscious = Object.entries(unconsciousCounts).sort((a, b) => b[1] - a[1]);

    const consciousDominant = sortedConscious[0]?.[0] || null;
    const consciousSecondary = sortedConscious[1]?.[0] || null;
    const unconsciousDominant = sortedUnconscious[0]?.[0] || null;
    const unconsciousSecondary = sortedUnconscious[1]?.[0] || null;

    const consciousLabel = consciousSecondary ? `${consciousDominant} con influencia ${consciousSecondary}` : consciousDominant;
    const unconsciousLabel = unconsciousSecondary ? `${unconsciousDominant} con influencia ${unconsciousSecondary}` : unconsciousDominant;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Resultados del Test de Estilos de Comunicación", 20, 20);
    doc.setFontSize(12);
    doc.text(`Nombre: ${userInfo.nombre}`, 20, 30);
    doc.text(`Email: ${userInfo.email}`, 20, 40);
    doc.text(`Perfil consciente: ${consciousLabel}`, 20, 50);
    doc.text(`Perfil menos consciente: ${unconsciousLabel}`, 20, 60);

    let y = 70;
    doc.text("Distribución consciente:", 20, y);
    y += 10;
    Object.entries(consciousPercentages).forEach(([color, percent]) => {
      doc.text(`${color}: ${percent}%`, 20, y);
      y += 10;
    });

    y += 10;
    doc.text("Distribución menos consciente:", 20, y);
    y += 10;
    Object.entries(unconsciousPercentages).forEach(([color, percent]) => {
      doc.text(`${color}: ${percent}%`, 20, y);
      y += 10;
    });

    doc.save("resultado-estilos-comunicacion.pdf");

    setResult({
      dominantColor: consciousDominant,
      secondaryColor: consciousSecondary,
      profileLabel: consciousLabel,
      counts: consciousCounts,
      percentages: consciousPercentages,
      unconsciousLabel,
      unconsciousCounts,
      unconsciousPercentages
    });
  };

  const progress = Math.round((answers.filter(Boolean).length / allQuestions.length) * 100);

  if (!started) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h2>Antes de empezar, dinos quién eres</h2>
        <input placeholder="Nombre" value={userInfo.nombre} onChange={(e) => setUserInfo({ ...userInfo, nombre: e.target.value })} style={{ width: '100%', marginBottom: '1rem' }} />
        <input placeholder="Correo electrónico" value={userInfo.email} onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })} style={{ width: '100%', marginBottom: '1rem' }} />
        <button onClick={() => userInfo.nombre && userInfo.email && setStarted(true)}>
          Empezar test
        </button>
      </div>
    );
  }

  if (!result) {
    const q = allQuestions[current];
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Progreso: {progress}%</label>
          <div style={{ height: '10px', background: '#e5e7eb', borderRadius: '5px' }}>
            <div style={{ width: `${progress}%`, height: '10px', background: '#2563eb' }}></div>
          </div>
        </div>
        <h3>Pregunta {q.id}</h3>
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(opt.color)} style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}>
            {opt.text}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <h1>Test de Estilos de Comunicación</h1>
      <h2>Tu perfil consciente es: {result.profileLabel}</h2>
      <p>Colores (conscientes): {Object.entries(result.percentages).map(([k, v]) => `${k}: ${v}%`).join(" | ")}</p>

      <h2 style={{ marginTop: '2rem' }}>Tu perfil menos consciente es: {result.unconsciousLabel}</h2>
      <p>Colores (menos conscientes): {Object.entries(result.unconsciousPercentages).map(([k, v]) => `${k}: ${v}%`).join(" | ")}</p>

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
  );
}
