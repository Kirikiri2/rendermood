import { supabase } from "../config/supabase.js";

const BUCKET = "Rendermood";

export async function uploadImage(file) {
  const fileName = `options/${Date.now()}-${file.originalname}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return data.publicUrl;
}