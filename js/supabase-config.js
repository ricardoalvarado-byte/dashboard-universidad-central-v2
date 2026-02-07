// Configuración de Supabase
window.SUPABASE_URL = 'https://nrqgcatuibdkafidzdft.supabase.co';
window.SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ycWdjYXR1aWJka2FmaWR6ZGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDAzMTEsImV4cCI6MjA4NTg3NjMxMX0.ApUY4IIOmAC9lyS6KhMgguVKPUHln3ZxTViTFb7X60M'; // Anon key para compatibilidad

const supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);

window.supabase = supabaseClient;

console.log('✅ Supabase configurado correctamente');
