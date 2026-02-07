// Universidad Central - Dashboard de Procesos Institucionales
// Sistema de datos centralizado con respaldo dual (Supabase + localStorage)

// Variables globales
let procedimientos = [];
let lastUpdate = null;

// Configuración de columnas para la tabla
let COLUMN_CONFIG = [
    { key: 'sistema', label: 'SISTEMA', visible: true, editable: false },
    { key: 'subsistema', label: 'SUBSISTEMA', visible: true, editable: true },
    { key: 'proceso', label: 'PROCESO', visible: false, editable: true },
    { key: 'gestorFuncional', label: 'GESTOR FUNCIONAL PROCESO', visible: true, editable: true },
    { key: 'gestorOperativo', label: 'GESTOR OPERATIVO', visible: false, editable: true },
    { key: 'areaLider', label: 'AREA LÍDER', visible: true, editable: true },
    { key: 'numero', label: 'N°', visible: true, editable: true },
    { key: 'tipo', label: 'TIPO', visible: false, editable: true },
    { key: 'nombre', label: 'NOMBRE PROCEDIMIENTO', visible: true, editable: true },
    { key: 'seguimiento', label: 'SEGUIMIENTO', visible: false, editable: true },
    { key: 'responsableCp', label: 'RESPONSABLE CP', visible: false, editable: true },
    { key: 'estado', label: 'ESTADO GENERAL', visible: true, editable: false }
];

// Estados disponibles para los procedimientos
const ESTADOS = {
    'Pendiente': { color: '#6B7280', porcentaje: 0, descripcion: 'Procedimiento no iniciado' },
    'En Elaboración': { color: '#3B82F6', porcentaje: 20, descripcion: 'En desarrollo' },
    'En revisión': { color: '#F59E0B', porcentaje: 40, descripcion: 'Revisión interna' },
    'Pendiente Ajustes': { color: '#8B5CF6', porcentaje: 60, descripcion: 'Requiere correcciones' },
    'Ajustado': { color: '#10B981', porcentaje: 70, descripcion: 'Correcciones realizadas' },
    'Aprobado': { color: '#059669', porcentaje: 80, descripcion: 'Aprobado internamente' },
    'En el sistema': { color: '#059669', porcentaje: 100, descripcion: 'Implementado en sistema' }
};

// Sistemas organizacionales
const SISTEMAS = [
    'Rectoría',
    'Vicerrectoría Administrativa y Financiera',
    'Vicerrectoría Académica',
    'Vicerrectoría de Programas'
];

// Función mejorada para sincronización con Supabase
async function syncWithSupabase() {
    if (!window.supabase || window.SUPABASE_KEY === 'TU_ANON_KEY_AQUI') {
        return loadFromLocalStorage();
    }

    try {
        console.log('🔄 Sincronizando con Supabase...');
        
        const { data, error } = await window.supabase
            .from('procedimientos')
            .select('*')
            .order('sistema', { ascending: true });

        if (error) {
            console.error('❌ Error en Supabase:', error);
            return loadFromLocalStorage();
        }

        if (data && data.length > 0) {
            console.log(`✅ Supabase: ${data.length} registros recuperados`);
            
            // Mapear de snake_case (Supabase) a camelCase (App)
            procedimientos = data.map(p => ({
                id: p.id,
                nombre: p.nombre || '',
                sistema: p.sistema || '',
                subsistema: p.subsistema || '',
                areaLider: p.area_lider || '',
                gestorFuncional: p.gestor_funcional || '',
                gestorOperativo: p.gestor_operativo || '',
                estado: p.estado || 'Pendiente',
                proceso: p.proceso || '',
                numero: p.numero || '',
                tipo: p.tipo || '',
                seguimiento: p.seguimiento || '',
                responsableCp: p.responsable_cp || '',
                updatedAt: p.updated_at || p.created_at || null
            }));
            
            lastUpdate = new Date();
            saveToLocalStorage();
            return procedimientos;
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
            gestor_operativo: p.gestorOperativo || '',
            estado: p.estado,
            proceso: p.proceso,
            numero: p.numero,
            tipo: p.tipo || '',
            seguimiento: p.seguimiento || '',
            responsable_cp: p.responsableCp || '',
            // Guardar columnas adicionales si existen
            gestor_funcional_completo: p.gestorFuncionalCompleto || p.gestorFuncional || '',
            area_lider_completo: p.areaLiderCompleto || p.areaLider || ''
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
            console.log(`📂 LocalStorage: ${procedimientos.length} registros cargados localmente.`);
            window.procedimientos = procedimientos;
            return procedimientos;
        }
    } catch (e) {
        console.error('Error loading from localStorage:', e);
    }
    return [];
}

