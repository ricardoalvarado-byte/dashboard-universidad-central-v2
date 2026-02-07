// Estado global de filtros
let currentFilters = {
    sistema: 'all',
    subsistema: 'all',
    estado: 'all',
    areaLider: '',
    gestorFuncional: '',
    search: ''
};

// Función para inicializar filtros
function initFilters() {
    // Filtros de sistema (chips)
    const sistemaFilters = document.getElementById('sistemaFilters');
    if (sistemaFilters) {
        sistemaFilters.addEventListener('click', (e) => {
            if (e.target.classList.contains('chip')) {
                sistemaFilters.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
                e.target.classList.add('active');
                currentFilters.sistema = e.target.dataset.sistema;
                updateSubsistemaOptions(); // Actualizar subsistemas dinámicamente
                applyFilters();
            }
        });
    }

    // Filtro de subsistema
    const subsistemaFilter = document.getElementById('subsistemaFilter');
    if (subsistemaFilter) {
        updateSubsistemaOptions();
        subsistemaFilter.addEventListener('change', (e) => {
            currentFilters.subsistema = e.target.value;
            applyFilters();
        });
    }

    // Área Líder
    const areaFilter = document.getElementById('areaFilter');
    if (areaFilter) {
        areaFilter.addEventListener('input', debounce((e) => {
            currentFilters.areaLider = e.target.value;
            applyFilters();
        }, 300));
    }

    // Gestor
    const gestorFilter = document.getElementById('gestorFilter');
    if (gestorFilter) {
        gestorFilter.addEventListener('input', debounce((e) => {
            currentFilters.gestorFuncional = e.target.value;
            applyFilters();
        }, 300));
    }

    // Botón Limpiar
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Inicializar estados (solo una vez)
    initEstadoFilters();

    // Aplicar filtros iniciales
    applyFilters();
}

function updateSubsistemaOptions() {
    const filter = document.getElementById('subsistemaFilter');
    if (!filter) return;

    // Obtener procedimientos base (filtrados por sistema si aplica)
    let validProcs = window.procedimientos || [];

    if (currentFilters.sistema !== 'all') {
        // Filtrado exacto porque los chips usan el nombre completo
        validProcs = validProcs.filter(p => p.sistema === currentFilters.sistema);
    }

    const subs = [...new Set(validProcs
        .map(p => p.subsistema)
        .filter(s => s && s.trim() !== '')
    )].sort();

    // Guardar selección actual para intentar mantenerla
    const currentVal = filter.value;

    filter.innerHTML = '<option value="all">Todos los subsistemas</option>';
    subs.forEach(s => {
        const op = document.createElement('option');
        op.value = s;
        op.textContent = s;
        filter.appendChild(op);
    });

    // Mantener selección si sigue siendo válida, si no, resetear
    if (subs.includes(currentVal)) {
        filter.value = currentVal;
    } else {
        filter.value = 'all';
        currentFilters.subsistema = 'all';
    }
}

function initEstadoFilters() {
    const container = document.getElementById('estadoFilters');
    if (!container) return;
    container.innerHTML = ''; // Evitar duplicados

    // Opción Todos
    container.appendChild(createEstadoFilterItem({ nombre: 'Todos', color: '#64748b' }, 'all'));

    // Estados reales
    Object.values(ESTADOS).forEach(e => {
        container.appendChild(createEstadoFilterItem(e, e.nombre));
    });
}

