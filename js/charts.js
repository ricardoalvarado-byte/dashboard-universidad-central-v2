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

    // Destruir gráfico anterior si existe
    if (donutChart) {
        donutChart.destroy();
    }

    // Preparar datos
    const labels = [];
    const data = [];
    const colors = [];

    Object.values(ESTADOS).forEach(estado => {
        const count = stats.porEstado[estado.nombre] || 0;
        if (count > 0) {
            labels.push(estado.nombre);
            data.push(count);
            colors.push(estado.color);
        }
    });

    // Crear gráfico
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
                    color: '#000000',
                    font: {
                        weight: 'bold',
                        size: 13
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
}

// Registrar plugin de etiquetas si está disponible
if (typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
}

// Función para inicializar el gráfico de barras (Ahora: Avance por Área)
function initBarChart(stats, rawData) {
    const ctx = document.getElementById('barChart');
    if (!ctx) return;

    if (barChart) {
        barChart.destroy();
    }

    // Calcular avance promedio por Área
    const areasMap = {};

    // Si no hay rawData, retornar (o usar stats si tiene algo, pero preferimos rawData)
    if (!rawData || rawData.length === 0) return;

    rawData.forEach(p => {
        // Normalizar nombre de área
        let area = (p.areaLider || 'Sin Asignar').trim();
        if (area.length > 20) area = area.substring(0, 20) + '...';

        if (!areasMap[area]) areasMap[area] = { sum: 0, count: 0 };
        areasMap[area].sum += getEstadoInfo(p.estado).porcentaje;
        areasMap[area].count++;
    });

    // Convertir a arrays y ordenar por avance
    let areaEntries = Object.keys(areasMap).map(area => ({
        label: area,
        value: Math.round(areasMap[area].sum / areasMap[area].count)
    }));

    // Ordenar descendente y tomar Top 10 si son muchas
    areaEntries.sort((a, b) => b.value - a.value);
    areaEntries = areaEntries.slice(0, 10);

    const labels = areaEntries.map(e => e.label);
    const data = areaEntries.map(e => e.value);

    // Colores dinámicos
    const colors = data.map(val => getColorByPercentage(val));

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '% Avance por Área',
                data: data,
                backgroundColor: colors.map(c => c + 'CC'), // Transparencia
                borderColor: colors,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // Convertir a barras horizontales para leer mejor los nombres
            plugins: {
                legend: { display: false },
                datalabels: {
                    color: '#ffffff',
                    anchor: 'center',
                    align: 'center',
                    font: { weight: 'bold', size: 12 },
                    formatter: (value) => value + '%',
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `Avance: ${ctx.parsed.x}%`
                    }
                }
            },
            scales: {
                x: {
                    max: 100,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { callback: v => v + '%', color: '#94a3b8' }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#e2e8f0', autoSkip: false }
                }
            }
        }
    });
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
