// Universidad Central - Dashboard de Procesos Institucionales
// Sistema de datos centralizado con respaldo dual (Supabase + localStorage)

// Variables globales
let procedimientos = [];
let lastUpdate = null;

// Configuración de columnas para la tabla (orden según Excel)
let COLUMN_CONFIG = [
    { key: 'sistema', label: 'SISTEMA', visible: true, editable: false },
    { key: 'subsistema', label: 'SUBSISTEMA', visible: true, editable: true },
    { key: 'proceso', label: 'PROCESO', visible: true, editable: true },
    { key: 'gestorFuncional', label: 'GESTOR FUNCIONAL PROCESO', visible: true, editable: true },
    { key: 'gestorOperativo', label: 'GESTOR OPERATIVO PROCESO', visible: true, editable: true },
    { key: 'areaLider', label: 'AREA LÍDER', visible: true, editable: true },
    { key: 'numero', label: 'N°', visible: true, editable: true },
    { key: 'tipo', label: 'TIPO', visible: true, editable: true },
    { key: 'nombre', label: 'NOMBRE PROCEDIMIENTO', visible: true, editable: true },
    { key: 'seguimiento', label: 'SEGUIMIENTO', visible: true, editable: true },
    { key: 'responsableCp', label: 'RESPONSABLE CP', visible: true, editable: true },
    { key: 'estado', label: 'ESTADO GENERAL', visible: true, editable: true }
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
        console.log('⚠️ Supabase no configurado, guardando solo en localStorage');
        return saveToLocalStorage();
    }

    try {
        console.log(`📤 Intentando guardar ${Array.isArray(dataToSave) ? dataToSave.length : 1} registros en Supabase...`);

        // Mapear de camelCase (App) a snake_case (Supabase)
        const normalizedData = (Array.isArray(dataToSave) ? dataToSave : [dataToSave]).map(p => ({
            id: p.id,
            nombre: p.nombre || '',
            sistema: p.sistema || '',
            subsistema: p.subsistema || '',
            area_lider: p.areaLider || '',
            gestor_funcional: p.gestorFuncional || '',
            gestor_operativo: p.gestorOperativo || '',
            estado: p.estado || 'Pendiente',
            proceso: p.proceso || '',
            numero: p.numero || '',
            tipo: p.tipo || '',
            seguimiento: p.seguimiento || '',
            responsable_cp: p.responsableCp || ''
        }));

        console.log('📋 Ejemplo de datos normalizados:', normalizedData[0]);

        const { data, error } = await window.supabase
            .from('procedimientos')
            .upsert(normalizedData, {
                onConflict: 'id',
                ignoreDuplicates: false
            })
            .select();

        if (error) {
            console.error('❌ Error de Supabase:', error);
            throw error;
        }

        console.log(`✅ ${normalizedData.length} registros guardados exitosamente en Supabase`);

        // También guardar en localStorage como respaldo redundante
        saveToLocalStorage();
        return true;
    } catch (e) {
        console.error('❌ Error crítico al guardar en Supabase:', e);
        console.error('Detalles del error:', e.message, e.details, e.hint);
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
// Importación desde Excel mejorada y estricta
function importFromExcel(file, sistema, callback) {
    if (!file) {
        callback(new Error('No se seleccionó ningún archivo.'), null);
        return;
    }

    if (typeof XLSX === 'undefined') {
        setTimeout(() => {
            if (typeof XLSX !== 'undefined') importFromExcel(file, sistema, callback);
            else callback(new Error('Librería XLSX no disponible.'), null);
        }, 500);
        return;
    }

    console.log(`[Data] Procesando archivo: ${file.name}`);

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Buscar hoja válida
            let sheet = workbook.Sheets[workbook.SheetNames[0]]; // Por defecto la primera
            // Intentar buscar hoja que tenga datos si la primera parece vacía
            for (const name of workbook.SheetNames) {
                const s = workbook.Sheets[name];
                if (s['!ref']) {
                    const range = XLSX.utils.decode_range(s['!ref']);
                    if (range.e.r > 5) { // Si tiene más de 5 filas, es candidata
                        sheet = s;
                        break;
                    }
                }
            }

            // Convertir a matriz de datos (array de arrays)
            const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

            if (!raw || raw.length === 0) throw new Error("Archivo vacío.");

            // 1. Encontrar la FILA DE ENCABEZADOS exacta
            // Buscamos una fila que contenga al menos 3 de nuestras columnas clave
            let headerRowIndex = -1;
            const requiredHeaders = ['SISTEMA', 'SUBSISTEMA', 'PROCESO', 'NOMBRE PROCEDIMIENTO', 'ESTADO GENERAL'];

            for (let i = 0; i < Math.min(20, raw.length); i++) {
                const rowStr = raw[i].map(c => c ? c.toString().toUpperCase().trim() : '').join(' ');
                let matches = 0;
                requiredHeaders.forEach(h => { if (rowStr.includes(h)) matches++; });

                if (matches >= 2) { // Si encuentra al menos 2 columnas clave, es la cabecera
                    headerRowIndex = i;
                    break;
                }
            }

            if (headerRowIndex === -1) {
                // Si no encuentra cabecera clara, asume fila 0 pero advierte
                console.warn("No se detectó fila de cabecera clara, usando fila 0");
                headerRowIndex = 0;
            }

            const headers = raw[headerRowIndex].map(h => h ? h.toString().toUpperCase().trim() : '');
            console.log("Cabeceras encontradas:", headers);

            // 2. Mapear Índices de Columnas
            const colMap = {
                sistema: headers.indexOf('SISTEMA'),
                subsistema: headers.indexOf('SUBSISTEMA'),
                proceso: headers.indexOf('PROCESO'),
                gestorFuncional: -1, // Se busca abajo
                gestorOperativo: -1, // Se busca abajo
                areaLider: -1, // Se busca abajo
                numero: -1,
                tipo: headers.indexOf('TIPO'),
                nombre: -1, // Crítico
                seguimiento: headers.indexOf('SEGUIMIENTO'),
                responsableCp: -1,
                estado: -1
            };

            // Búsqueda flexible para columnas con nombres variados
            headers.forEach((h, idx) => {
                if (h === 'GESTOR FUNCIONAL PROCESO' || h === 'GESTOR FUNCIONAL') colMap.gestorFuncional = idx;
                if (h === 'GESTOR OPERATIVO PROCESO' || h === 'GESTOR OPERATIVO') colMap.gestorOperativo = idx;
                if (h === 'AREA LÍDER' || h === 'ÁREA LÍDER' || h === 'AREA LIDER') colMap.areaLider = idx;
                if (h === 'N°' || h === 'NUMERO' || h === 'NO.') colMap.numero = idx;
                if (h === 'NOMBRE PROCEDIMIENTO' || h === 'NOMBRE DEL PROCEDIMIENTO') colMap.nombre = idx;
                if (h === 'RESPONSABLE CP' || h === 'RESPONSABLE') colMap.responsableCp = idx;
                if (h === 'ESTADO GENERAL' || h === 'ESTADO') colMap.estado = idx;
            });

            console.log("Mapa de columnas:", colMap);

            // 3. Procesar Filas (Filtrado estricto)
            const results = [];

            for (let i = headerRowIndex + 1; i < raw.length; i++) {
                const row = raw[i];
                if (!row) continue;

                // Obtener datos usando el mapa
                const getVal = (idx) => (idx !== -1 && row[idx]) ? row[idx].toString().trim() : '';

                const nombre = getVal(colMap.nombre);
                const sistemaVal = getVal(colMap.sistema) || sistema; // Usa el del excel o el pasado por parámetro

                // CRITERIO DE EXCLUSIÓN: 
                // Si no tiene "Nombre Procedimiento" Y no tiene "Sistema", es basura/fila vacía.
                if (!nombre && !getVal(colMap.sistema)) continue;

                // Si dice "Total" o parece un pie de página, ignorar
                if (nombre.toUpperCase().includes('TOTAL') || sistemaVal.toUpperCase().includes('TOTAL')) continue;

                results.push({
                    id: Date.now() + results.length + Math.floor(Math.random() * 10000),
                    sistema: sistemaVal,
                    subsistema: getVal(colMap.subsistema),
                    proceso: getVal(colMap.proceso),
                    gestorFuncional: getVal(colMap.gestorFuncional),
                    gestorOperativo: getVal(colMap.gestorOperativo),
                    areaLider: getVal(colMap.areaLider),
                    numero: getVal(colMap.numero),
                    tipo: getVal(colMap.tipo),
                    nombre: nombre,
                    seguimiento: getVal(colMap.seguimiento),
                    responsableCp: getVal(colMap.responsableCp),
                    estado: getVal(colMap.estado) || 'Pendiente'
                });
            }

            console.log(`Importación finalizada: ${results.length} registros válidos.`);
            callback(null, results);

        } catch (err) {
            console.error("Error crítico procesando Excel:", err);
            callback(err, null);
        }
    };
    reader.onerror = () => callback(new Error('Error de lectura'), null);
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

