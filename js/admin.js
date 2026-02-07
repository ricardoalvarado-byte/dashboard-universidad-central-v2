// La autenticación ahora se maneja mediante validación de hash o Supabase Auth.
// NO ALMACENAR CONTRASEÑAS EN TEXTO PLANO.
const ADMIN_HASH = '1f65bb51842cd58cc3f545a968600d8b76c8f9db195c470129a66ca7737e419c'; // SHA-256 corrección


// Estado de autenticación
let isAuthenticated = false;

// Función para inicializar panel administrativo
function initAdmin() {
    // Toggle entre vistas
    const toggleViewBtn = document.getElementById('toggleViewBtn');
    const backToDashboardBtn = document.getElementById('backToDashboardBtn');

    if (toggleViewBtn) {
        toggleViewBtn.addEventListener('click', () => {
            showAdminView();
        });
    }

    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener('click', () => {
            showDashboardView();
        });
    }

    // Login form
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });

    // Inicializar cargadores de archivos para cada sistema
    initMultiSystemUpload();

    // Inicializar botones de borrado y guardado
    initDeleteButtons();
    initSaveButton();

    // Actualizar contadores al cargar
    updateSystemCounts();

    // Verificar configuración de columnas
    renderColumnsConfig();

    // Verificar sesión guardada (CRÍTICO para refrescar página)
    checkSavedSession();

    // Botón para volver a vista de usuario desde el panel interno
    const viewDashboardBtn = document.getElementById('viewDashboardBtn');
    if (viewDashboardBtn) {
        viewDashboardBtn.addEventListener('click', () => {
            showDashboardView();
        });
    }

    // Verificar estado de Supabase
    checkSupabaseStatus();

    // Sincronizar UI con datos globales cuando carguen
    window.addEventListener('dataLoaded', () => {
        console.log("[Admin] Datos cargados, actualizando contadores...");
        updateSystemCounts();
    });

    // CRÍTICO: Si los datos ya están cargados (porque fetch terminó rápido), actualizar de una vez
    if (window.procedimientos && window.procedimientos.length > 0) {
        console.log("[Admin] Datos ya presentes al iniciar, actualizando contadores...");
        updateSystemCounts();
    }
}

function checkSupabaseStatus() {
    const statusDiv = document.createElement('div');
    statusDiv.id = 'supabaseStatus';
    statusDiv.style.cssText = 'font-size: 0.75rem; color: #94a3b8; margin-top: 5px; display: flex; align-items: center; gap: 5px;';

    const adminHeader = document.querySelector('.admin-header');
    if (adminHeader) {
        const titleArea = adminHeader.querySelector('div') || adminHeader.querySelector('.admin-title');
        titleArea.appendChild(statusDiv);
    }

    if (!window.supabase || window.SUPABASE_KEY === 'TU_ANON_KEY_AQUI') {
        statusDiv.innerHTML = '<span style="color: #f97316;">●</span> Supabase: No configurado - Usando modo local';
    } else {
        statusDiv.innerHTML = '<span style="color: #10b981;">●</span> Supabase: Conectado';
    }
}

// Función para mostrar vista de administración
function showAdminView() {
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('adminView').style.display = 'block';
}

// Función para mostrar vista de dashboard
function showDashboardView() {
    document.getElementById('dashboardView').style.display = 'block';
    document.getElementById('adminView').style.display = 'none';

    // Actualizar visualización (necesario para Chart.js cuando el canvas estaba oculto)
    if (typeof applyFilters === 'function') {
        applyFilters();
    }
}

// Función para manejar login (Restaurado para asegurar acceso total)
function handleLogin(e) {
    e.preventDefault();
    console.log("[Admin] Intento de login iniciado");

    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    console.log("[Admin] Usuario:", usernameInput);
    console.log("[Admin] Contraseña:", passwordInput ? "***" : "vacía");

    // Credenciales esperadas
    const VALID_USER = 'RALVARADOA';
    const VALID_PASS = 'RIKI2026$';
    
    console.log("[Admin] Usuario válido:", VALID_USER);
    console.log("[Admin] Validando usuario:", usernameInput.toUpperCase(), "===?", VALID_USER, "=>", usernameInput.toUpperCase() === VALID_USER);
    console.log("[Admin] Validando contraseña:", passwordInput, "===?", VALID_PASS, "=>", passwordInput === VALID_PASS);

    if (usernameInput.toUpperCase() === VALID_USER && passwordInput === VALID_PASS) {
        isAuthenticated = true;
        sessionStorage.setItem('uc_admin_session', 'true');
        console.log("[Admin] Autenticación exitosa, mostrando dashboard...");

        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';

        document.getElementById('loginFormElement').reset();
        errorDiv.style.display = 'none';
        console.log("[Admin] Sesión iniciada correctamente.");
    } else {
        console.log("[Admin] Autenticación fallida");
        errorDiv.textContent = 'Usuario o contraseña incorrectos';
        errorDiv.style.display = 'block';
    }
}

