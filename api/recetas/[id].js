import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { method, query, body } = req;
  const id = parseInt(query.id);

  if (!id) return res.status(400).json({ error: 'ID inválido' });

  // GET /api/recetas/[id]
  if (method === 'GET') {
    const { data, error } = await supabase
      .from('recetas')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return res.status(404).json({ error: 'Receta no encontrada' });
    return res.status(200).json(data);
  }

  // PUT /api/recetas/[id]
  if (method === 'PUT') {
    const { data, error } = await supabase
      .from('recetas')
      .update({ ...body, fecha_modificacion: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  // DELETE /api/recetas/[id]
  if (method === 'DELETE') {
    const { error } = await supabase.from('recetas').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}