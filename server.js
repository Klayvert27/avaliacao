import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

// Conexão direta com o Supabase usando as suas credenciais
const supabase = createClient(
  "https://lsbgcakeyrlbnxbaeheu.supabase.co",
  "sb_secret_hyIKMKkUeKLmGICZtMgVlw_-zIzKFU3"
);

// Rota principal: entrega a prancheta de avaliação direto no navegador
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Prancheta de Avaliação - Feira Acadêmica</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f4f7f6; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); width: 100%; max-width: 450px; }
            h2 { text-align: center; color: #333; margin-bottom: 25px; }
            label { font-weight: bold; color: #555; display: block; margin-bottom: 8px; }
            .estrelas { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .estrelas input { display: none; }
            .estrelas label { flex: 1; text-align: center; padding: 12px 0; margin: 0 4px; background: #eee; border-radius: 6px; cursor: pointer; font-size: 18px; font-weight: bold; color: #444; transition: 0.2s; }
            .estrelas input:checked + label { background: #28a745; color: white; }
            textarea { width: 100%; height: 100px; padding: 10px; border: 1px solid #ccc; border-radius: 6px; resize: none; margin-bottom: 20px; font-family: inherit; box-sizing: border-box; }
            button { width: 100%; background: #007bff; color: white; border: none; padding: 14px; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; }
            button:hover { background: #0056b3; }
            .msg { text-align: center; margin-top: 15px; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Avaliação da Feira Acadêmica</h2>
            <form id="formAvaliacao">
                <label>Nota (1 a 5):</label>
                <div class="estrelas">
                    <input type="radio" id="n1" name="calificacion" value="1" required><label for="n1">1</label>
                    <input type="radio" id="n2" name="calificacion" value="2"><label for="n2">2</label>
                    <input type="radio" id="n3" name="calificacion" value="3"><label for="n3">3</label>
                    <input type="radio" id="n4" name="calificacion" value="4"><label for="n4">4</label>
                    <input type="radio" id="n5" name="calificacion" value="5"><label for="n5">5</label>
                </div>

                <label for="sugerencia">Sugestões ou Comentários:</label>
                <textarea id="sugerencia" placeholder="Deixe seu comentário opcional aqui..."></textarea>

                <button type="submit">Enviar Avaliação</button>
            </form>
            <div id="msg" class="msg"></div>
        </div>

        <script>
            document.getElementById('formAvaliacao').addEventListener('submit', async (e) => {
                e.preventDefault();
                const calificacion = document.querySelector('input[name="calificacion"]:checked').value;
                const sugerencia = document.getElementById('sugerencia').value;
                const msgDiv = document.getElementById('msg');

                try {
                    const res = await fetch('/api/respuestas', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ calificacion: Number(calificacion), sugerencia })
                    });

                    if (res.ok) {
                        msgDiv.style.color = 'green';
                        msgDiv.innerText = 'Avaliação enviada com sucesso! Obrigado.';
                        document.getElementById('formAvaliacao').reset();
                    } else {
                        msgDiv.style.color = 'red';
                        msgDiv.innerText = 'Erro ao enviar. Tente novamente.';
                    }
                } catch (err) {
                    msgDiv.style.color = 'red';
                    msgDiv.innerText = 'Erro de conexão com o servidor.';
                }
            });
        </script>
    </body>
    </html>
  `);
});

// Salvar a resposta no Supabase
app.post('/api/respuestas', async (req, res) => {
  const calificacion = Number(req.body.calificacion);
  const sugerencia = (req.body.sugerencia || '').trim().slice(0, 1000);

  if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
    return res.status(400).json({ error: 'Calificación inválida' });
  }

  const { error } = await supabase
    .from('respuestas')
    .insert({ calificacion, sugerencia });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudo guardar' });
  }
  res.status(201).json({ ok: true });
});

// Ver resultados (protegido com a senha do painel)
app.get('/api/resultados', async (req, res) => {
  if (req.headers['x-password'] !== process.env.PANEL_PASSWORD) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { data, error } = await supabase
    .from('respuestas')
    .select('calificacion, sugerencia, creado_en')
    .order('creado_en', { ascending: false });

  if (error) return res.status(500).json({ error: 'Error al leer' });

  const total = data.length;
  const promedio = total
    ? data.reduce((s, r) => s + r.calificacion, 0) / total
    : 0;

  res.json({
    total,
    promedio: Number(promedio.toFixed(2)),
    comentarios: data.filter(r => r.sugerencia).map(r => r.sugerencia)
  });
});

app.listen(3000, () => console.log('Servidor rodando perfeitamente em http://localhost:3000'));