function calculateStats(data) {
    if (!data || !Array.isArray(data)) {
        return {
            total: 0,
            porEstado: {},
            porSistema: {},
            porArea: {}
        };
    }

    const stats = {
        total: data.length,
        porEstado: {},
        porSistema: {},
        porArea: {}
    };

    // Contar por estado
    Object.values(ESTADOS).forEach(estado => {
        stats.porEstado[estado.nombre] = 0;
    });

    // Contar por sistema y área
    data.forEach(proc => {
        // Por estado
        if (proc.estado && stats.porEstado[proc.estado] !== undefined) {
            stats.porEstado[proc.estado]++;
        } else if (proc.estado) {
            stats.porEstado[proc.estado] = (stats.porEstado[proc.estado] || 0) + 1;
        }

        // Por sistema
        if (proc.sistema) {
            stats.porSistema[proc.sistema] = (stats.porSistema[proc.sistema] || 0) + 1;
        }

        // Por área
        if (proc.areaLider) {
            stats.porArea[proc.areaLider] = (stats.porArea[proc.areaLider] || 0) + 1;
        }
    });

    return stats;
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
window.calculateStats = calculateStats;
window.getAreasLider = getAreasLider;
window.getGestoresFuncionales = getGestoresFuncionales;
window.loadColumnConfig = loadColumnConfig;
window.saveColumnConfig = saveColumnConfig;

// Todo ya está disponible globalmente a través de window object