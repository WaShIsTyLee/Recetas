import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { data: base64, ext } = req.body;
  if (!base64) return res.status(400).json({ error: 'Sin datos' });

  // Convertir base64 a Buffer
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  const filename = `fotos/${Date.now()}.${ext || 'jpg'}`;
  const mimeType = `image/${ext || 'jpeg'}`;

  const { error } = await supabase.storage
    .from('recetas-media')
    .upload(filename, buffer, { contentType: mimeType, upsert: true });

  if (error) return res.status(500).json({ error: error.message });

  const { data: urlData } = supabase.storage
    .from('recetas-media')
    .getPublicUrl(filename);

  return res.status(200).json({ path: urlData.publicUrl });
}