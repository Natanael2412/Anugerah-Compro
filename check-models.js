const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "MASUKKAN_KUNCI_API_ANDA_DI_SINI";

async function listModels() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
  const data = await response.json();
  
  console.log("=== DAFTAR MODEL GOOGLE GEMINI ===");
  data.models.forEach(model => {
    console.log(`- Nama: ${model.name.replace('models/', '')}`);
    console.log(`  Versi: ${model.version}`);
    console.log(`  Deskripsi: ${model.description}\n`);
  });
}

listModels();