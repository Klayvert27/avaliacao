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

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Avaliação - Feira Acadêmica</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f4f7f6; margin: 0; padding: 20px; display: flex; justify-content: center; }
            .container { width: 100%; max-width: 520px; }
            .header-card { background: #0056b3; color: white; padding: 22px; border-radius: 12px; text-align: center; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
            .header-card h1 { margin: 0 0 8px 0; font-size: 22px; }
            .data-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 15px; }
            .card { background: white; padding: 22px; border-radius: 12px; box-shadow: 0 3px 10px rgba(0,0,0,0.08); margin-bottom: 18px; }
            .card h3 { margin: 0 0 14px 0; color: #222; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; }
            label { font-weight: bold; color: #555; display: block; margin-bottom: 8px; font-size: 14px; }
            .estrelas { display: flex; justify-content: space-between; margin-bottom: 16px; }
            .estrelas input { display: none; }
            .estrelas label { flex: 1; text-align: center; padding: 11px 0; margin: 0 4px; background: #eee; border-radius: 6px; cursor: pointer; font-size: 17px; font-weight: bold; color: #444; transition: 0.2s; }
            .estrelas input:checked + label { background: #28a745; color: white; }
            textarea { width: 100%; height: 75px; padding: 10px; border: 1px solid #ccc; border-radius: 6px; resize: none; margin-bottom: 14px; font-family: inherit; box-sizing: border-box; font-size: 14px; }
            button { width: 100%; background: #007bff; color: white; border: none; padding: 12px; border-radius: 6px; font-size: 15px; font-weight: bold; cursor: pointer; transition: 0.2s; }
            button:hover { background: #0056b3; }
            button:disabled { background: #6c757d; cursor: not-allowed; }
            .msg { text-align: center; margin-top: 10px; font-weight: bold; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header-card">
                <h1>Avaliação da Feira Acadêmica</h1>
                <div id="tituloDia" class="data-badge"></div>
            </div>
            <div id="listaApresentacoes"></div>
        </div>

        <script>
            const DIAS_SEMANA = {
                '1': { label: 'Dia 1 — Segunda-feira, 23/11/2026', curto: 'Segunda (23/11)' },
                '2': { label: 'Dia 2 — Terça-feira, 24/11/2026', curto: 'Terça (24/11)' },
                '3': { label: 'Dia 3 — Quarta-feira, 25/11/2026', curto: 'Quarta (25/11)' },
                '4': { label: 'Dia 4 — Quinta-feira, 26/11/2026', curto: 'Quinta (26/11)' },
                '5': { label: 'Dia 5 — Sexta-feira, 27/11/2026', curto: 'Sexta (27/11)' }
            };

            const params = new URLSearchParams(window.location.search);
            let diaParam = params.get('dia');

            if (!DIAS_SEMANA[diaParam]) {
                const hoje = new Date().getDay();
                diaParam = (hoje >= 1 && hoje <= 5) ? String(hoje) : '1';
            }

            const diaAtual = DIAS_SEMANA[diaParam];
            document.getElementById('tituloDia').innerText = diaAtual.label;

            const container = document.getElementById('listaApresentacoes');

            for (let i = 1; i <= 4; i++) {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = \`
                    <h3>Apresentação \${i}</h3>
                    <form id="form-\${i}">
                        <label>Nota (1 a 5):</label>
                        <div class="estrelas">
                            <input type="radio" id="n\${i}-1" name="nota-\${i}" value="1" required><label for="n\${i}-1">1</label>
                            <input type="radio" id="n\${i}-2" name="nota-\${i}" value="2"><label for="n\${i}-2">2</label>
                            <input type="radio" id="n\${i}-3" name="nota-\${i}" value="3"><label for="n\${i}-3">3</label>
                            <input type="radio" id="n\${i}-4" name="nota-\${i}" value="4"><label for="n\${i}-4">4</label>
                            <input type="radio" id="n\${i}-5" name="nota-\${i}" value="5"><label for="n\${i}-5">5</label>
                        </div>
                        <label for="sug-\${i}">Sugestões ou Comentários:</label>
                        <textarea id="sug-\${i}" placeholder="Comentário opcional sobre a Apresentação \${i}..."></textarea>
                        <button type="submit" id="btn-\${i}">Enviar Avaliação — Apresentação \${i}</button>
                    </form>
                    <div id="msg-\${i}" class="msg"></div>
                \`;
                container.appendChild(card);

                document.getElementById(\`form-\${i}\`).addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const notaSelecionada = document.querySelector(\`input[name="nota-\${i}"]:checked\`);
                    const msgDiv = document.getElementById(\`msg-\${i}\`);
                    const btn = document.getElementById(\`btn-\${i}\`);

                    if (!notaSelecionada) return;

                    btn.disabled = true;
                    btn.innerText = 'Enviando...';

                    const palestra = \`\${diaAtual.curto} - Apresentação \${i}\`;
                    const calificacion = Number(notaSelecionada.value);
                    const sugerencia = document.getElementById(\`sug-\${i}\`).value;

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
                            btn.innerText = \`Enviar Avaliação — Apresentação \${i}\`;
                        }
                    } catch (err) {
                        msgDiv.style.color = 'red';
                        msgDiv.innerText = 'Erro de conexão com o servidor.';
                        btn.disabled = false;
                        btn.innerText = \`Enviar Avaliação — Apresentação \${i}\`;
                    }
                });
            }
        </script>
    </body>
    </html>
  `);
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
