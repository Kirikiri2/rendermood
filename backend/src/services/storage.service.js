import { supabase } from "../config/supabase.js";

const BUCKET = "Rendermood";

export async function uploadImage(file) {
  const fileName = `${Date.now()}-${file.originalname}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw error;

  const { data: publicUrl } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return {
    key: fileName,
    url: publicUrl.publicUrl,
  };
}