// Importación desde Excel mejorada
function importFromExcel(file, sistema, callback) {
    // Validación inicial
    if (!file) {
        callback(new Error('No se seleccionó ningún archivo.'), null);
        return;
    }
    
    // Validar librería XLSX con reintento
    if (typeof XLSX === 'undefined') {
        console.warn('XLSX no disponible, esperando y reintentando...');
        setTimeout(() => {
            if (typeof XLSX !== 'undefined') {
                importFromExcel(file, sistema, callback);
            } else {
                callback(new Error('Librería XLSX no disponible. Por favor, recarga la página.'), null);
            }
        }, 500);
        return;
    }
    
    console.log(`[Data] Procesando archivo: ${file.name} (${file.size} bytes)`);
    
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Intentar encontrar una hoja con datos, priorizando la primera
            let sheet = null;
            for (const name of workbook.SheetNames) {
                const s = workbook.Sheets[name];
                const range = XLSX.utils.decode_range(s['!ref'] || 'A1');
                if (range.e.r > 0) { // Si tiene más de una fila
                    sheet = s;
                    break;
                }
            }

            if (!sheet) sheet = workbook.Sheets[workbook.SheetNames[0]];
            const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

            if (!raw || raw.length === 0) {
                throw new Error("El archivo parece estar vacío.");
            }

            // Buscar la mejor fila de cabecera (la que contenga 'NOMBRE PROCEDIMIENTO' o más palabras clave)
            let hIndex = -1;
            let maxMatches = -1;
            const targetKeywords = ['NOMBRE', 'PROCEDIMIENTO', 'ESTADO', 'SISTEMA', 'SUBSISTEMA', 'AREA', 'GESTOR'];

            for (let i = 0; i < Math.min(30, raw.length); i++) {
                const row = raw[i];
                if (!row || !Array.isArray(row)) continue;

                let matches = 0;
                const rowStr = row.join(' ').toUpperCase();

                // Prioridad absoluta si contiene el nombre exacto de la columna principal
                if (rowStr.includes('NOMBRE PROCEDIMIENTO') || rowStr.includes('SUBSISTEMA')) {
                    hIndex = i;
                    break;
                }

                targetKeywords.forEach(k => {
                    if (rowStr.includes(k)) matches++;
                });

                if (matches > maxMatches && matches >= 2) {
                    maxMatches = matches;
                    hIndex = i;
                }
            }

            if (hIndex === -1) hIndex = 0; // Fallback a la primera fila

            const headers = raw[hIndex] || [];
            const colMap = { 
                nombre: -1, 
                subsistema: -1, 
                area: -1, 
                gestor: -1, 
                gestorOperativo: -1,
                estado: -1, 
                proceso: -1, 
                numero: -1,
                tipo: -1,
                seguimiento: -1,
                responsable: -1
            };

            headers.forEach((h, idx) => {
                if (h === undefined || h === null) return;
                const hh = h.toString().trim().toUpperCase();

                if (hh.includes('NOMBRE PROCEDIMIENTO')) colMap.nombre = idx;
                else if (hh === 'NOMBRE' && colMap.nombre === -1) colMap.nombre = idx;
                else if (hh.includes('SUBSISTEMA')) colMap.subsistema = idx;
                else if (hh.includes('AREA LÍDER') || hh.includes('AREA LIDER')) colMap.area = idx;
                else if (hh.includes('GESTOR FUNCIONAL PROCESO') || hh.includes('GESTOR FUNCIONAL')) colMap.gestor = idx;
                else if (hh.includes('GESTOR OPERATIVO')) colMap.gestorOperativo = idx;
                else if (hh.includes('ESTADO GENERAL') || hh === 'ESTADO') colMap.estado = idx;
                else if (hh === 'PROCESO') colMap.proceso = idx;
                else if (hh === 'N°' || hh === 'Nº' || hh === 'NUMERO' || hh === 'N.') colMap.numero = idx;
                else if (hh === 'TIPO') colMap.tipo = idx;
                else if (hh.includes('SEGUIMIENTO')) colMap.seguimiento = idx;
                else if (hh.includes('RESPONSABLE CP')) colMap.responsable = idx;
            });

            console.log("Detección de columnas:", colMap);

            if (colMap.nombre === -1) {
                // Si no encontramos la columna nombre, intentamos buscar una que se le parezca
                colMap.nombre = headers.findIndex(h => h && h.toString().toUpperCase().includes('NOMBRE'));
            }

            const results = [];
            for (let i = hIndex + 1; i < raw.length; i++) {
                const row = raw[i];
                // Validar que la fila tenga contenido en la columna de nombre
                if (!row || colMap.nombre === -1 || !row[colMap.nombre]) continue;

                const procNombre = row[colMap.nombre].toString().trim();
                if (!procNombre) continue;

                results.push({
                    id: Date.now() + results.length + Math.floor(Math.random() * 1000),
                    nombre: procNombre,
                    sistema: sistema,
                    subsistema: colMap.subsistema !== -1 ? (row[colMap.subsistema] || '').toString().trim() : '',
                    areaLider: colMap.area !== -1 ? (row[colMap.area] || '').toString().trim() : '',
                    gestorFuncional: colMap.gestor !== -1 ? (row[colMap.gestor] || '').toString().trim() : '',
                    gestorOperativo: colMap.gestorOperativo !== -1 ? (row[colMap.gestorOperativo] || '').toString().trim() : '',
                    estado: colMap.estado !== -1 ? (row[colMap.estado] || 'Pendiente').toString().trim() : 'Pendiente',
                    proceso: colMap.proceso !== -1 ? (row[colMap.proceso] || '').toString().trim() : '',
                    numero: colMap.numero !== -1 ? (row[colMap.numero] || '').toString().trim() : '',
                    tipo: colMap.tipo !== -1 ? (row[colMap.tipo] || '').toString().trim() : '',
                    seguimiento: colMap.seguimiento !== -1 ? (row[colMap.seguimiento] || '').toString().trim() : '',
                    responsableCp: colMap.responsable !== -1 ? (row[colMap.responsable] || '').toString().trim() : ''
                });
            }

            console.log(`Importación finalizada: ${results.length} registros encontrados.`);
            callback(null, results);
        } catch (err) {
            console.error("Error en importFromExcel:", err);
            callback(err, null);
        }
    };
    reader.onerror = function(err) {
        console.error("Error leyendo archivo:", err);
        callback(new Error('Error al leer el archivo. Verifica que no esté corrupto.'), null);
    };
    reader.readAsArrayBuffer(file);
}

