import { useState } from "react";
import jsPDF from "jspdf";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#ef4444', '#facc15', '#10b981', '#3b82f6'];

const questions = [
  ...Array.from({ length: 25 }, (_, i) => {
    const origin = i % 2 === 0 ? 'consciente' : 'inconsciente';
    const q = [
      "Tomo decisiones con rapidez",
      "Animo al grupo con energía",
      "Evito tensiones en el equipo",
      "Recojo información antes de actuar"
    ];
    return {
      id: i + 1,
      origin,
      options: [
        { text: q[0], color: "Rojo" },
        { text: q[1], color: "Amarillo" },
        { text: q[2], color: "Verde" },
        { text: q[3], color: "Azul" }
      ]
    };
  })
];

function calculateProfileByOrigin(answers, questions) {
  const profile = { consciente: {}, inconsciente: {} };
  questions.forEach((q, i) => {
    const color = answers[i];
    if (!color) return;
    if (!profile[q.origin][color]) profile[q.origin][color] = 0;
    profile[q.origin][color]++;
  });
  return profile;
}

function getDominantColors(profile) {
  const result = {};
  for (const origin in profile) {
    const counts = profile[origin];
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const percentages = Object.fromEntries(
      Object.entries(counts).map(([color, count]) => [color, ((count / total) * 100).toFixed(1)])
    );
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    result[origin] = {
      counts,
      percentages,
      label: sorted[1] ? `${sorted[0][0]} con influencia ${sorted[1][0]}` : sorted[0][0]
    };
  }
  return result;
}

export default function InsightsTest() {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [result, setResult] = useState(null);
  const [userInfo, setUserInfo] = useState({ nombre: "", email: "" });
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleAnswer = (color) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = color;
    setAnswers(newAnswers);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const calculateResult = () => {
    const scores = calculateProfileByOrigin(answers, questions);
    const profiles = getDominantColors(scores);
    setResult(profiles);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Resultados del Test de Estilo de Comunicación", 20, 20);
    doc.setFontSize(12);
    doc.text(`Nombre: ${userInfo.nombre}`, 20, 30);
    doc.text(`Email: ${userInfo.email}`, 20, 40);
    let y = 50;
    for (const origin in result) {
      doc.text(`${origin.toUpperCase()}: ${result[origin].label}`, 20, y);
      y += 10;
      for (const [color, pct] of Object.entries(result[origin].percentages)) {
        doc.text(`${color}: ${pct}%`, 25, y);
        y += 10;
      }
      y += 5;
    }
    doc.save("resultado-estilo-comunicacion.pdf");
  };

  const progress = Math.round((answers.filter(Boolean).length / questions.length) * 100);

  if (!started) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h2>Antes de empezar, dinos quién eres</h2>
        <input type="text" placeholder="Nombre" value={userInfo.nombre} onChange={(e) => setUserInfo({ ...userInfo, nombre: e.target.value })} style={{ display: 'block', marginBottom: '1rem', padding: '0.5rem', width: '100%' }} />
        <input type="email" placeholder="Correo electrónico" value={userInfo.email} onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })} style={{ display: 'block', marginBottom: '1rem', padding: '0.5rem', width: '100%' }} />
        <button onClick={() => userInfo.nombre && userInfo.email && setStarted(true)} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Empezar test</button>
      </div>
    );
  }

  if (!result) {
    const q = questions[currentQuestion];
    return (
      <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center' }}>Test de Estilo de Comunicación</h2>
        <label>Progreso: {progress}%</label>
        <div style={{ backgroundColor: '#e5e7eb', height: '10px', borderRadius: '5px', marginBottom: '1rem' }}>
          <div style={{ width: `${progress}%`, backgroundColor: '#2563eb', height: '100%' }}></div>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
          <p style={{ fontWeight: '600' }}>Pregunta {q.id}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {q.options.map((opt, j) => (
              <button
                key={j}
                onClick={() => handleAnswer(opt.color)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  width: '100%',
                  fontWeight: '500',
                  textAlign: 'left'
                }}>
                {opt.text}
              </button>
            ))}
          </div>
        </div>
        {answers.every(a => a !== null) && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              onClick={calculateResult}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}>
              Ver resultado
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>Tu Estilo de Comunicación</h2>
      {Object.entries(result).map(([origin, data]) => (
        <div key={origin} style={{ marginTop: '2rem' }}>
          <h3 style={{ textTransform: 'capitalize' }}>{origin}: {data.label}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={Object.entries(data.counts).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} dataKey="value">
                {Object.entries(data.counts).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ))}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button onClick={downloadPDF} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Descargar PDF
        </button>
      </div>
    </div>
  );
}
