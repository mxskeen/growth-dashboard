let progressChart = null;
let difficultyChart = null;

function initProgressChart(data) {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));
    
    let cumulative = 0;
    const cumulativeData = sortedData.map(entry => {
        cumulative += entry.problems_solved;
        return { x: entry.date, y: cumulative };
    });
    
    const dailyData = sortedData.map(entry => ({
        x: entry.date,
        y: entry.problems_solved,
    }));
    
    if (progressChart) progressChart.destroy();
    
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Cumulative',
                    data: cumulativeData,
                    borderColor: '#0a84ff',
                    backgroundColor: 'rgba(10, 132, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                },
                {
                    label: 'Daily',
                    data: dailyData,
                    borderColor: '#30d158',
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    yAxisID: 'y1',
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#8e8e93',
                        usePointStyle: true,
                        font: { size: 11 },
                    },
                },
                tooltip: {
                    backgroundColor: '#1c1c1e',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    titleColor: '#ffffff',
                    bodyColor: '#8e8e93',
                },
            },
            scales: {
                x: {
                    type: 'category',
                    ticks: { color: '#636366', font: { size: 10 } },
                    grid: { color: 'rgba(255,255,255,0.03)' },
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    ticks: { color: '#636366', font: { size: 10 } },
                    grid: { color: 'rgba(255,255,255,0.03)' },
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    ticks: { color: '#636366', font: { size: 10 } },
                    grid: { display: false },
                },
            },
        },
    });
}

function initDifficultyChart(stats) {
    const ctx = document.getElementById('difficultyChart');
    if (!ctx) return;
    
    if (difficultyChart) difficultyChart.destroy();
    
    difficultyChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Easy', 'Medium', 'Hard'],
            datasets: [{
                data: [stats.easy_count, stats.medium_count, stats.hard_count],
                backgroundColor: ['#30d158', '#ff9f0a', '#ff453a'],
                borderColor: '#1c1c1e',
                borderWidth: 2,
                hoverOffset: 8,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#8e8e93',
                        usePointStyle: true,
                        padding: 16,
                        font: { size: 11 },
                    },
                },
                tooltip: {
                    backgroundColor: '#1c1c1e',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    titleColor: '#ffffff',
                    bodyColor: '#8e8e93',
                },
            },
            cutout: '65%',
        },
    });
}