// Función para manejar logout
function handleLogout() {
    isAuthenticated = false;
    sessionStorage.removeItem('uc_admin_session');

    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';

    // Volver a vista pública
    showDashboardView();
}

// Función para verificar sesión guardada
function checkSavedSession() {
    const savedSession = sessionStorage.getItem('uc_admin_session');
    if (savedSession === 'true') {
        isAuthenticated = true;
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
    }
}

// Función para cambiar de tab
function switchTab(tabName) {
    // Actualizar botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Actualizar contenido
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const activeTab = document.getElementById(tabName + 'Tab');
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

// Función para inicializar cargadores múltiples por sistema
function initMultiSystemUpload() {
    console.log("[Admin] Inicializando sistema de carga por sistema...");
    
    const uploadCards = document.querySelectorAll('.system-upload-card');
    if (uploadCards.length === 0) {
        console.warn("[Admin] No se encontraron tarjetas de upload. El DOM podría no estar listo.");
        setTimeout(initMultiSystemUpload, 500); // Reintentar
        return;
    }

    uploadCards.forEach(card => {
        const uploadArea = card.querySelector('.upload-area');
        const fileInput = card.querySelector('.file-input');
        const filePreview = card.querySelector('.file-preview');
        const confirmBtn = card.querySelector('.confirm-import-btn');
        const cancelBtn = card.querySelector('.cancel-import-btn');
        const previewTable = card.querySelector('.preview-table');

        const sistema = uploadArea.dataset.sistema;
        let pendingData = null;

        // Click para seleccionar archivo
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag & drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--uc-green-light)';
            uploadArea.style.background = 'rgba(74, 222, 128, 0.1)';
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            uploadArea.style.background = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            uploadArea.style.background = '';

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0], sistema, uploadArea, filePreview, previewTable, (data) => {
                    pendingData = data;
                });
            }
        });

        // Selección de archivo
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0], sistema, uploadArea, filePreview, previewTable, (data) => {
                    pendingData = data;
                });
            }
        });

        // Confirmar importación
        confirmBtn.addEventListener('click', () => {
            console.log(`[Admin] Click en confirmar para sistema: ${sistema}`);

            if (!pendingData) {
                console.error("[Admin] Error: pendingData es null o undefined");
                alert("Error: No hay datos pendientes para confirmar. Por favor intente cargar el archivo nuevamente.");
                return;
            }

            try {
                console.log(`[Admin] Confirmando ${pendingData.length} registros...`);

                // Eliminar datos anteriores de este sistema (normalizar cadenas para comparación segura)
                const sistemaNormalizado = sistema.trim().toLowerCase();
                window.procedimientos = (window.procedimientos || []).filter(p => (p.sistema || '').trim().toLowerCase() !== sistemaNormalizado);

                // Agregar nuevos datos
                window.procedimientos = window.procedimientos.concat(pendingData);
                procedimientos = window.procedimientos; // Sincronizar local

                // Guardar en Supabase y LocalStorage
                console.log("[Admin] Sincronizando con la nube...");
                if (typeof window.saveToSupabase === 'function') {
                    window.saveToSupabase(window.procedimientos).then(() => {
                        console.log("[Admin] Supabase sincronizado.");
                        // Guardar fecha de actualización
                        saveLastUpdateDate();
                        // Forzar recarga de contadores para asegurar visualización
                        updateSystemCounts();
                    });
                } else {
                    saveToLocalStorage();
                    saveLastUpdateDate();
                    updateSystemCounts();
                }

                // Actualizar UI
                if (typeof updateSubsistemaOptions === 'function') updateSubsistemaOptions();
                if (typeof applyFilters === 'function') applyFilters();

                // Mostrar mensaje de éxito
                alert(`✅ Importación exitosa para ${sistema}!\n\nSe han guardado ${pendingData.length} procedimientos.`);

                // Reset
                pendingData = null;
                resetUploadArea(uploadArea, fileInput);
                filePreview.style.display = 'none';

                console.log("[Admin] Proceso de confirmación finalizado correctamente.");

            } catch (error) {
                console.error("[Admin] Error al confirmar importación:", error);
                alert(`Error inesperado al guardar datos: ${error.message}`);
            }
        });

        // Cancelar importación
        cancelBtn.addEventListener('click', () => {
            pendingData = null;
            resetUploadArea(uploadArea, fileInput);
            filePreview.style.display = 'none';
        });
    });
}

