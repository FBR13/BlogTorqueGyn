import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// CORS liberado para garantir que a Vercel consiga ler a API sem bloqueios
app.use(cors({ origin: '*' }));
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Rota Raiz (Para você testar clicando no link do Render)
app.get('/', (req, res) => {
    res.send('<h1>Motor do TorqueGyn está online e roncando alto! 🏎️💨</h1><p>Acesse /api/health para status.</p>');
});

// 1. Rota de Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'TorqueGyn API is running! 🏎️💨' });
});

// 🚨 A ROTA QUE FALTAVA: Buscar TODOS os posts (Para alimentar a Home e o Blog)
app.get('/api/posts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar APENAS UM post detalhado (Para ler a matéria completa)
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single(); // Garante que retorne apenas 1 objeto

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Matéria não encontrada' });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar um Post (Painel Admin)
app.post('/api/posts', async (req, res) => {
    try {
        const { title, description, content, image_url, brand } = req.body;
        const { data, error } = await supabase
            .from('posts')
            .insert([{ title, description, content, image_url, brand }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deletar um Post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Editorial removido do acervo.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/portfolio', async (req, res) => {
  try {
    const { data, error } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/portfolio', async (req, res) => {
  try {
    const { title, description, images, brand } = req.body;
    const { data, error } = await supabase.from('portfolio').insert([{ title, description, images, brand }]);
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/portfolio/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('portfolio').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Obra removida do acervo.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`[Backend] Servidor rodando na porta ${PORT}`);
});