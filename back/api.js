const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { body, validationResult } = require('express-validator');


const app = express();
const porta = 3030;

const db = new sqlite3.Database('./banco.db');

db.run(`
  CREATE TABLE IF NOT EXISTS agendamentos (
    id INTEGER PRIMARY KEY, 
    data DATE, 
    hora TEXT,
    paciente TEXT,
    medico TEXT,
    status TEXT
  )
`);

app.use(express.json());
app.use(cors());

app.get('/api/agendamentos', (req, res) => {
  db.all('SELECT * FROM agendamentos', (erro, registros) => {
    if (erro) {
      return res.status(500).json({ erro: erro.message });
    }
    res.json(registros);
  });
});

app.post('/api/agendamentos', [
  body('data').isDate(),
  body('hora').isString(),
  body('paciente').isString(),
  body('medico').isString(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { data, hora, paciente, medico } = req.body;
  const status = 'marcado';

  db.run('INSERT INTO agendamentos (data, hora, paciente, medico, status) VALUES (?, ?, ?, ?, ?)', [data, hora, paciente, medico, status], function (erro) {
    if (erro) {
      return res.status(500).json({ erro: erro.message });
    }
    res.status(201).json({ mensagem: 'Agendamento adicionado com sucesso', id: this.lastID });
  });
});

app.patch('/api/agendamentos/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run('UPDATE agendamentos SET status = ? WHERE id = ?', status, id, function (erro) {
    if (erro) {
      return res.status(500).json({ erro: erro.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado' });
    }
    res.json({ mensagem: 'Agendamento marcado como concluído!' });
  });
});



app.delete('/api/agendamentos/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM agendamentos WHERE id = ?', id, function (erro) {
    if (erro) {
      return res.status(500).json({ erro: erro.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ mensagem: 'Tarefa não encontrada' });
    }
    res.json({ mensagem: 'Tarefa excluída com sucesso' });
  });
});

app.listen(porta, () => {
  console.log(`Servidor rodando em localhost:${porta}`);
});