// Función para manejar archivo seleccionado
function handleFileSelect(file, sistema, uploadArea, filePreview, previewTableDiv, callback) {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
        alert('Formato de archivo no válido. Por favor, selecciona un archivo Excel (.xlsx, .xls) o CSV (.csv)');
        return;
    }

    // Mostrar loading con timeout
    uploadArea.innerHTML = `
        <div class="upload-icon">⏳</div>
        <p class="upload-text">Procesando archivo...</p>
    `;

    // Agregar timeout de 30 segundos
    let timeoutId = setTimeout(() => {
        alert('⏰ Tiempo de espera agotado. El archivo es muy grande o hay un problema de procesamiento.');
        resetUploadArea(uploadArea, null);
    }, 30000);

    // Importar archivo
    importFromExcel(file, sistema, (error, data) => {
        // Limpiar timeout
        clearTimeout(timeoutId);
        
        if (error) {
            console.error('Error en importFromExcel:', error);
            alert('Error al procesar el archivo: ' + error.message);
            resetUploadArea(uploadArea, null);
            return;
        }

        if (!data || data.length === 0) {
            alert('⚠️ No se encontraron procedimientos válidos en el archivo. Verifica los nombres de las columnas.');
            resetUploadArea(uploadArea, null);
            return;
        }

        console.log(`✅ Archivo procesado: ${data.length} procedimientos encontrados`);
        
        // Mostrar preview
        callback(data);
        showImportPreview(data, sistema, uploadArea, filePreview, previewTableDiv);
    });
}

// Función para mostrar preview
// Función para mostrar preview con protección XSS
function showImportPreview(data, sistema, uploadArea, filePreview, previewTableDiv) {
    uploadArea.style.display = 'none';
    filePreview.style.display = 'block';

    const visibleColumns = COLUMN_CONFIG.filter(col => col.visible);

    // Limpiar contenido previo de forma segura
    previewTableDiv.innerHTML = '';

    const infoText = document.createElement('p');
    infoText.style.cssText = 'margin-bottom: 1rem; color: var(--text-secondary);';
    infoText.innerHTML = `Se encontraron <strong style="color: var(--uc-green-light);">${data.length}</strong> procedimientos para <strong style="color: var(--uc-green-light);">${escapeHTML(sistema)}</strong>.`;
    previewTableDiv.appendChild(infoText);

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-wrapper';
    tableWrapper.style.cssText = 'max-height: 300px; overflow-y: auto;';

    const table = document.createElement('table');
    table.className = 'data-table';

    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    visibleColumns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col.label;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    data.slice(0, 5).forEach(proc => {
        const tr = document.createElement('tr');
        visibleColumns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = proc[col.key] || '';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    if (data.length > 5) {
        const moreRow = document.createElement('tr');
        const moreTd = document.createElement('td');
        moreTd.colSpan = visibleColumns.length;
        moreTd.style.cssText = 'text-align: center; color: var(--text-muted); font-style: italic;';
        moreTd.textContent = `... y ${data.length - 5} más`;
        moreRow.appendChild(moreTd);
        tbody.appendChild(moreRow);
    }

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    previewTableDiv.appendChild(tableWrapper);
}

// Función auxiliar para escapar HTML (Prevenir XSS)
function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


// Función para resetear área de carga
function resetUploadArea(uploadArea, fileInput) {
    uploadArea.style.display = 'block';
    const sistema = uploadArea.dataset.sistema;
    const sistemaShort = sistema.replace('Vicerrectoría ', 'V. ');

    uploadArea.innerHTML = `
        <div class="upload-icon">📁</div>
        <p class="upload-text">Arrastra archivo Excel de ${sistemaShort}</p>
        <p class="upload-hint">.xlsx, .xls, .csv</p>
    `;

    // Validar que fileInput existe y no es null
    if (fileInput && fileInput.value !== undefined) {
        fileInput.value = '';
    }
}

// Función para inicializar botón de guardado total
function initSaveButton() {
    const saveAllBtn = document.getElementById('saveAllDataBtn');
    if (saveAllBtn) {
        saveAllBtn.addEventListener('click', handleSaveAll);
    }
}

async function handleSaveAll() {
    const saveAllBtn = document.getElementById('saveAllDataBtn');
    const originalText = saveAllBtn.innerHTML;

    try {
        saveAllBtn.disabled = true;
        saveAllBtn.innerHTML = '<span class="icon">⏳</span> Guardando...';

        if (typeof window.saveToSupabase === 'function') {
            await window.saveToSupabase(window.procedimientos);
            saveLastUpdateDate();
            alert('✅ Todos los cambios han sido sincronizados con Supabase correctamente.');
        } else {
            saveToLocalStorage();
            saveLastUpdateDate();
            alert('✅ Cambios guardados localmente (Supabase no configurado).');
        }
    } catch (error) {
        console.error('Error al guardar todo:', error);
        alert('❌ Error al sincronizar con la nube. Revisa la consola para más detalles.');
    } finally {
        saveAllBtn.disabled = false;
        saveAllBtn.innerHTML = originalText;
    }
}

// Función para inicializar botones de borrado
function initDeleteButtons() {
    // Botón de borrado total
    const deleteAllBtn = document.getElementById('deleteAllDataBtn');
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', handleDeleteAll);
    }

    // Botones de borrado por sistema
    const deleteSystemBtns = document.querySelectorAll('.btn-delete-system');
    deleteSystemBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const sistema = btn.dataset.sistema;
            handleDeleteSystem(sistema);
        });
    });
}

