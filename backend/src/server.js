import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// 1. Rota de Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'TorqueGyn API is running! 🏎️💨' });
});

// 2. Rota Oficial de Posts (A que o Frontend está chamando agora!)
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single(); // Garante que retorne apenas 1 objeto, não um array

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Matéria não encontrada' });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Rota para Criar um Post (Usaremos no painel Admin depois)
app.post('/api/posts', async (req, res) => {
    try {
        const { title, description, content, image_url, brand } = req.body;

        const { data, error } = await supabase
            .from('posts')
            .insert([
                { title, description, content, image_url, brand }
            ])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Editorial removido do acervo.' });
  } catch (error) {
    console.error("Erro ao deletar:", error);
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

// Criar item no Portfólio
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

// Deletar item do Portfólio
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