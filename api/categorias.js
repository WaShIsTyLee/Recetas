import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { usuario } = req.query;

  let q = supabase.from('recetas').select('categoria');
  if (usuario) q = q.eq('usuario', usuario);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const cats = [...new Set(data.map(r => r.categoria).filter(Boolean))].sort();
  return res.status(200).json(cats);
}