// Inicialización
// Prioridad: Supabase > LocalStorage > Default
syncWithSupabase().then(() => {
    // Cargar configuración guardada
    loadColumnConfig();
    
    // Al finalizar la carga, disparar evento para que el resto de la app se entere
    window.dispatchEvent(new CustomEvent('dataLoaded'));
});

// Funciones esenciales para filtros y personalización
function filterProcedimientos(filters) {
    if (!window.procedimientos || !Array.isArray(window.procedimientos)) {
        return [];
    }
    
    return window.procedimientos.filter(proc => {
        // Filtro por sistema
        if (filters.sistema !== 'all' && proc.sistema !== filters.sistema) {
            return false;
        }
        
        // Filtro por subsistema
        if (filters.subsistema !== 'all' && proc.subsistema !== filters.subsistema) {
            return false;
        }
        
        // Filtro por estado
        if (filters.estado !== 'all' && getEstadoInfo(proc.estado).nombre !== filters.estado) {
            return false;
        }
        
        // Filtro por área líder
        if (filters.areaLider && !proc.areaLider.toLowerCase().includes(filters.areaLider.toLowerCase())) {
            return false;
        }
        
        // Filtro por gestor funcional
        if (filters.gestorFuncional && !proc.gestorFuncional.toLowerCase().includes(filters.gestorFuncional.toLowerCase())) {
            return false;
        }
        
        // Filtro de búsqueda
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const searchableFields = [proc.nombre, proc.subsistema, proc.areaLider, proc.gestorFuncional];
            if (!searchableFields.some(field => field && field.toLowerCase().includes(searchLower))) {
                return false;
            }
        }
        
        return true;
    });
}

