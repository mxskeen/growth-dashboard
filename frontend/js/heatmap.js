/**
 * Activity Heatmap - GitHub style contribution graph
 */

/**
 * Initialize heatmap
 */
function initHeatmap(data) {
    const container = document.getElementById('heatmap');
    if (!container) return;
    
    // Generate last 365 days
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
    
    // Create grid - 7 rows (days) x 53 columns (weeks)
    // Reorganize into weeks
    const weeks = [];
    let currentWeek = [];
    
    // Pad the first week if needed
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
    
    // Push last incomplete week
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        weeks.push(currentWeek);
    }
    
    // Render
    container.innerHTML = '';
    
    // Create day labels
    const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
    const labelsDiv = document.createElement('div');
    labelsDiv.style.display = 'flex';
    labelsDiv.style.flexDirection = 'column';
    labelsDiv.style.gap = '3px';
    labelsDiv.style.marginRight = '8px';
    labelsDiv.style.fontSize = '10px';
    labelsDiv.style.color = 'var(--text-muted)';
    
    dayLabels.forEach(label => {
        const labelDiv = document.createElement('div');
        labelDiv.style.height = '12px';
        labelDiv.textContent = label;
        labelsDiv.appendChild(labelDiv);
    });
    
    // Create weeks container
    const weeksContainer = document.createElement('div');
    weeksContainer.style.display = 'flex';
    weeksContainer.style.gap = '3px';
    
    weeks.forEach(week => {
        const weekDiv = document.createElement('div');
        weekDiv.style.display = 'flex';
        weekDiv.style.flexDirection = 'column';
        weekDiv.style.gap = '3px';
        
        week.forEach(day => {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'heatmap-day';
            dayDiv.style.width = '12px';
            dayDiv.style.height = '12px';
            
            if (day === null) {
                dayDiv.style.background = 'transparent';
            } else {
                dayDiv.style.background = getHeatmapColor(day.value);
                dayDiv.title = `${day.date}: ${day.value} activities`;
            }
            
            weekDiv.appendChild(dayDiv);
        });
        
        weeksContainer.appendChild(weekDiv);
    });
    
    // Update container style
    container.style.display = 'flex';
    container.style.alignItems = 'flex-start';
    container.appendChild(labelsDiv);
    container.appendChild(weeksContainer);
}

/**
 * Get heatmap color based on activity value
 */
function getHeatmapColor(value) {
    if (value === 0) return 'var(--heatmap-0)';
    if (value <= 2) return 'var(--heatmap-1)';
    if (value <= 4) return 'var(--heatmap-2)';
    if (value <= 6) return 'var(--heatmap-3)';
    return 'var(--heatmap-4)';
}