// Función para borrar todos los datos
function handleDeleteAll() {
    const confirmDelete = confirm(
        '⚠️ ADVERTENCIA: Borrado Total\n\n' +
        'Esto eliminará TODOS los procedimientos de TODOS los sistemas.\n\n' +
        `Total de procedimientos: ${procedimientos.length}\n\n` +
        '¿Estás seguro de que deseas continuar?'
    );

    if (confirmDelete) {
        const secondConfirm = confirm(
            '🚨 ÚLTIMA CONFIRMACIÓN\n\n' +
            'Esta acción NO se puede deshacer.\n\n' +
            '¿Realmente deseas borrar todos los datos?'
        );

        if (secondConfirm) {
            procedimientos = [];

            // Borrado en Supabase
            if (window.supabase && window.SUPABASE_KEY !== 'TU_ANON_KEY_AQUI') {
                window.supabase.from('procedimientos').delete().neq('id', 0).then(() => {
                    console.log('Datos borrados de Supabase');
                });
            }

            saveToLocalStorage();
            updateSystemCounts();
            applyFilters();

            alert('✅ Todos los datos han sido eliminados correctamente.');
        }
    }
}

// Función para borrar datos de un sistema específico
function handleDeleteSystem(sistema) {
    if (!window.procedimientos) return;

    // Normalizar para conteo seguro
    const sistemaNormalizado = sistema.trim().toLowerCase();
    const count = window.procedimientos.filter(p => (p.sistema || '').trim().toLowerCase() === sistemaNormalizado).length;

    if (count === 0) {
        alert(`ℹ️ No hay datos para eliminar en ${sistema}`);
        return;
    }

    const confirmDelete = confirm(
        `⚠️ Borrar Datos de ${sistema}\n\n` +
        `Se eliminarán ${count} procedimiento(s).\n\n` +
        'Los datos de otros sistemas NO se afectarán.\n\n' +
        '¿Deseas continuar?'
    );

    if (confirmDelete) {
        // Eliminar procedimientos del sistema
        const sistemaNormalizado = sistema.trim().toLowerCase();
        window.procedimientos = window.procedimientos.filter(p => (p.sistema || '').trim().toLowerCase() !== sistemaNormalizado);
        procedimientos = window.procedimientos; // Sincronizar local

        // Guardar y actualizar
        if (window.supabase && window.SUPABASE_KEY !== 'TU_ANON_KEY_AQUI') {
            window.supabase.from('procedimientos').delete().eq('sistema', sistema).then(() => {
                console.log(`Datos de ${sistema} borrados de Supabase`);
            });
        }

        saveToLocalStorage();
        updateSystemCounts();
        applyFilters();

        alert(`✅ Se eliminaron ${count} procedimiento(s) de ${sistema}`);
    }
}

