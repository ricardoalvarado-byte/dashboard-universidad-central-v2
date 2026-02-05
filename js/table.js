// Estado de la tabla
let currentPage = 1;
let itemsPerPage = 10;
let sortColumn = null;
let sortDirection = 'asc';
let currentTableData = [];

// Función para inicializar la tabla
function initTable() {
    // Búsqueda en tabla
    const tableSearch = document.getElementById('tableSearch');
    if (tableSearch) {
        tableSearch.addEventListener('input', debounce((e) => {
            currentFilters.search = e.target.value;
            applyFilters();
        }, 300));
    }

    // Botones de exportación
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', () => {
            exportToExcel(currentTableData, 'procedimientos_universidad_central.xlsx');
        });
    }

    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', () => {
            exportToPDF();
        });
    }

    // Ordenamiento por columnas (Delegación de eventos porque los headers son dinámicos)
    const tableElement = document.getElementById('procedimientosTable');
    if (tableElement) {
        tableElement.addEventListener('click', (e) => {
            const th = e.target.closest('th[data-sort]');
            if (th) {
                const column = th.dataset.sort;
                handleSort(column);
            }
        });
    }

    // Renderizar tabla inicial
    updateTable(procedimientos);
}

// Función para actualizar la tabla
function updateTable(data) {
    currentTableData = data;
    currentPage = 1;
    renderTable();
}

