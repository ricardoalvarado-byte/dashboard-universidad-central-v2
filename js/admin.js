// Credenciales de administrador (en producción, esto debe estar en el backend)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123' // En producción, usar hash bcrypt
};

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

// Función para manejar login
function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    // Validar credenciales
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isAuthenticated = true;

        // Guardar sesión
        sessionStorage.setItem('uc_admin_session', 'true');

        // Mostrar dashboard admin
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';

        // Limpiar formulario
        document.getElementById('loginFormElement').reset();
        errorDiv.style.display = 'none';
    } else {
        // Mostrar error
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
    const uploadCards = document.querySelectorAll('.system-upload-card');

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
                procedimientos = procedimientos.filter(p => (p.sistema || '').trim().toLowerCase() !== sistemaNormalizado);

                // Agregar nuevos datos
                procedimientos = procedimientos.concat(pendingData);
                window.procedimientos = procedimientos; // Sincronizar global

                // Guardar en Supabase y LocalStorage
                console.log("[Admin] Sincronizando con la nube...");
                if (typeof window.saveToSupabase === 'function') {
                    window.saveToSupabase(window.procedimientos).then(() => {
                        console.log("[Admin] Supabase sincronizado.");
                        // Forzar recarga de contadores para asegurar visualización
                        updateSystemCounts();
                    });
                } else {
                    saveToLocalStorage();
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

    // Mostrar loading
    uploadArea.innerHTML = `
        <div class="upload-icon">⏳</div>
        <p class="upload-text">Procesando archivo...</p>
    `;

    // Importar archivo
    importFromExcel(file, sistema, (error, data) => {
        if (error) {
            alert('Error al procesar el archivo: ' + error.message);
            resetUploadArea(uploadArea, null);
            return;
        }

        // Mostrar preview
        callback(data);
        showImportPreview(data, sistema, uploadArea, filePreview, previewTableDiv);
    });
}

// Función para mostrar preview
// Función para mostrar preview
function showImportPreview(data, sistema, uploadArea, filePreview, previewTableDiv) {
    uploadArea.style.display = 'none';
    filePreview.style.display = 'block';

    // Usar solo columnas visibles de la configuración
    const visibleColumns = COLUMN_CONFIG.filter(col => col.visible);

    previewTableDiv.innerHTML = `
        <p style="margin-bottom: 1rem; color: var(--text-secondary);">
            Se encontraron <strong style="color: var(--uc-green-light);">${data.length}</strong> procedimientos para <strong style="color: var(--uc-green-light);">${sistema}</strong>.
        </p>
        <div class="table-wrapper" style="max-height: 300px; overflow-y: auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        ${visibleColumns.map(col => `<th>${col.label}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.slice(0, 5).map(proc => `
                        <tr>
                            ${visibleColumns.map(col => `<td>${proc[col.key] || ''}</td>`).join('')}
                        </tr>
                    `).join('')}
                    ${data.length > 5 ? `
                        <tr>
                            <td colspan="${visibleColumns.length}" style="text-align: center; color: var(--text-muted); font-style: italic;">
                                ... y ${data.length - 5} más
                            </td>
                        </tr>
                    ` : ''}
                </tbody>
            </table>
        </div>
    `;
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

    if (fileInput) {
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
            alert('✅ Todos los cambios han sido sincronizados con Supabase correctamente.');
        } else {
            saveToLocalStorage();
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
    localStorage.setItem('column_config', JSON.stringify(COLUMN_CONFIG));
    alert('✅ Configuración de columnas actualizada exitosamente.');

    // Recargar vista si es necesario
    if (typeof applyFilters === 'function') applyFilters();

    // Volver a renderizar para asegurar estado visual
    renderColumnsConfig();
};

// Inicializar admin al cargar
document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
});