// Función para normalizar texto (quitar acentos y dejar en minúsculas)
function normalizeText(text) {
    if (!text) return '';
    return text.toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

// Función para actualizar contadores de procedimientos por sistema
function updateSystemCounts() {
    if (!window.procedimientos) {
        console.warn("[Admin] No hay procedimientos cargados para contar.");
        return;
    }

    const countElements = document.querySelectorAll('.system-count');
    console.log(`[Admin] Actualizando contadores UI para ${window.procedimientos.length} registros...`);

    countElements.forEach(el => {
        const sistemaDataset = el.dataset.sistema;
        // Normalización ultra-robusta
        const sistemaPanelNorm = normalizeText(sistemaDataset)
            .replace('vicerrectoria', 'v.')
            .replace('v. ', 'v.');

        const matches = window.procedimientos.filter(p => {
            const procSistemaNorm = normalizeText(p.sistema)
                .replace('vicerrectoria', 'v.')
                .replace('v. ', 'v.');

            return procSistemaNorm === sistemaPanelNorm ||
                procSistemaNorm.includes(sistemaPanelNorm) ||
                sistemaPanelNorm.includes(procSistemaNorm);
        });

        const count = matches.length;
        el.textContent = `${count} procedimiento${count !== 1 ? 's' : ''}`;

        // Actualizar también el dataset de los botones de borrado cercanos para consistencia
        const card = el.closest('.system-upload-card');
        if (card) {
            const deleteBtn = card.querySelector('.btn-delete-system');
            if (deleteBtn) deleteBtn.dataset.currentCount = count;
        }

        if (count > 0) {
            el.style.color = '#10b981';
            el.style.fontWeight = '700';
        } else {
            el.style.color = '';
            el.style.fontWeight = '';
        }
    });
}

// --- Configuración de Columnas ---

function renderColumnsConfig() {
    const container = document.getElementById('columnsConfig');
    if (!container) return;

    // Asegurarse de que COLUMN_CONFIG existe
    if (typeof COLUMN_CONFIG === 'undefined') return;

    container.innerHTML = `
        <div class="table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 80px; text-align: center;">Ver</th>
                        <th>Etiqueta (Título en la Tabla)</th>
                        <th>Campo de Datos</th>
                    </tr>
                </thead>
                <tbody>
                    ${COLUMN_CONFIG.map((col, index) => `
                        <tr>
                            <td style="text-align: center;">
                                <input type="checkbox" 
                                    ${col.visible ? 'checked' : ''} 
                                    onchange="updateColumnVisibility(${index}, this.checked)"
                                    style="transform: scale(1.5); cursor: pointer;">
                            </td>
                            <td>
                                <input type="text" 
                                    value="${col.label}"
                                    onchange="updateColumnLabel(${index}, this.value)"
                                    style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: white;">
                            </td>
                             <td><code style="color: var(--text-muted);">${col.key}</code></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div style="margin-top: 1rem; text-align: right;">
             <button class="btn-primary" onclick="saveColumnsToStorage()">💾 Guardar Cambios</button>
        </div>
    `;
}

// Funciones globales para que el HTML string pueda llamarlas
window.updateColumnVisibility = (index, visible) => {
    COLUMN_CONFIG[index].visible = visible;
};

window.updateColumnLabel = (index, label) => {
    COLUMN_CONFIG[index].label = label;
};

window.saveColumnsToStorage = () => {
    if (typeof saveColumnConfig === 'function') {
        saveColumnConfig();
        alert('✅ Configuración de columnas actualizada exitosamente.');
    } else {
        localStorage.setItem('column_config', JSON.stringify(COLUMN_CONFIG));
        alert('✅ Configuración de columnas actualizada exitosamente.');
    }

    // Recargar vista si es necesario
    if (typeof applyFilters === 'function') applyFilters();
    
    // Recargar tabla para mostrar cambios
    if (typeof renderTable === 'function') renderTable();

    // Volver a renderizar para asegurar estado visual
    renderColumnsConfig();
};

// Función para guardar fecha de última actualización
function saveLastUpdateDate() {
    const now = new Date();
    window.lastUpdateDate = now;
    localStorage.setItem('uc_last_update', now.toISOString());
    if (typeof window.updateLastUpdateDisplay === 'function') {
        window.updateLastUpdateDisplay();
    }
}

// Inicializar admin al cargar
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Admin] DOM cargado, inicializando panel administrativo...');
    setTimeout(initAdmin, 100); // Pequeña espera para asegurar que todo esté listo
});

