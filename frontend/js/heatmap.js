function initHeatmap(data) {
    const container = document.getElementById('heatmap');
    if (!container) return;
    
    const today = new Date();
    const days = [];
    
    for (let i = 364; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        days.push({
            date: dateStr,
            value: data[dateStr] || 0,
            dayOfWeek: date.getDay(),
        });
    }
    
    const weeks = [];
    let currentWeek = [];
    
    const firstDayOfWeek = days[0].dayOfWeek;
    for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push(null);
    }
    
    days.forEach(day => {
        currentWeek.push(day);
        if (day.dayOfWeek === 6) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });
    
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        weeks.push(currentWeek);
    }
    
    container.innerHTML = '';
    container.style.display = 'flex';
    container.style.alignItems = 'flex-start';
    container.style.gap = '3px';
    
    weeks.forEach(week => {
        const weekDiv = document.createElement('div');
        weekDiv.style.display = 'flex';
        weekDiv.style.flexDirection = 'column';
        weekDiv.style.gap = '3px';
        
        week.forEach(day => {
            const dayDiv = document.createElement('div');
            dayDiv.style.width = '10px';
            dayDiv.style.height = '10px';
            dayDiv.style.borderRadius = '2px';
            
            if (day === null) {
                dayDiv.style.background = 'transparent';
            } else {
                dayDiv.style.background = getHeatmapColor(day.value);
                dayDiv.title = `${day.date}: ${day.value}`;
            }
            
            weekDiv.appendChild(dayDiv);
        });
        
        container.appendChild(weekDiv);
    });
}

function getHeatmapColor(value) {
    if (value === 0) return 'var(--heatmap-0)';
    if (value <= 2) return 'var(--heatmap-1)';
    if (value <= 4) return 'var(--heatmap-2)';
    if (value <= 6) return 'var(--heatmap-3)';
    return 'var(--heatmap-4)';
}
