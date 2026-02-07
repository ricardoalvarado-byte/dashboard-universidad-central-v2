// Configuración de Supabase
window.SUPABASE_URL = 'https://nrqgcatuibdkafidzdft.supabase.co';
window.SUPABASE_KEY = 'sb_publishable_Lmq_ESQPAb4wMzTd6977Qg_GVoBeXFk'; // Key de Supabase proporcionada por el usuario

const supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);

window.supabase = supabaseClient;
