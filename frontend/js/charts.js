/**
 * Charts initialization using Chart.js
 */

let progressChart = null;
let difficultyChart = null;

/**
 * Initialize progress over time chart
 */
function initProgressChart(data) {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    // Prepare data
    const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));
    
    // Calculate cumulative problems
    let cumulative = 0;
    const cumulativeData = sortedData.map(entry => {
        cumulative += entry.problems_solved;
        return {
            x: entry.date,
            y: cumulative,
        };
    });
    
    // Daily problems
    const dailyData = sortedData.map(entry => ({
        x: entry.date,
        y: entry.problems_solved,
    }));
    
    // Destroy existing chart
    if (progressChart) {
        progressChart.destroy();
    }
    
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Cumulative Problems',
                    data: cumulativeData,
                    borderColor: '#58a6ff',
                    backgroundColor: 'rgba(88, 166, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
                {
                    label: 'Daily Problems',
                    data: dailyData,
                    borderColor: '#3fb950',
                    backgroundColor: 'rgba(63, 185, 80, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
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
                        color: '#8b949e',
                        usePointStyle: true,
                    },
                },
                tooltip: {
                    backgroundColor: '#21262d',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    titleColor: '#f0f6fc',
                    bodyColor: '#8b949e',
                },
            },
            scales: {
                x: {
                    type: 'category',
                    ticks: { color: '#6e7681' },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Cumulative',
                        color: '#8b949e',
                    },
                    ticks: { color: '#6e7681' },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Daily',
                        color: '#8b949e',
                    },
                    ticks: { color: '#6e7681' },
                    grid: { display: false },
                },
            },
        },
    });
}

/**
 * Initialize difficulty breakdown doughnut chart
 */
function initDifficultyChart(stats) {
    const ctx = document.getElementById('difficultyChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (difficultyChart) {
        difficultyChart.destroy();
    }
    
    difficultyChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Easy', 'Medium', 'Hard'],
            datasets: [{
                data: [stats.easy_count, stats.medium_count, stats.hard_count],
                backgroundColor: ['#3fb950', '#d29922', '#f85149'],
                borderColor: '#1c2128',
                borderWidth: 3,
                hoverOffset: 10,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#8b949e',
                        usePointStyle: true,
                        padding: 20,
                    },
                },
                tooltip: {
                    backgroundColor: '#21262d',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    titleColor: '#f0f6fc',
                    bodyColor: '#8b949e',
                },
            },
            cutout: '60%',
        },
    });
}