function getEstadoInfo(estadoNombre) {
    if (!estadoNombre) return ESTADOS['Pendiente'] || { color: '#6B7280', porcentaje: 0, descripcion: 'Procedimiento no iniciado' };
    
    // Buscar estado exacto primero
    const estadoExacto = ESTADOS[estadoNombre];
    if (estadoExacto) return estadoExacto;
    
    // Buscar por propiedad nombre
    const estadoPorNombre = Object.values(ESTADOS).find(e => e.nombre === estadoNombre);
    if (estadoPorNombre) return estadoPorNombre;
    
    // Buscar por coincidencia parcial
    const estadoParcial = Object.entries(ESTADOS).find(([key]) => 
        key.toLowerCase().includes(estadoNombre.toLowerCase()) || 
        estadoNombre.toLowerCase().includes(key.toLowerCase())
    );
    
    return estadoParcial ? estadoParcial[1] : ESTADOS['Pendiente'];
}

function getSubsistemas() {
    if (!window.procedimientos || !Array.isArray(window.procedimientos)) {
        return [];
    }
    
    const subsistemas = [...new Set(window.procedimientos
        .map(p => p.subsistema)
        .filter(s => s && s.trim() !== '')
    )].sort();
    
    return subsistemas;
}

function getAreasLider() {
    if (!window.procedimientos || !Array.isArray(window.procedimientos)) {
        return [];
    }
    
    const areas = [...new Set(window.procedimientos
        .map(p => p.areaLider)
        .filter(a => a && a.trim() !== '')
    )].sort();
    
    return areas;
}

function getGestoresFuncionales() {
    if (!window.procedimientos || !Array.isArray(window.procedimientos)) {
        return [];
    }
    
    const gestores = [...new Set(window.procedimientos
        .map(p => p.gestorFuncional)
        .filter(g => g && g.trim() !== '')
    )].sort();
    
    return gestores;
}

function loadColumnConfig() {
    try {
        const saved = localStorage.getItem('column_config');
        if (saved) {
            const savedConfig = JSON.parse(saved);
            // Actualizar solo las propiedades existentes
            COLUMN_CONFIG.forEach((col, index) => {
                if (savedConfig[index]) {
                    col.visible = savedConfig[index].visible !== undefined ? savedConfig[index].visible : col.visible;
                    col.label = savedConfig[index].label || col.label;
                    col.editable = savedConfig[index].editable !== undefined ? savedConfig[index].editable : col.editable;
                }
            });
        }
    } catch (e) {
        console.warn('Error cargando configuración de columnas:', e);
    }
}

function saveColumnConfig() {
    try {
        localStorage.setItem('column_config', JSON.stringify(COLUMN_CONFIG));
        console.log('✅ Configuración de columnas guardada');
    } catch (e) {
        console.error('Error guardando configuración de columnas:', e);
    }
}

// Hacer todo global
window.ESTADOS = ESTADOS;
window.SISTEMAS = SISTEMAS;
window.COLUMN_CONFIG = COLUMN_CONFIG;
window.procedimientos = procedimientos;
window.filterProcedimientos = filterProcedimientos;
window.getEstadoInfo = getEstadoInfo;
window.getSubsistemas = getSubsistemas;
window.getAreasLider = getAreasLider;
window.getGestoresFuncionales = getGestoresFuncionales;
window.loadColumnConfig = loadColumnConfig;
window.saveColumnConfig = saveColumnConfig;

// Todo ya está disponible globalmente a través de window object