function createEstadoFilterItem(estado, value) {
    const item = document.createElement('div');
    item.className = 'estado-filter-item' + (currentFilters.estado === value ? ' active' : '');
    item.dataset.estado = value;

    const nameDiv = document.createElement('div');
    nameDiv.className = 'estado-name';
    const indicator = document.createElement('span');
    indicator.className = 'estado-indicator';
    indicator.style.backgroundColor = estado.color;
    const text = document.createElement('span');
    text.textContent = estado.nombre;
    nameDiv.appendChild(indicator);
    nameDiv.appendChild(text);

    // Agregar tooltip si hay descripción
    if (estado.descripcion) {
        item.title = estado.descripcion;
        item.style.cursor = 'help';
    }

    const countDiv = document.createElement('div');
    countDiv.className = 'estado-count';
    countDiv.textContent = '0';

    item.appendChild(nameDiv);
    item.appendChild(countDiv);

    item.addEventListener('click', () => {
        document.querySelectorAll('.estado-filter-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        currentFilters.estado = value;
        applyFilters();
    });

    return item;
}

function updateEstadoFilterCounts(filteredData) {
    const items = document.querySelectorAll('.estado-filter-item');
    // Para los conteos individuales, filtramos por todo menos por el estado para ver "disponibles"
    const dataWithoutStateFilter = filterProcedimientos({ ...currentFilters, estado: 'all' });

    items.forEach(item => {
        const val = item.dataset.estado;
        const badge = item.querySelector('.estado-count');
        if (!badge) return;

        if (val === 'all') {
            badge.textContent = dataWithoutStateFilter.length;
        } else {
            const count = dataWithoutStateFilter.filter(p => getEstadoInfo(p.estado).nombre === val).length;
            badge.textContent = count;
        }
    });
}

function applyFilters() {
    const data = filterProcedimientos(currentFilters);

    // Actualizar KPIs
    updateKPIs(data);

    // Actualizar Tabla
    if (window.updateTable) updateTable(data);

    // Actualizar Gráficas
    if (window.updateCharts) updateCharts(data);

    // Actualizar Conteos laterales
    updateEstadoFilterCounts(data);

    // Actualizar Convenciones
    updateConventionsPanel(data);

    // Texto de resumen
    const filteredTotalEl = document.getElementById('filteredCount');
    const globalTotalEl = document.getElementById('totalCount');
    if (filteredTotalEl) filteredTotalEl.textContent = data.length;
    if (globalTotalEl) globalTotalEl.textContent = (window.procedimientos || []).length;
}

function updateConventionsPanel(filteredData) {
    const conventionsGrid = document.getElementById('conventionsGrid');
    if (!conventionsGrid) return;

    conventionsGrid.innerHTML = '';

    const stats = calculateStats(filteredData);

    Object.values(ESTADOS).forEach(estado => {
        const count = stats.porEstado[estado.nombre] || 0;

        const item = document.createElement('div');
        item.className = 'convention-item';

        const colorBox = document.createElement('div');
        colorBox.className = 'convention-color';
        colorBox.style.backgroundColor = estado.color;

        const info = document.createElement('div');
        info.className = 'convention-info';

        const nameContainer = document.createElement('div');
        nameContainer.className = 'convention-name-container';
        nameContainer.style.display = 'flex';
        nameContainer.style.alignItems = 'center';
        nameContainer.style.gap = '0.5rem';

        const name = document.createElement('div');
        name.className = 'convention-name';
        name.textContent = estado.nombre;

        const helpIcon = document.createElement('span');
        helpIcon.className = 'help-icon';
        helpIcon.textContent = 'ⓘ';
        helpIcon.title = estado.descripcion;
        helpIcon.style.cursor = 'help';
        helpIcon.style.fontSize = '0.8rem';
        helpIcon.style.color = 'var(--text-muted)';
        helpIcon.style.opacity = '0.7';

        nameContainer.appendChild(name);
        nameContainer.appendChild(helpIcon);

        const percent = document.createElement('div');
        percent.className = 'convention-percent';
        percent.textContent = `${estado.porcentaje}% de avance • ${count} procedimiento${count !== 1 ? 's' : ''}`;

        info.appendChild(nameContainer);
        info.appendChild(percent);

        item.appendChild(colorBox);
        item.appendChild(info);

        conventionsGrid.appendChild(item);
    });
}

function clearFilters() {
    currentFilters = { sistema: 'all', subsistema: 'all', estado: 'all', areaLider: '', gestorFuncional: '', search: '' };

    // Reset UI
    document.querySelectorAll('#sistemaFilters .chip').forEach(c => {
        c.classList.toggle('active', c.dataset.sistema === 'all');
    });
    const sub = document.getElementById('subsistemaFilter');
    if (sub) sub.value = 'all';
    document.querySelectorAll('.estado-filter-item').forEach(i => {
        i.classList.toggle('active', i.dataset.estado === 'all');
    });
    ['areaFilter', 'gestorFilter', 'tableSearch'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    applyFilters();
}

function updateKPIs(data) {
    if (!data) return;
    const total = data.length;
    animateValue(document.getElementById('totalProcedimientosKpi'), total);

    let sumaAvance = 0;
    data.forEach(p => sumaAvance += getEstadoInfo(p.estado).porcentaje);
    const globalAvg = total > 0 ? Math.round(sumaAvance / total) : 0;
    const globalEl = document.getElementById('globalCompletionKpi');
    if (globalEl) globalEl.textContent = globalAvg + '%';

    const inProcess = data.filter(p => getEstadoInfo(p.estado).nombre !== 'Pendiente').length;
    animateValue(document.getElementById('inProcessKpi'), inProcess);

    // Mejor Área
    const areas = {};
    data.forEach(p => {
        const a = (p.areaLider || 'Sin Área').trim();
        if (!areas[a]) areas[a] = { sum: 0, count: 0 };
        areas[a].sum += getEstadoInfo(p.estado).porcentaje;
        areas[a].count++;
    });

    let best = '-', bestAvg = -1;
    Object.keys(areas).forEach(a => {
        const avg = areas[a].sum / areas[a].count;
        if (avg > bestAvg) { bestAvg = avg; best = a; }
    });

    const topEl = document.getElementById('topAreaKpi');
    const topValEl = document.getElementById('topAreaValue');
    if (topEl) topEl.textContent = best.length > 20 ? best.substring(0, 17) + '...' : best;
    if (topValEl) topValEl.textContent = bestAvg > -1 ? Math.round(bestAvg) + '% Avance' : '-';
}

function animateValue(obj, end) {
    if (!obj) return;
    let start = parseInt(obj.textContent) || 0;
    if (start === end) return;
    const duration = 500;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.textContent = Math.floor(progress * (end - start) + start);
        if (progress < 1) window.requestAnimationFrame(step);
        else obj.textContent = end;
    };
    window.requestAnimationFrame(step);
}

function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

window.applyFilters = applyFilters;
window.initFilters = initFilters;
window.updateKPIs = updateKPIs;

document.addEventListener('DOMContentLoaded', () => {
    initFilters();
});
