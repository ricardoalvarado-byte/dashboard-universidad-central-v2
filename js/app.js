// Archivo principal de la aplicación
// Coordina todos los módulos y maneja eventos globales

// Inicialización global
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎓 Dashboard Universidad Central - Iniciando...');

    // Mostrar mensaje de bienvenida
    showWelcomeAnimation();

    // Inicializar todos los módulos
    initializeApp();

    // Escuchar cuando los datos terminen de cargar (desde Supabase o LocalStorage)
    window.addEventListener('dataLoaded', () => {
        console.log('✅ Datos sincronizados. Actualizando UI...');
        
        // Pequeña espera para asegurar que todas las funciones estén cargadas
        setTimeout(() => {
            // Inicializar filtros si no están inicializados
            if (typeof initFilters === 'function') {
                initFilters();
            }
            
            // Actualizar opciones de subsistemas
            if (typeof updateSubsistemaOptions === 'function') {
                updateSubsistemaOptions();
            }
            
            // Renderizar configuración de columnas
            if (typeof renderColumnsConfig === 'function') {
                renderColumnsConfig();
            }
            
            // Aplicar filtros iniciales
            if (typeof applyFilters === 'function') {
                applyFilters();
            }
            
            // Mostrar fecha de actualización
            updateLastUpdateDisplay();
            
            console.log('✅ UI completamente actualizada');
        }, 100);
    });
});

// Función para mostrar animación de bienvenida
function showWelcomeAnimation() {
    // Agregar clase de animación al body
    document.body.classList.add('fade-in');

    // Animar elementos principales
    const elements = document.querySelectorAll('.glass-card, .kpi-card, .chart-card');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';

        setTimeout(() => {
            el.style.transition = 'all 0.5s ease-in-out';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// Función para inicializar la aplicación
function initializeApp() {
    // Agregar listeners globales
    addGlobalListeners();

    // Los datos se cargan asíncronamente en data.js
    // La UI se actualizará cuando se dispare el evento 'dataLoaded'

    console.log('✅ Sistema base inicializado correctamente');
}

// Función para actualizar el componente de fecha de actualización
function updateLastUpdateDisplay() {
    const container = document.getElementById('lastUpdateContainer');
    const dateSpan = document.getElementById('lastUpdateDate');

    // Prioridad: 1. Variable global (de Supabase), 2. LocalStorage
    const lastUpdate = window.lastUpdateDate || localStorage.getItem('uc_last_update');

    if (container && dateSpan && lastUpdate) {
        container.style.display = 'block';
        const dateObj = (lastUpdate instanceof Date) ? lastUpdate : new Date(lastUpdate);
        dateSpan.textContent = formatDate(dateObj);
    }
}
window.updateLastUpdateDisplay = updateLastUpdateDisplay;


// Función para agregar listeners globales
function addGlobalListeners() {
    // Detectar cambios de tamaño de ventana
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Re-renderizar gráficos para ajustar al nuevo tamaño
            if (donutChart) donutChart.resize();
            if (barChart) barChart.resize();
        }, 250);
    });

    // Detectar teclas de acceso rápido
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K: Enfocar búsqueda
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('tableSearch');
            if (searchInput) {
                searchInput.focus();
            }
        }

        // Escape: Limpiar filtros
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('tableSearch');
            if (searchInput && document.activeElement === searchInput) {
                searchInput.value = '';
                currentFilters.search = '';
                applyFilters();
            }
        }
    });

    // Prevenir pérdida de datos no guardados (en modo admin)
    window.addEventListener('beforeunload', (e) => {
        // Solo mostrar advertencia si hay cambios pendientes
        // Por ahora, los datos se guardan automáticamente en localStorage
    });
}

// Utilidades globales

// Función para formatear fechas
function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    return date.toLocaleDateString('es-CO', options);
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'rgba(34, 197, 94, 0.1)' :
            type === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                'rgba(59, 130, 246, 0.1)'};
        border: 1px solid ${type === 'success' ? 'rgba(34, 197, 94, 0.3)' :
            type === 'error' ? 'rgba(239, 68, 68, 0.3)' :
                'rgba(59, 130, 246, 0.3)'};
        color: ${type === 'success' ? '#86efac' :
            type === 'error' ? '#fca5a5' :
                '#93c5fd'};
        border-radius: 0.75rem;
        backdrop-filter: blur(20px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        animation: slideInRight 0.3s ease-in-out;
        max-width: 400px;
        font-size: 0.875rem;
        font-weight: 500;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Agregar animaciones CSS para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Función para validar datos de procedimiento
function validateProcedimiento(proc) {
    const errors = [];

    if (!proc.nombre || proc.nombre.trim() === '') {
        errors.push('El nombre del procedimiento es obligatorio');
    }

    if (!proc.sistema || !SISTEMAS.includes(proc.sistema)) {
        errors.push('El sistema seleccionado no es válido');
    }

    if (!proc.subsistema || proc.subsistema.trim() === '') {
        errors.push('El subsistema es obligatorio');
    }

    if (!proc.areaLider || proc.areaLider.trim() === '') {
        errors.push('El área líder es obligatoria');
    }

    if (!proc.gestorFuncional || proc.gestorFuncional.trim() === '') {
        errors.push('El gestor funcional es obligatorio');
    }

    if (!proc.estado || !ESTADOS.find(e => e.nombre === proc.estado)) {
        errors.push('El estado seleccionado no es válido');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Función para generar ID único
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Función para capitalizar texto
function capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Función para truncar texto
function truncate(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Exportar funciones globales para uso en otros módulos
window.dashboardUtils = {
    formatDate,
    showNotification,
    validateProcedimiento,
    generateId,
    capitalize,
    truncate
};

console.log('📦 Utilidades globales cargadas');
