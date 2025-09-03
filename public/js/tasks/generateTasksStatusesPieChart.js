let  statusCountMap = {};

async function generateTasksStatusesPieChart() {
    try {
        const response = await fetch("../apps/php/tasks/pie_chart_data.php");
        if (!response.ok) throw new Error("Błąd sieci");

        const data = await response.json();

        data.forEach(item => {
            statusCountMap[item.status] = parseInt(item.status_count);
        });

        const statusLabels = [];
        const statusCounts = [];
        const statusColors = [];

        Object.keys(statusCountMap).forEach(key => {
            statusLabels.push(statusMap[key] || key);
            statusCounts.push(statusCountMap[key]);
            statusColors.push(colorMap[key] || "#ccc");
        });

        const ctx = document.getElementById('statusPieChart').getContext('2d');

        const myPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: statusLabels,
                datasets: [{
                    data: statusCounts,
                    backgroundColor: statusColors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }, // ukryj legendę
                    datalabels: {
                        color: '#fff', // kolor tekstu na wycinku
                        font: {
                            weight: 'bold',
                            size: 14
                        },
                        formatter: function (value, context) {
                            return context.chart.data.labels[context.dataIndex]; // nazwa statusu
                        }
                    },
                    tooltip: {
                        enabled: false // całkowicie wyłącza tooltipy
                    }
                },
                animation: {
                    duration: 0
                },
                hover: {
                    mode: null // całkowicie wyłącza interakcję hover
                }
            },
            plugins: [ChartDataLabels],
        });


    } catch (error) {
        console.error("Błąd pobierania danych:", error);
    }

    return statusCountMap;
}


generateTasksStatusesPieChart();