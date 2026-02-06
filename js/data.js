// Estados con sus porcentajes y colores de semaforización
const ESTADOS = [
    { nombre: 'Pendiente', porcentaje: 0, color: '#ef4444', descripcion: 'No se ha iniciado la elaboración del procedimiento ni se ha entregado borrador a la Coordinación de Procesos.' },
    { nombre: 'En Elaboración', porcentaje: 20, color: '#f97316', descripcion: 'Se cuenta con un borrador del procedimiento en desarrollo.' },
    { nombre: 'En Revisión', porcentaje: 40, color: '#eab308', descripcion: 'La Coordinación de Procesos está revisando el documento presentado.' },
    { nombre: 'Pendiente Ajustes', porcentaje: 60, color: '#fbbf24', descripcion: 'La Coordinación de Procesos devolvió el documento con observaciones y ajustes solicitados.' },
    { nombre: 'Ajustado', porcentaje: 70, color: '#84cc16', descripcion: 'El área responsable realizó los ajustes solicitados al documento.' },
    { nombre: 'Aprobado', porcentaje: 80, color: '#22c55e', descripcion: 'El líder del área revisó y aprobó el documento antes de su carga al sistema.' },
    { nombre: 'En el Sistema', porcentaje: 100, color: '#10b981', descripcion: 'El procedimiento está cargado en el sistema Isolución con las aprobaciones correspondientes.' }
];

// Sistemas principales
const SISTEMAS = [
    'Rectoría',
    'Vicerrectoría Administrativa y Financiera',
    'Vicerrectoría Académica',
    'Vicerrectoría de Programas'
];

// Configuración de columnas (mapeo y visualización)
let COLUMN_CONFIG = JSON.parse(localStorage.getItem('column_config')) || [
    { key: 'sistema', label: 'SISTEMA', visible: true, editable: false }, // Fijo
    { key: 'subsistema', label: 'SUBSISTEMA', visible: true, editable: true },
    { key: 'proceso', label: 'PROCESO', visible: false, editable: true }, // Nuevo campo
    { key: 'gestorFuncional', label: 'GESTOR FUNCIONAL PROCESO', visible: true, editable: true },
    { key: 'areaLider', label: 'AREA LÍDER', visible: true, editable: true },
    { key: 'numero', label: 'N°', visible: true, editable: true }, // Nuevo campo
    { key: 'nombre', label: 'NOMBRE PROCEDIMIENTO', visible: true, editable: true },
    { key: 'estado', label: 'ESTADO GENERAL', visible: true, editable: false } // Fijo
];

// Datos iniciales (se sobreescriben por Supabase o localStorage)
let procedimientos = [];

// Función para obtener información del estado de forma segura (insensible a mayúsculas/espacios)
function getEstadoInfo(nombreEstado) {
    if (!nombreEstado) return ESTADOS[0];
    const nombreLimpio = nombreEstado.toString().trim().toLowerCase();
    return ESTADOS.find(e => e.nombre.toLowerCase() === nombreLimpio) || ESTADOS[0];
}

// Función para obtener todos los subsistemas únicos
function getSubsistemas() {
    return [...new Set(procedimientos.map(p => (p.subsistema || '').trim()))].filter(Boolean).sort();
}

function getAreasLideres() {
    return [...new Set(procedimientos.map(p => (p.areaLider || '').trim()))].filter(Boolean).sort();
}

function getGestores() {
    return [...new Set(procedimientos.map(p => (p.gestorFuncional || '').trim()))].filter(Boolean).sort();
}

// Función para filtrar procedimientos
function filterProcedimientos(filters) {
    return procedimientos.filter(proc => {
        // Filtro por sistema
        if (filters.sistema && filters.sistema !== 'all' && (proc.sistema || '').trim() !== filters.sistema) return false;

        // Filtro por subsistema
        if (filters.subsistema && filters.subsistema !== 'all' && (proc.subsistema || '').trim() !== filters.subsistema) return false;

        // Filtro por estado
        if (filters.estado && filters.estado !== 'all' && (proc.estado || '').trim() !== filters.estado) return false;

        // Búsqueda parcial Área Líder
        if (filters.areaLider && !(proc.areaLider || '').toLowerCase().includes(filters.areaLider.toLowerCase())) return false;

        // Búsqueda parcial Gestor
        if (filters.gestorFuncional && !(proc.gestorFuncional || '').toLowerCase().includes(filters.gestorFuncional.toLowerCase())) return false;

        // Búsqueda general
        if (filters.search) {
            const s = filters.search.toLowerCase();
            return (proc.nombre || '').toLowerCase().includes(s) ||
                (proc.sistema || '').toLowerCase().includes(s) ||
                (proc.areaLider || '').toLowerCase().includes(s) ||
                (proc.estado || '').toLowerCase().includes(s);
        }

        return true;
    });
}