// Función para renderizar la tabla
function renderTable() {
    const table = document.getElementById('procedimientosTable');
    if (!table) return;

    // Asegurarse de que COLUMN_CONFIG existe
    if (typeof COLUMN_CONFIG === 'undefined') return;

    // Filtrar columnas visibles
    const visibleColumns = COLUMN_CONFIG.filter(col => col.visible);

    // 1. Renderizar Header
    const thead = table.querySelector('thead');
    if (thead) {
        thead.innerHTML = `
            <tr>
                ${visibleColumns.map(col => `
                    <th data-sort="${escapeHTML(col.key)}">
                        ${escapeHTML(col.label)} 
                        <span class="sort-icon">${sortColumn === col.key ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}</span>
                    </th>
                `).join('')}
                <th>Progreso</th> 
            </tr>
        `;
    }
    // Nota: Dejé fija la columna "Progreso" al final porque suele ser calculada/visual y no está en el excel directamente, 
    // pero si se quiere configurable, debería agregarse a COLUMN_CONFIG. 
    // Por ahora la dejaré fija al final como estaba en el diseño original para no romper la visualización de la barra de progreso.

    // 2. Renderizar Body
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;

    // Aplicar ordenamiento
    let sortedData = [...currentTableData];
    if (sortColumn) {
        sortedData.sort((a, b) => {
            let aVal = a[sortColumn];
            let bVal = b[sortColumn];

            // Caso especial para porcentaje (basado en estado)
            if (sortColumn === 'porcentaje') {
                aVal = getEstadoInfo(a.estado).porcentaje;
                bVal = getEstadoInfo(b.estado).porcentaje;
            }

            // Comparación
            if (aVal == null) aVal = '';
            if (bVal == null) bVal = '';

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Paginación
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = sortedData.slice(startIndex, endIndex);

    // Limpiar tabla body
    tableBody.innerHTML = '';

    // Renderizar filas
    if (pageData.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="${visibleColumns.length + 1}" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                No se encontraron procedimientos con los filtros aplicados
            </td>
        `;
        tableBody.appendChild(emptyRow);
    } else {
        pageData.forEach(proc => {
            const row = document.createElement('tr');
            const estadoInfo = getEstadoInfo(proc.estado);

            // Construir celdas dinámicas
            let cellsHTML = visibleColumns.map(col => {
                let content = proc[col.key] || '';

                // Formato especial para estado
                if (col.key === 'estado') {
                    return `<td><span class="estado-badge" style="background-color: ${estadoInfo.color}20; color: ${estadoInfo.color}; border: 1px solid ${estadoInfo.color}40;">
                                <span class="estado-indicator" style="background-color: ${estadoInfo.color};"></span>
                                ${escapeHTML(content)}
                            </span></td>`;
                }

                return `<td>${escapeHTML(content)}</td>`;
            }).join('');

            // Agregar columna fija de progreso
            cellsHTML += `
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div class="progress-bar" style="flex: 1;">
                            <div class="progress-fill" style="width: ${estadoInfo.porcentaje}%; background: ${estadoInfo.color};"></div>
                        </div>
                        <span style="font-weight: 600; min-width: 40px;">${estadoInfo.porcentaje}%</span>
                    </div>
                </td>
            `;
            row.innerHTML = cellsHTML;
            tableBody.appendChild(row);

            // Animación de entrada
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, 10);
        });
    }

    // Actualizar info de paginación
    renderPagination(sortedData.length);
}

// Función para manejar ordenamiento
function handleSort(column) {
    if (sortColumn === column) {
        // Cambiar dirección
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        // Nueva columna
        sortColumn = column;
        sortDirection = 'asc';
    }

    // Actualizar UI de headers
    // Nota: Como los headers se regeneran en renderTable, no necesitamos actualizar iconos aquí manualmente si llamamos a renderTable después.
    // Sin embargo, para mantener consistencia visual inmediata:
    const activeHeader = document.querySelector(`.data-table th[data-sort="${column}"]`);
    if (activeHeader) {
        // Esto se refrescará en renderTable de todas formas
    }

    // Re-renderizar
    renderTable();
}

// Función para renderizar paginación
function renderPagination(totalItems) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    pagination.innerHTML = '';

    // Botón anterior
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Anterior';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });
    pagination.appendChild(prevBtn);

    // Números de página
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Primera página
    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.textContent = '1';
        firstBtn.addEventListener('click', () => {
            currentPage = 1;
            renderTable();
        });
        pagination.appendChild(firstBtn);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '0 0.5rem';
            ellipsis.style.color = 'var(--text-muted)';
            pagination.appendChild(ellipsis);
        }
    }

    // Páginas visibles
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.classList.toggle('active', i === currentPage);
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderTable();
        });
        pagination.appendChild(pageBtn);
    }

    // Última página
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '0 0.5rem';
            ellipsis.style.color = 'var(--text-muted)';
            pagination.appendChild(ellipsis);
        }

        const lastBtn = document.createElement('button');
        lastBtn.textContent = totalPages;
        lastBtn.addEventListener('click', () => {
            currentPage = totalPages;
            renderTable();
        });
        pagination.appendChild(lastBtn);
    }

    // Botón siguiente
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Siguiente →';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });
    pagination.appendChild(nextBtn);
}

// Función para exportar a PDF real usando jsPDF
function exportToPDF() {
    if (typeof window.jspdf === 'undefined') {
        alert('La librería PDF no se ha cargado correctamente. Por favor, recarga la página.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4'); // Horizontal

    // Título y metadatos
    doc.setFontSize(18);
    doc.setTextColor(45, 95, 63); // Verde UC
    doc.text('Reporte de Gestión de Procesos - Universidad Central', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    const dateStr = new Date().toLocaleString();
    doc.text(`Generado el: ${dateStr}`, 14, 28);

    // Preparar datos de la tabla
    const visibleColumns = COLUMN_CONFIG.filter(col => col.visible);
    const tableHeaders = visibleColumns.map(col => col.label);
    tableHeaders.push('% Avance');

    // UsarcurrentTableData que contiene la data filtrada actual
    const tableData = currentTableData.map(proc => {
        const row = visibleColumns.map(col => proc[col.key] || '');
        const info = getEstadoInfo(proc.estado);
        row.push(`${info.porcentaje}%`);
        return row;
    });

    // Generar tabla PDF
    doc.autoTable({
        startY: 35,
        head: [tableHeaders],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [45, 95, 63],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold'
        },
        bodyStyles: {
            fontSize: 8,
            textColor: [50, 50, 50]
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        margin: { top: 35 },
        styles: {
            overflow: 'linebreak',
            cellPadding: 3
        }
    });

    // Descargar
    doc.save('procedimientos_universidad_central.pdf');
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

// Función para exportar a Excel real usando SheetJS (XLSX)
function exportToExcel(data, filename) {
    if (typeof XLSX === 'undefined') {
        alert('La librería Excel no se ha cargado correctamente. Por favor, recarga la página.');
        return;
    }

    if (!data || data.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    // Preparar datos para XLSX
    const visibleColumns = COLUMN_CONFIG.filter(col => col.visible);

    const excelData = data.map(proc => {
        const row = {};
        visibleColumns.forEach(col => {
            row[col.label] = proc[col.key] || '';
        });

        // Agregar % Avance calculado
        const info = getEstadoInfo(proc.estado);
        row['% Avance'] = info.porcentaje + '%';

        return row;
    });

    // Crear hoja de trabajo y libro
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Procedimientos");

    // Descargar
    XLSX.writeFile(workbook, filename);
}

// Inicializar tabla al cargar
document.addEventListener('DOMContentLoaded', () => {
    initTable();
});

// Exponer funciones globales
window.exportToExcel = exportToExcel;
window.exportToPDF = exportToPDF;
window.updateTable = updateTable;

