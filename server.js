import 'dotenv/config';
import express from 'express';
import pg from 'pg';

const { Pool } = pg;
const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const APRESENTACOES = {
  // SEGUNDA-FEIRA, 23/11
  '1': { diaLabel: 'Segunda-feira, 23/11', curto: 'Seg 23/11', hora: '14h', titulo: 'Conferência: "Advocacia do Futuro: Preservando Saberes, Conectando Dados, Construindo Justiça"' },
  '2': { diaLabel: 'Segunda-feira, 23/11', curto: 'Seg 23/11', hora: '14h', titulo: 'Workshop: "Lawtechs, Legal Design e o Futuro das Profissões Jurídicas"' },
  '3': { diaLabel: 'Segunda-feira, 23/11', curto: 'Seg 23/11', hora: '19h', titulo: 'Solenidade de Abertura: "Preservando saberes, conectando dados, construindo soluções"' },

  // TERÇA-FEIRA, 24/11
  '4': { diaLabel: 'Terça-feira, 24/11', curto: 'Ter 24/11', hora: '14h', titulo: 'Painel/Mesa: "Justiça Socioambiental, Mudanças Climáticas e Tutela Coletiva dos Povos da Amazônia"' },
  '5': { diaLabel: 'Terça-feira, 24/11', curto: 'Ter 24/11', hora: '19h', titulo: 'Conferência: "Tessituras para o desenvolvimento sustentável: gestão ambiental nos negócios amazônicos"' },
  '6': { diaLabel: 'Terça-feira, 24/11', curto: 'Ter 24/11', hora: '19h', titulo: 'Tema: "Direitos Humanos, Regulação Tecnológica e Cooperação Internacional na Amazônia"' },
  '7': { diaLabel: 'Terça-feira, 24/11', curto: 'Ter 24/11', hora: '19h', titulo: 'Tema: "Saúde Mental, Comportamento e Qualidade de Vida no Contexto Contemporâneo"' },
  '8': { diaLabel: 'Terça-feira, 24/11', curto: 'Ter 24/11', hora: '19h', titulo: 'Tema: "Ergonomia e a atividade física"' },
  '9': { diaLabel: 'Terça-feira, 24/11', curto: 'Ter 24/11', hora: '19h', titulo: 'Ecochef' },

  // QUARTA-FEIRA, 25/11
  '10': { diaLabel: 'Quarta-feira, 25/11', curto: 'Qua 25/11', hora: '14h', titulo: 'Cine Juris: "Versões de um crime"' },
  '11': { diaLabel: 'Quarta-feira, 25/11', curto: 'Qua 25/11', hora: '14h', titulo: 'Competição de Direitos Humanos' },
  '12': { diaLabel: 'Quarta-feira, 25/11', curto: 'Qua 25/11', hora: '19h', titulo: 'Mesa-redonda: "Propriedade Intelectual, Saberes Tradicionais e Proteção da Sociobiodiversidade Amazônica"' },
  '13': { diaLabel: 'Quarta-feira, 25/11', curto: 'Qua 25/11', hora: '19h', titulo: 'Roda de Conversa: "Povos Indígenas e Justiça Climática: Do Território Urbano à Incidência Global"' },
  '14': { diaLabel: 'Quarta-feira, 25/11', curto: 'Qua 25/11', hora: '19h', titulo: 'Seminário: "Regularização Fundiária e Justiça Socioambiental na Amazônia" (parceiros: UFAM, CNJ, FDD, Clínica Felicidade, TJAM e Ministério da Justiça)' },
  '15': { diaLabel: 'Quarta-feira, 25/11', curto: 'Qua 25/11', hora: '19h', titulo: 'Tema: "Educação Física no novo Ensino Médio"' },
  '16': { diaLabel: 'Quarta-feira, 25/11', curto: 'Qua 25/11', hora: '19h', titulo: 'Pôsteres + Comunicações Orais + Projetos Integradores: apresentação de trabalhos' },
  '26': { diaLabel: 'Quarta-feira, 25/11', curto: 'Qua 25/11', hora: '19h30', titulo: 'Tema: "Saúde Emocional no Ambiente Acadêmico e Profissional"' },

  // QUINTA-FEIRA, 26/11
  '17': { diaLabel: 'Quinta-feira, 26/11', curto: 'Qui 26/11', hora: '14h', titulo: 'Júri Simulado / NUJUR' },
  '27': { diaLabel: 'Quinta-feira, 26/11', curto: 'Qui 26/11', hora: '19h', titulo: 'Júri Simulado / NUJUR' },
  '18': { diaLabel: 'Quinta-feira, 26/11', curto: 'Qui 26/11', hora: '19h', titulo: 'Competição de Direitos Humanos (UNINORTE × UNILASALLE)' },
  '19': { diaLabel: 'Quinta-feira, 26/11', curto: 'Qui 26/11', hora: '19h', titulo: 'Tema: "O fenômeno das Assessorias Esportivas para Corridas de rua"' },
  '21': { diaLabel: 'Quinta-feira, 26/11', curto: 'Qui 26/11', hora: '19h', titulo: 'Oficina: "Primeiros Socorros Emocionais: Técnicas de Escuta Ativa em Situações de Crise"' },
  '23': { diaLabel: 'Quinta-feira, 26/11', curto: 'Qui 26/11', hora: '19h', titulo: 'Gincana de Negócios' },
  '24': { diaLabel: 'Quinta-feira, 26/11', curto: 'Qui 26/11', hora: '19h', titulo: '39ª Mostra de Iniciação Científica — apresentação de trabalhos dos alunos de Metodologia Científica/Pesquisa' },

  // SEXTA-FEIRA, 27/11
  '25': { diaLabel: 'Sexta-feira, 27/11', curto: 'Sex 27/11', hora: '14h', titulo: '1ª Mostra de Extensão' },
  '28': { diaLabel: 'Sexta-feira, 27/11', curto: 'Sex 27/11', hora: '19h', titulo: 'Gincana Esportiva de Encerramento' }
};

