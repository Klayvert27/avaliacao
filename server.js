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

const PROGRAMACAO = {
  '1': {
    label: 'Segunda-feira, 23/11/2026',
    curto: 'Seg 23/11',
    itens: [
      { hora: '14h', titulo: 'Conferência: Advocacia do Futuro' },
      { hora: '14h', titulo: 'Workshop: Lawtechs, Legal Design e Futuro Jurídico' },
      { hora: '19h', titulo: 'Solenidade de Abertura e Conferência Magna' }
    ]
  },
  '2': {
    label: 'Terça-feira, 24/11/2026',
    curto: 'Ter 24/11',
    itens: [
      { hora: '14h', titulo: 'Painel: Justiça Socioambiental e Povos da Amazônia' },
      { hora: '19h', titulo: 'Tecnologia e Sustentabilidade nos Negócios Amazônicos' },
      { hora: '19h', titulo: 'Direitos Humanos, Regulação Tecnológica e Cooperação' },
      { hora: '19h', titulo: 'Saúde Mental, Comportamento e Qualidade de Vida' },
      { hora: '19h', titulo: 'Assessorias Esportivas para Corridas de Rua' },
      { hora: '19h', titulo: 'Sessão 1: Pôsteres e Comunicações Orais' }
    ]
  },
  '3': {
    label: 'Quarta-feira, 25/11/2026',
    curto: 'Qua 25/11',
    itens: [
      { hora: '14h', titulo: 'Cine Juris' },
      { hora: '14h', titulo: 'Competição de Direitos Humanos' },
      { hora: '19h', titulo: 'Conferência: Propriedade Intelectual e Sociobiodiversidade' },
      { hora: '19h', titulo: 'Cine Fórum: Amazônia em Cena' },
      { hora: '19h', titulo: 'Educação, Corpo e Mente' },
      { hora: '19h', titulo: 'Ergonomia e Atividade Física' },
      { hora: '19h', titulo: 'Sessão 2: Pôsteres, Comunicações e Mostra de Extensão' }
    ]
  },
  '4': {
    label: 'Quinta-feira, 26/11/2026',
    curto: 'Qui 26/11',
    itens: [
      { hora: '14h / 19h', titulo: 'Júri Simulado / NUJUR' },
      { hora: '19h', titulo: 'Competição de Direitos Humanos: UNINORTE x UNILASALLE' },
      { hora: '19h', titulo: 'Oficina 1: IA para Pesquisa Acadêmica e Análise de Dados' },
      { hora: '19h', titulo: 'Oficina 2: Avaliação Funcional e Tecnologia Vestível' },
      { hora: '19h', titulo: 'Oficina 3: Primeiros Socorros Emocionais e Escuta Ativa' },
      { hora: '19h', titulo: 'Oficina 4: Simulação de Negociação Internacional (ONU)' },
      { hora: '19h', titulo: 'Oficina 5: Hackathon Relâmpago de IA para a Amazônia' },
      { hora: '19h', titulo: '40ª Mostra de Iniciação Científica — Sessão 3' }
    ]
  },
  '5': {
    label: 'Sexta-feira, 27/11/2026',
    curto: 'Sex 27/11',
    itens: [
      { hora: '14h', titulo: 'Apresentação das Extensões (Resultados)' }
    ]
  }
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
  const diaRaw = typeof req.query.dia === 'string' ? req.query.dia.trim() : '';
  const diaValido = PROGRAMACAO[diaRaw] ? diaRaw : '2';
  const diaAtual = PROGRAMACAO[diaValido];

  const cardsHtml = diaAtual.itens
    .map((item, idx) => {
      const i = idx + 1;
      const tituloEscapado = escapeHtml(item.titulo);
      const horaEscapada = escapeHtml(item.hora);
      return `
        <div class="card">
            <h3>\${tituloEscapado}</h3>
            <span class="horario">Horário: \${horaEscapada}</span>
            <form class="form-avaliacao" data-indice="${i}" data-titulo="${tituloEscapado}">
                <label>Nota (1 a 5):</label>
                <div class="estrelas">
                    <input type="radio" id="n${i}-1" name="nota-${i}" value="1" required><label for="n\${i}-1">1</label>
                    <input type="radio" id="n${i}-2" name="nota-${i}" value="2"><label for="n\${i}-2">2</label>
                    <input type="radio" id="n${i}-3" name="nota-${i}" value="3"><label for="n\${i}-3">3</label>
                    <input type="radio" id="n${i}-4" name="nota-${i}" value="4"><label for="n\${i}-4">4</label>
                    <input type="radio" id="n${i}-5" name="nota-${i}" value="5"><label for="n\${i}-5">5</label>
                </div>
                <label for="sug-\${i}">Sugestões ou Comentários:</label>
                <textarea id="sug-\${i}" placeholder="Comentário opcional..."></textarea>
                <button type="submit" id="btn-\${i}">Enviar Avaliação</button>
            </form>
            <div id="msg-\${i}" class="msg"></div>
        </div>
      `;
    })
    .join('');

  res.set('Cache-Control', 'no-store');
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Avaliação - 9º CAIC</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f7f6; margin: 0; padding: 20px; display: flex; justify-content: center; }
        .container { width: 100%; max-width: 540px; }
        .header-card { background: #0056b3; color: white; padding: 22px; border-radius: 12px; text-align: center; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
        .header-card h1 { margin: 0 0 6px 0; font-size: 21px; }
        .header-card p { margin: 0 0 12px 0; font-size: 13px; opacity: 0.9; }
        .data-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 14px; }
        .card { background: white; padding: 22px; border-radius: 12px; box-shadow: 0 3px 10px rgba(0,0,0,0.08); margin-bottom: 18px; }
        .card h3 { margin: 0 0 6px 0; color: #222; font-size: 17px; }
        .horario { display: inline-block; background: #e9f2ff; color: #0056b3; font-size: 12px; font-weight: bold; padding: 3px 8px; border-radius: 4px; margin-bottom: 14px; }
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
        .rodape { text-align: center; font-size: 11px; color: #888; margin-top: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header-card">
            <h1>9º Congresso Amazônico de Iniciação Científica</h1>
            <p>Avaliação das Apresentações e Atividades</p>
            <div class="data-badge">\${escapeHtml(diaAtual.label)}</div>
        </div>
        <div id="listaApresentacoes">\${cardsHtml}</div>
        <div class="rodape">Versão: v2-
