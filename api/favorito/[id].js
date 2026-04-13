import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const id = parseInt(req.query.id);
  if (!id) return res.status(400).json({ error: 'ID inválido' });

  // Leer estado actual
  const { data: rec, error: errGet } = await supabase
    .from('recetas')
    .select('favorito')
    .eq('id', id)
    .single();

  if (errGet) return res.status(404).json({ error: 'No encontrada' });

  const nuevoFav = !rec.favorito;
  const { error } = await supabase
    .from('recetas')
    .update({ favorito: nuevoFav, fecha_modificacion: new Date().toISOString() })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ favorito: nuevoFav });
}