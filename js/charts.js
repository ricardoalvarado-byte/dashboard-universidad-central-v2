// Variables globales para los gráficos
let donutChart = null;
let barChart = null;

// Configuración de colores para los gráficos
const chartColors = {
    green: {
        primary: '#2d5f3f',
        light: '#4ade80',
        dark: '#166534',
        accent: '#86efac'
    }
};

// Función para inicializar el gráfico de dona
function initDonutChart(stats) {
    const ctx = document.getElementById('donutChart');
    if (!ctx) return;

    // Destruir gráfico anterior si existe de forma segura
    if (donutChart) {
        try {
            donutChart.destroy();
        } catch (e) {
            console.warn('[Charts] Error destruyendo donut chart anterior:', e);
        }
        donutChart = null;
    }

    // Preparar datos
    const labels = [];
    const data = [];
    const colors = [];

    // Usar Object.keys para asegurar que accedemos correctamente a los nombres de estado
    Object.keys(ESTADOS).forEach(key => {
        const estado = ESTADOS[key];
        const count = stats.porEstado[key] || 0; // Usar la clave (nombre) para buscar en stats

        if (count > 0) {
            labels.push(key);
            data.push(count);
            colors.push(estado.color);
        }
    });

    // Crear gráfico
    try {
        donutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: 'rgba(15, 23, 42, 0.8)',
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#f8fafc',
                            padding: 15,
                            font: {
                                size: 12,
                                family: 'Inter'
                            },
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#f8fafc',
                        bodyColor: '#cbd5e1',
                        borderColor: 'rgba(74, 222, 128, 0.3)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    },
                    datalabels: {
                        color: '#ffffff',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: 4,
                        padding: 6,
                        font: {
                            weight: 'bold',
                            size: 16
                        },
                        formatter: (value, ctx) => {
                            let sum = 0;
                            let dataArr = ctx.chart.data.datasets[0].data;
                            dataArr.map(data => {
                                sum += data;
                            });
                            let percentage = (value * 100 / sum).toFixed(0) + "%";
                            return percentage;
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    } catch (e) {
        console.error('[Charts] Error creando donut chart:', e);
    }
}

// Registrar plugin de etiquetas si está disponible
if (typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
}

// Función para inicializar el gráfico de barras (Ahora: Avance por Área)
// Función para inicializar el gráfico de barras (Ahora: Distribución de Estados por Área - Stacked)
function initBarChart(stats, rawData) {
    const ctx = document.getElementById('barChart');
    if (!ctx) return;

    if (barChart) {
        barChart.destroy();
    }

    if (!rawData || rawData.length === 0) return;

    // 1. Agrupar datos por Área y Estado
    const areaStateMap = {};
    const areaTotals = {};

    rawData.forEach(p => {
        let area = (p.areaLider || 'Sin Asignar').trim();
        // Acortar nombres largos pero un poco más legibles
        if (area.length > 30) area = area.substring(0, 30) + '...';

        if (!areaStateMap[area]) areaStateMap[area] = {};
        if (!areaTotals[area]) areaTotals[area] = 0;

        const estadoKey = p.estado || 'Pendiente';
        const finalEstado = ESTADOS[estadoKey] ? estadoKey : 'Pendiente';

        areaStateMap[area][finalEstado] = (areaStateMap[area][finalEstado] || 0) + 1;
        areaTotals[area]++;
    });

    // 2. Ordenar áreas por volumen total (Descendente)
    let sortedAreas = Object.keys(areaTotals).sort((a, b) => areaTotals[b] - areaTotals[a]);
    sortedAreas = sortedAreas.slice(0, 10);

    // 3. Crear Datasets (Uno por cada Estado posible en el orden definido en ESTADOS)
    const estadosKeys = Object.keys(ESTADOS);

    const datasets = estadosKeys.map(estadoKey => {
        const estadoInfo = ESTADOS[estadoKey];
        const data = sortedAreas.map(area => areaStateMap[area][estadoKey] || 0);

        return {
            label: estadoKey,
            data: data,
            backgroundColor: estadoInfo.color,
            stack: 'total',
            barThickness: 20,
            borderWidth: 0
        };
    });

    // 4. Crear Gráfico
    try {
        barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedAreas,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        stacked: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        stacked: true,
                        grid: { display: false },
                        ticks: { color: '#e2e8f0', autoSkip: false, font: { size: 13, weight: '500' } }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        axis: 'y', // Asegurar orientación horizontal
                        intersect: true, // Solo mostrar si toca estrictamente la barra
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#f8fafc',
                        callbacks: {
                            footer: (tooltipItems) => {
                                let sum = 0;
                                tooltipItems.forEach(function (tooltipItem) {
                                    sum += tooltipItem.parsed.x;
                                });
                                return 'Total: ' + sum;
                            }
                        }
                    },
                    datalabels: { display: false }
                }
            }
        });
    } catch (e) {
        console.error('[Charts] Error al crear bar chart:', e);
    }
}

// Función para obtener color según el porcentaje (Basado en la semaforización de Estados)
function getColorByPercentage(percentage) {
    if (percentage >= 100) return '#10b981'; // En el sistema
    if (percentage >= 80) return '#22c55e';  // Aprobado
    if (percentage >= 70) return '#84cc16';  // Ajustado
    if (percentage >= 60) return '#fbbf24';  // Pendiente Ajustes
    if (percentage >= 40) return '#eab308';  // En revisión
    if (percentage >= 20) return '#f97316';  // En Elaboración
    return '#ef4444';                         // Pendiente
}

// Función para animar números
function animateNumber(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

// Función para actualizar todos los gráficos
function updateCharts(filteredData) {
    console.log('[Charts] updateCharts llamado con', filteredData ? filteredData.length : 0, 'registros');

    if (typeof calculateStats !== 'function') {
        console.error('[Charts] calculateStats no está definida');
        return;
    }

    const stats = calculateStats(filteredData);
    console.log('[Charts] Stats calculadas:', stats);

    // Actualizar gráfico de dona (por estado)
    if (typeof initDonutChart === 'function') {
        console.log('[Charts] Inicializando gráfico de dona...');
        initDonutChart(stats);
    } else {
        console.error('[Charts] initDonutChart no está definida');
    }

    // Actualizar gráfico de barras (por área)
    console.log('[Charts] Inicializando gráfico de barras...');
    initBarChart(stats, filteredData);
}

// Exportar función globalmente
window.updateCharts = updateCharts;

// Inicializar gráficos al cargar
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Charts] DOM cargado, esperando datos...');
});