function escapeHtml(texto = '') {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

app.get('/', (req, res) => {
  const idRaw = typeof req.query.id === 'string' ? req.query.id.trim() : '';
  const item = APRESENTACOES[idRaw];

  res.set('Cache-Control', 'no-store');

  if (!item) {
    return res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Avaliação - 9º CAIC</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f7f6; margin: 0; padding: 20px; display: flex; justify-content: center; }
        .container { width: 100%; max-width: 520px; }
        .card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 3px 10px rgba(0,0,0,0.08); text-align: center; }
        h1 { margin: 0 0 10px 0; font-size: 20px; color: #0056b3; }
        p { color: #555; line-height: 1.5; margin: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>9º Congresso Amazônico de Iniciação Científica</h1>
            <p>Acesse o link ou escaneie o QR Code específico da apresentação que você deseja avaliar.</p>
        </div>
    </div>
</body>
</html>`);
  }

  const palestraValor = `${item.curto} - ${item.titulo}`;

  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Avaliação - 9º CAIC</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f7f6; margin: 0; padding: 20px; display: flex; justify-content: center; }
        .container { width: 100%; max-width: 520px; }
        .header-card { background: #0056b3; color: white; padding: 22px; border-radius: 12px; text-align: center; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
        .header-card h1 { margin: 0 0 6px 0; font-size: 20px; }
        .header-card p { margin: 0 0 12px 0; font-size: 13px; opacity: 0.9; }
        .data-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 14px; }
        .card { background: white; padding: 22px; border-radius: 12px; box-shadow: 0 3px 10px rgba(0,0,0,0.08); }
        .card h2 { margin: 0 0 8px 0; color: #222; font-size: 18px; }
        .horario { display: inline-block; background: #e9f2ff; color: #0056b3; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 4px; margin-bottom: 16px; }
        label { font-weight: bold; color: #555; display: block; margin-bottom: 8px; font-size: 14px; }
        .estrelas { display: flex; justify-content: space-between; margin-bottom: 16px; }
        .estrelas input { display: none; }
        .estrelas label { flex: 1; text-align: center; padding: 12px 0; margin: 0 4px; background: #eee; border-radius: 6px; cursor: pointer; font-size: 17px; font-weight: bold; color: #444; transition: 0.2s; }
        .estrelas input:checked + label { background: #28a745; color: white; }
        textarea { width: 100%; height: 85px; padding: 10px; border: 1px solid #ccc; border-radius: 6px; resize: none; margin-bottom: 14px; font-family: inherit; box-sizing: border-box; font-size: 14px; }
        button { width: 100%; background: #007bff; color: white; border: none; padding: 13px; border-radius: 6px; font-size: 15px; font-weight: bold; cursor: pointer; transition: 0.2s; }
        button:hover { background: #0056b3; }
        button:disabled { background: #6c757d; cursor: not-allowed; }
        .msg { text-align: center; margin-top: 12px; font-weight: bold; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header-card">
            <h1>9º Congresso Amazônico de Iniciação Científica</h1>
            <p>Avaliação Individual da Apresentação</p>
            <div class="data-badge">${escapeHtml(item.diaLabel)}</div>
        </div>
        <div class="card">
            <h2>${escapeHtml(item.titulo)}</h2>
            <span class="horario">Horário: ${escapeHtml(item.hora)}</span>
            <form id="formAvaliacao">
                <label>Nota (1 a 5):</label>
                <div class="estrelas">
                    <input type="radio" id="n-1" name="nota" value="1" required><label for="n-1">1</label>
                    <input type="radio" id="n-2" name="nota" value="2"><label for="n-2">2</label>
                    <input type="radio" id="n-3" name="nota" value="3"><label for="n-3">3</label>
                    <input type="radio" id="n-4" name="nota" value="4"><label for="n-4">4</label>
                    <input type="radio" id="n-5" name="nota" value="5"><label for="n-5">5</label>
                </div>
                <label for="sug">Sugestões ou Comentários:</label>
                <textarea id="sug" placeholder="Comentário opcional..."></textarea>
                <button type="submit" id="btn">Enviar Avaliação</button>
            </form>
            <div id="msg" class="msg"></div>
        </div>
    </div>

    <script>
        const palestra = ${JSON.stringify(palestraValor)};
        const form = document.getElementById('formAvaliacao');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const notaSelecionada = form.querySelector('input[name="nota"]:checked');
            const msgDiv = document.getElementById('msg');
            const btn = document.getElementById('btn');
            const sugEl = document.getElementById('sug');

            if (!notaSelecionada) return;

            btn.disabled = true;
            btn.innerText = 'Enviando...';

            const calificacion = Number(notaSelecionada.value);
            const sugerencia = sugEl ? sugEl.value : '';

            try {
                const res = await fetch('/api/respuestas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ palestra, calificacion, sugerencia })
                });

                if (res.ok) {
                    msgDiv.style.color = 'green';
                    msgDiv.innerText = 'Avaliação registrada com sucesso!';
                    btn.innerText = 'Avaliação Enviada ✓';
                } else {
                    msgDiv.style.color = 'red';
                    msgDiv.innerText = 'Erro ao enviar. Tente novamente.';
                    btn.disabled = false;
                    btn.innerText = 'Enviar Avaliação';
                }
            } catch (err) {
                msgDiv.style.color = 'red';
                msgDiv.innerText = 'Erro de conexão com o servidor.';
                btn.disabled = false;
                btn.innerText = 'Enviar Avaliação';
            }
        });
    </script>
</body>
</html>`);
});

app.post('/api/respuestas', async (req, res) => {
  const palestra = (req.body.palestra || 'Geral').trim().slice(0, 150);
  const calificacion = Number(req.body.calificacion);
  const sugerencia = (req.body.sugerencia || '').trim().slice(0, 1000);

  if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
    return res.status(400).json({ error: 'Calificación inválida' });
  }

  try {
    await pool.query(
      'INSERT INTO respuestas (palestra, calificacion, sugerencia) VALUES ($1, $2, $3)',
      [palestra, calificacion, sugerencia]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('Erro Postgres:', err);
    res.status(500).json({ error: 'No se pudo guardar' });
  }
});

app.get('/api/resultados', async (req, res) => {
  if (req.headers['x-password'] !== process.env.PANEL_PASSWORD) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT palestra, calificacion, sugerencia, creado_en FROM respuestas ORDER BY creado_en DESC'
    );
    const total = rows.length;
    const promedio = total
      ? rows.reduce((s, r) => s + Number(r.calificacion), 0) / total
      : 0;

    res.json({
      total,
      promedio: Number(promedio.toFixed(2)),
      respostas: rows
    });
  } catch (err) {
    console.error('Erro ao ler Postgres:', err);
    res.status(500).json({ error: 'Error al leer' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor rodando na porta ' + PORT));
