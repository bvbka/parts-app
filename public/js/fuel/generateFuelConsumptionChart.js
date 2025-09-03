async function generateFuelConsumptionChart(fuelData) {

    var first = document.querySelector(".widget-double-first span");
    var second = document.querySelector(".widget-double-second span");

    let wNormie = 0;
    let pozaNorma = 0;

    for (const [, value] of fuelData) {
        if (value <= acceptableFuelConsumption) {
            wNormie++;
        } else {
            pozaNorma++;
        }
    }

    first.innerHTML = wNormie;
    second.innerHTML = pozaNorma;

    const threshold = acceptableFuelConsumption;

    // const ctx = document.getElementById('consumptionLineChart').getContext('2d');

    const belowBorderColor = "rgba(75, 192, 192, 1)";
    const belowBackgroundColor = "rgba(75, 192, 192, 0.2)";

    const aboveBorderColor = "rgba(237, 55, 55, 1)";
    const aboveBackgroundColor = "rgba(237, 55, 55, 0.2)";

    // validate and prepare data
    const safeData = (lineChartData || []).filter(it => Array.isArray(it) && Number.isFinite(it[1]));
    if (safeData.length === 0) {
        console.warn('Brak poprawnych danych do wykresu (lineChartData jest pusty lub zawiera nie-finite).');
        // ewentualnie oczyść canvas / pokaż placeholder
        return;
    }

    const labels = safeData.map(item => item[0]).reverse();
    const consumptions = safeData.map(item => item[1]).reverse();

    // destroy previous chart if exists (prevent duplicates)
    if (window.__consumptionChart) {
        try { window.__consumptionChart.destroy(); } catch (e) { /* ignore */ }
    }

    const config = {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Spalanie (l/100km)',
                data: consumptions,
                fill: true,
                borderWidth: 3,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { min: 4 } }
        },
        plugins: [
            {
                afterLayout: chart => {
                    try {
                        // safety checks
                        const chartArea = chart.chartArea;
                        if (!chartArea || chartArea.top == null || chartArea.bottom == null) return;

                        const yAxis = chart.scales && chart.scales['y'];
                        if (!yAxis || typeof yAxis.getPixelForValue !== 'function') return;

                        // ensure threshold is finite number
                        const th = Number(acceptableFuelConsumption);
                        if (!isFinite(th)) return;

                        const yThreshold = yAxis.getPixelForValue(th);
                        if (!isFinite(yThreshold)) return;

                        const chartTop = chartArea.top;
                        const chartBottom = chartArea.bottom;
                        const chartAreaHeight = chartBottom - chartTop;
                        if (!isFinite(chartAreaHeight) || chartAreaHeight <= 0) return;

                        // normalized offset in [0,1]
                        let offset = (yThreshold - chartTop) / chartAreaHeight;
                        offset = Math.min(Math.max(offset, 0), 1);

                        // make a tiny gap if offset equals 0 or 1 to avoid duplicate stops being problematic in some impl.
                        const eps = 1e-6;
                        const stopA = Math.max(0, offset - eps);
                        const stopB = Math.min(1, offset + eps);

                        const ctx = chart.ctx;

                        const borderGradient = ctx.createLinearGradient(0, chartTop, 0, chartBottom);
                        borderGradient.addColorStop(0, aboveBorderColor);
                        borderGradient.addColorStop(stopA, aboveBorderColor);
                        borderGradient.addColorStop(stopB, belowBorderColor);
                        borderGradient.addColorStop(1, belowBorderColor);

                        const fillGradient = ctx.createLinearGradient(0, chartTop, 0, chartBottom);
                        fillGradient.addColorStop(0, aboveBackgroundColor);
                        fillGradient.addColorStop(stopA, aboveBackgroundColor);
                        fillGradient.addColorStop(stopB, belowBackgroundColor);
                        fillGradient.addColorStop(1, belowBackgroundColor);

                        chart.data.datasets[0].borderColor = borderGradient;
                        chart.data.datasets[0].backgroundColor = fillGradient;
                    } catch (err) {
                        console.error('afterLayout gradient error:', err);
                    }
                }
            },
            {
                afterDraw: chart => {
                    try {
                        const yAxis = chart.scales && chart.scales['y'];
                        if (!yAxis || typeof yAxis.getPixelForValue !== 'function') return;
                        const th = Number(acceptableFuelConsumption);
                        if (!isFinite(th)) return;

                        const y = yAxis.getPixelForValue(th);
                        if (!isFinite(y)) return;

                        const ctx = chart.ctx;
                        const area = chart.chartArea;
                        if (!area) return;

                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(area.left, y);
                        ctx.lineTo(area.right, y);
                        ctx.strokeStyle = 'orange';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                        ctx.restore();
                    } catch (err) {
                        console.error('afterDraw line error:', err);
                    }
                }
            }
        ]
    };

    const ctx = document.getElementById('consumptionLineChart').getContext('2d');
    window.__consumptionChart = new Chart(ctx, config);

}