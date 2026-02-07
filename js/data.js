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
// Importación desde Excel robusta (Fuerza Bruta Inteligente)
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

            // Buscar la hoja más probable (la que tenga más datos)
            let sheet = workbook.Sheets[workbook.SheetNames[0]];
            let maxRows = 0;

            for (const name of workbook.SheetNames) {
                const s = workbook.Sheets[name];
                if (s['!ref']) {
                    const range = XLSX.utils.decode_range(s['!ref']);
                    const rows = range.e.r - range.s.r;
                    if (rows > maxRows) {
                        maxRows = rows;
                        sheet = s;
                    }
                }
            }

            const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

            if (!raw || raw.length === 0) throw new Error("Archivo vacío.");

            // DEBUG: Mostrar las primeras 10 filas para diagnóstico
            console.log("[Data] DEBUG - Primeras 10 filas del archivo:");
            for (let i = 0; i < Math.min(10, raw.length); i++) {
                console.log(`Fila ${i}:`, raw[i]);
            }

            // 1. ESTRATEGIA DE DETECCIÓN DE CABECERAS (FUERZA BRUTA INTELIGENTE)
            let headerRowIndex = -1;

            // Nivel 1: Búsqueda por coincidencia múltiple (ideal)
            const keywords = ['NOMBRE', 'PROCEDIMIENTO', 'SISTEMA', 'SUBSISTEMA', 'ESTADO', 'PROCESO', 'GESTOR', 'AREA'];

            for (let i = 0; i < Math.min(50, raw.length); i++) {
                const rowStr = raw[i].map(c => c ? c.toString().toUpperCase().trim() : '').join(' ');
                let matches = 0;
                keywords.forEach(k => { if (rowStr.includes(k)) matches++; });

                console.log(`[Data] Fila ${i} - Coincidencias: ${matches} - Contenido: "${rowStr.substring(0, 100)}..."`);

                if (matches >= 3) { // Si encuentra 3 o más coincidencias, es muy probable que sea la cabecera
                    headerRowIndex = i;
                    console.log(`[Data] Cabecera detectada (Nivel 1) en fila ${i}:`, raw[i]);
                    break;
                }
            }

            // Nivel 2: Búsqueda específica de columnas críticas (si falla Nivel 1)
            if (headerRowIndex === -1) {
                console.log("[Data] Nivel 1 falló, intentando Nivel 2...");
                for (let i = 0; i < Math.min(50, raw.length); i++) {
                    const rowStr = raw[i].map(c => c ? c.toString().toUpperCase().trim() : '').join(' ');
                    if ((rowStr.includes('NOMBRE') || rowStr.includes('PROCEDIMIENTO')) && (rowStr.includes('ESTADO') || rowStr.includes('SISTEMA'))) {
                        headerRowIndex = i;
                        console.log(`[Data] Cabecera detectada (Nivel 2) en fila ${i}:`, raw[i]);
                        break;
                    }
                }
            }

            // Nivel 3: Fallback (buscar cualquier fila con "NOMBRE PROCEDIMIENTO")
            if (headerRowIndex === -1) {
                console.log("[Data] Nivel 2 falló, intentando Nivel 3...");
                for (let i = 0; i < Math.min(50, raw.length); i++) {
                    const rowStr = raw[i].map(c => c ? c.toString().toUpperCase().trim() : '').join(' ');
                    if (rowStr.includes('NOMBRE PROCEDIMIENTO') || rowStr.includes('NOMBRE DEL PROCEDIMIENTO')) {
                        headerRowIndex = i;
                        console.log(`[Data] Cabecera detectada (Nivel 3) en fila ${i}:`, raw[i]);
                        break;
                    }
                }
            }

            if (headerRowIndex === -1) {
                console.warn("[Data] No se detectó cabecera. Usando fila 0 como fallback.");
                console.warn("[Data] Fila 0 completa:", raw[0]);
                headerRowIndex = 0;
            }

            // Normalizar headers para facilitar búsqueda
            const headers = raw[headerRowIndex].map(h => h ? h.toString().toUpperCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '');
            console.log("[Data] Headers normalizados:", headers);

            // Función auxiliar fuzzy match
            const findCol = (terms) => headers.findIndex(h => terms.some(t => h.includes(t)));

            // 2. MAPEO DE COLUMNAS (FUZZY MATCH)
            const colMap = {
                sistema: findCol(['SISTEMA']),
                subsistema: findCol(['SUBSISTEMA']),
                proceso: findCol(['PROCESO']),
                gestorFuncional: findCol(['GESTOR FUNCIONAL', 'GESTOR PROCESO', 'FUNCIONAL']),
                gestorOperativo: findCol(['GESTOR OPERATIVO', 'OPERATIVO']),
                areaLider: findCol(['AREA LIDER', 'AREA', 'LIDER']),
                numero: findCol(['N°', 'NUMERO', 'NO.']),
                tipo: findCol(['TIPO']),
                nombre: findCol(['NOMBRE PROCEDIMIENTO', 'NOMBRE', 'PROCEDIMIENTO']),
                seguimiento: findCol(['SEGUIMIENTO', 'REVISION']),
                responsableCp: findCol(['RESPONSABLE CP', 'RESPONSABLE']),
                estado: findCol(['ESTADO GENERAL', 'ESTADO'])
            };

            console.log("[Data] Mapa de columnas:", colMap);

            if (colMap.nombre === -1 && colMap.sistema === -1) {
                throw new Error("No se pudo identificar la estructura del archivo. Verifica los nombres de las columnas.");
            }

            // 3. PROCESAMIENTO Y FILTRADO
            const results = [];

            for (let i = headerRowIndex + 1; i < raw.length; i++) {
                const row = raw[i];
                if (!row) continue;

                const getVal = (idx) => (idx !== -1 && row[idx]) ? row[idx].toString().trim() : '';

                const nombre = getVal(colMap.nombre);
                const sistemaVal = getVal(colMap.sistema) || sistema;

                // CRITERIO DE VALIDEZ ESTRICTO
                // 1. Debe tener nombre
                if (!nombre || nombre.length < 3) continue;

                // 2. No debe ser fila de totales o basura
                const nombreUpper = nombre.toUpperCase();
                if (nombreUpper.includes('TOTAL') || nombreUpper.includes('RESUMEN')) continue;

                // 3. Si tiene menos de 2 caracteres en sistema y no se pasó como argumento, sospechoso
                if (!sistemaVal || sistemaVal.length < 2) {
                    // Si tampoco tiene estado, es basura casi seguro
                    if (!getVal(colMap.estado)) continue;
                }

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

            console.log(`[Data] Registros válidos extraídos: ${results.length}`);

            if (results.length === 0) {
                throw new Error("El archivo no contiene procedimientos válidos o no se reconocieron las columnas.");
            }

            callback(null, results);

        } catch (err) {
            console.error("[Data] Error crítico procesando Excel:", err);
            callback(err, null);
        }
    };
    reader.onerror = () => callback(new Error('Error de lectura del archivo'), null);
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