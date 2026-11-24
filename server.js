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
        <title>Prancheta de Avaliação - Feira Acadêmica</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f4f7f6; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); width: 100%; max-width: 450px; }
            h2 { text-align: center; color: #333; margin-bottom: 10px; }
            .badge { text-align: center; background: #e9f2ff; color: #0056b3; padding: 8px 12px; border-radius: 6px; font-weight: bold; margin-bottom: 20px; font-size: 14px; }
            label { font-weight: bold; color: #555; display: block; margin-bottom: 8px; }
            select { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; margin-bottom: 20px; font-size: 15px; background: white; }
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
            <div id="infoPalestra" class="badge" style="display:none;"></div>
            <form id="formAvaliacao">
                <div id="seletorContainer">
                    <label for="palestraSelect">Apresentação / Palestra:</label>
                    <select id="palestraSelect" required>
                        <option value="Apresentação 1">Apresentação 1</option>
                        <option value="Apresentação 2">Apresentação 2</option>
                        <option value="Apresentação 3">Apresentação 3</option>
                        <option value="Apresentação 4">Apresentação 4</option>
                    </select>
                </div>

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
            const params = new URLSearchParams(window.location.search);
            const palestraUrl = params.get('palestra');
            const infoDiv = document.getElementById('infoPalestra');
            const seletorContainer = document.getElementById('seletorContainer');
            const palestraSelect = document.getElementById('palestraSelect');

            if (palestraUrl) {
                infoDiv.style.display = 'block';
                infoDiv.innerText = 'Avaliando: ' + palestraUrl;
                seletorContainer.style.display = 'none';
            }

            document.getElementById('formAvaliacao').addEventListener('submit', async (e) => {
                e.preventDefault();
                const palestra = palestraUrl || palestraSelect.value;
                const calificacion = document.querySelector('input[name="calificacion"]:checked').value;
                const sugerencia = document.getElementById('sugerencia').value;
                const msgDiv = document.getElementById('msg');

                try {
                    const res = await fetch('/api/respuestas', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ palestra, calificacion: Number(calificacion), sugerencia })
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
                    msgDiv.inner