// Función para calcular estadísticas robusta
function calculateStats(data = procedimientos) {
    const safeData = data || [];
    const stats = {
        total: safeData.length,
        porEstado: {},
        porSistema: {},
        promedioAvance: 0
    };

    // Inicializar contadores
    ESTADOS.forEach(e => stats.porEstado[e.nombre] = 0);
    SISTEMAS.forEach(s => {
        stats.porSistema[s] = { total: 0, promedioAvance: 0, porEstado: {} };
        ESTADOS.forEach(e => stats.porSistema[s].porEstado[e.nombre] = 0);
    });

    let sumaTotalAvance = 0;

    safeData.forEach(proc => {
        const estadoRaw = (proc.estado || 'Pendiente').trim();
        const sistemaRaw = (proc.sistema || '').trim();
        const info = getEstadoInfo(estadoRaw);

        sumaTotalAvance += info.porcentaje;

        // El nombre real en el objeto stats debe coincidir con el de ESTADOS.find...
        // pero usamos el nombre exacto del objeto info para mayor seguridad.
        if (stats.porEstado[info.nombre] !== undefined) stats.porEstado[info.nombre]++;

        if (stats.porSistema[sistemaRaw]) {
            stats.porSistema[sistemaRaw].total++;
            if (stats.porSistema[sistemaRaw].porEstado[info.nombre] !== undefined) {
                stats.porSistema[sistemaRaw].porEstado[info.nombre]++;
            }
        }
    });

    stats.promedioAvance = safeData.length > 0 ? Math.round(sumaTotalAvance / safeData.length) : 0;
    return stats;
}

// Persistencia en Supabase
async function fetchFromSupabase() {
    if (!window.supabase || window.SUPABASE_KEY === 'TU_ANON_KEY_AQUI') {
        console.warn('Supabase no configurado. Usando localStorage.');
        return loadFromLocalStorage();
    }

    try {
        const { data, error } = await window.supabase
            .from('procedimientos')
            .select('*');

        if (error) throw error;

        if (data && data.length > 0) {
            console.log(`✅ Supabase: Se recuperaron ${data.length} registros exitosamente.`);

            // Mapear de snake_case (Supabase) a camelCase (App)
            procedimientos = data.map(p => ({
                id: p.id,
                nombre: p.nombre || '',
                sistema: p.sistema || '',
                subsistema: p.subsistema || '',
                areaLider: p.area_lider || '',
                gestorFuncional: p.gestor_funcional || '',
                estado: p.estado || 'Pendiente',
                proceso: p.proceso || '',
                numero: p.numero || '',
                updatedAt: p.updated_at || p.created_at || null
            }));

            // Calcular última fecha de actualización
            const dates = procedimientos
                .map(p => p.updatedAt)
                .filter(Boolean)
                .map(d => new Date(d).getTime());

            if (dates.length > 0) {
                const latestDate = new Date(Math.max(...dates));
                window.lastUpdateDate = latestDate;
                localStorage.setItem('uc_last_update', latestDate.toISOString());
            }

            window.procedimientos = procedimientos;
            return true;
        } else {
            console.warn('ℹ️ Supabase: La consulta retornó 0 registros o falló. Datos devueltos:', data);
            return loadFromLocalStorage();
        }
    } catch (e) {
        console.error('❌ Error crítico al conectar con Supabase:', e.message);
        console.error('Stack trace:', e.stack);
        if (e.message && e.message.includes('relation "procedimientos" does not exist')) {
            console.error('⚠️ LA TABLA "procedimientos" NO EXISTE EN SUPABASE. Por favor, asegúrate de haber ejecutado el script SQL de creación de tabla.');
        }
        return loadFromLocalStorage();
    }
}

async function saveToSupabase(dataToSave = procedimientos) {
    if (!window.supabase || window.SUPABASE_KEY === 'TU_ANON_KEY_AQUI') {
        return saveToLocalStorage();
    }

    try {
        // Mapear de camelCase (App) a snake_case (Supabase)
        const normalizedData = (Array.isArray(dataToSave) ? dataToSave : [dataToSave]).map(p => ({
            id: p.id,
            nombre: p.nombre,
            sistema: p.sistema,
            subsistema: p.subsistema,
            area_lider: p.areaLider,
            gestor_funcional: p.gestorFuncional,
            estado: p.estado,
            proceso: p.proceso,
            numero: p.numero
        }));

        const { error } = await window.supabase
            .from('procedimientos')
            .upsert(normalizedData);

        if (error) throw error;

        // También guardar en localStorage como respaldo redundante
        saveToLocalStorage();
        return true;
    } catch (e) {
        console.error('Error saving to Supabase:', e);
        return saveToLocalStorage();
    }
}

