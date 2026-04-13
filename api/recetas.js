import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { method, query, body } = req;

  // GET /api/recetas
  if (method === 'GET') {
    let q = supabase
      .from('recetas')
      .select('*')
      .order('fecha_creacion', { ascending: false });

    if (query.usuario)   q = q.eq('usuario', query.usuario);
    if (query.favorito)  q = q.eq('favorito', true);
    if (query.categoria) q = q.eq('categoria', query.categoria);
    if (query.busqueda) {
      q = q.or(
        `nombre.ilike.%${query.busqueda}%,descripcion.ilike.%${query.busqueda}%,ingredientes.ilike.%${query.busqueda}%`
      );
    }

    const { data, error } = await q;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // POST /api/recetas
  if (method === 'POST') {
    const { data, error } = await supabase
      .from('recetas')
      .insert([{ ...body, fecha_creacion: new Date().toISOString(), fecha_modificacion: new Date().toISOString() }])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}