// Persistencia Local (Fallback)
function saveToLocalStorage() {
    try {
        localStorage.setItem('uc_procedimientos', JSON.stringify(procedimientos));
        window.procedimientos = procedimientos; // Sincronizar global
        console.log(`💾 LocalStorage: ${procedimientos.length} registros guardados localmente.`);
        return true;
    } catch (e) {
        console.error('Error saving data to localStorage:', e);
        return false;
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('uc_procedimientos');
        if (saved) {
            procedimientos = JSON.parse(saved);
            console.log(`📂 LocalStorage: Se cargaron ${procedimientos.length} registros desde el almacenamiento local.`);
        } else {
            console.log('📂 LocalStorage: No hay datos guardados localmente.');
            procedimientos = [];
        }
        window.procedimientos = procedimientos; // Exponer globalmente
        return true;
    } catch (e) {
        console.error('Error loading data from localStorage:', e);
        return false;
    }
}

// Importación
function importFromExcel(file, sistema, callback) {
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Buscar cabecera
            let hIndex = 0;
            const keywords = ['NOMBRE', 'PROCEDIMIENTO', 'PROCESO'];
            for (let i = 0; i < Math.min(20, raw.length); i++) {
                if (raw[i] && raw[i].some(c => typeof c === 'string' && keywords.some(k => c.toUpperCase().includes(k)))) {
                    hIndex = i; break;
                }
            }

            const headers = raw[hIndex] || [];
            const colMap = { nombre: -1, subsistema: -1, area: -1, gestor: -1, estado: -1 };
            headers.forEach((h, idx) => {
                if (!h) return;
                const hh = h.toString().toUpperCase();
                if (hh.includes('NOMBRE PROCEDIMIENTO')) colMap.nombre = idx;
                else if (hh.includes('SUBSISTEMA')) colMap.subsistema = idx;
                else if (hh.includes('AREA LÍDER')) colMap.area = idx;
                else if (hh.includes('GESTOR FUNCIONAL')) colMap.gestor = idx;
                else if (hh.includes('ESTADO GENERAL')) colMap.estado = idx;
            });

            const results = [];
            for (let i = hIndex + 1; i < raw.length; i++) {
                const row = raw[i];
                if (!row || !row[colMap.nombre]) continue;
                results.push({
                    id: Date.now() + results.length,
                    nombre: row[colMap.nombre].toString().trim(),
                    sistema: sistema,
                    subsistema: colMap.subsistema !== -1 ? (row[colMap.subsistema] || '').toString().trim() : '',
                    areaLider: colMap.area !== -1 ? (row[colMap.area] || '').toString().trim() : '',
                    gestorFuncional: colMap.gestor !== -1 ? (row[colMap.gestor] || '').toString().trim() : '',
                    estado: colMap.estado !== -1 ? (row[colMap.estado] || 'Pendiente').toString().trim() : 'Pendiente'
                });
            }
            callback(null, results);
        } catch (err) { callback(err, null); }
    };
    reader.readAsArrayBuffer(file);
}

// Inicialización
// Prioridad: Supabase > LocalStorage > Default
fetchFromSupabase().then(() => {
    // Al finalizar la carga, disparar evento para que el resto de la app se entere
    window.dispatchEvent(new CustomEvent('dataLoaded'));
});

window.ESTADOS = ESTADOS;
window.SISTEMAS = SISTEMAS;
window.procedimientos = procedimientos;
window.getEstadoInfo = getEstadoInfo;
window.getSubsistemas = () => [...new Set(window.procedimientos.map(p => (p.subsistema || '').trim()))].filter(Boolean).sort();
window.getAreasLideres = () => [...new Set(window.procedimientos.map(p => (p.areaLider || '').trim()))].filter(Boolean).sort();
window.getGestores = () => [...new Set(window.procedimientos.map(p => (p.gestorFuncional || '').trim()))].filter(Boolean).sort();
window.filterProcedimientos = filterProcedimientos;
window.calculateStats = calculateStats;
window.saveToLocalStorage = saveToLocalStorage;
window.saveToSupabase = saveToSupabase;
window.fetchFromSupabase = fetchFromSupabase;
window.importFromExcel = importFromExcel;
