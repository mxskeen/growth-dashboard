/**
 * Growth Dashboard - Main Application
 */

const API_BASE = '/api';

// State
let progressData = [];
let statsData = null;

/**
 * Fetch data from API
 */
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
}

/**
 * Initialize the dashboard
 */
async function initDashboard() {
    console.log('🚀 Initializing Growth Dashboard...');
    
    // Fetch all data
    const [progress, stats, heatmap, knowledgeGraph] = await Promise.all([
        fetchData('/progress'),
        fetchData('/stats'),
        fetchData('/heatmap'),
        fetchData('/knowledge-graph'),
    ]);
    
    progressData = progress || [];
    statsData = stats;
    
    // Update UI
    updateStats(stats);
    updateActivityList(progressData);
    
    // Initialize visualizations
    if (stats) {
        initProgressChart(progressData);
        initDifficultyChart(stats);
    }
    
    if (heatmap) {
        initHeatmap(heatmap.data);
    }
    
    if (knowledgeGraph) {
        initKnowledgeGraph(knowledgeGraph);
    }
    
    console.log('✅ Dashboard initialized');
}

/**
 * Update stats display
 */
function updateStats(stats) {
    if (!stats) return;
    
    // Header stats
    document.getElementById('total-problems').textContent = stats.total_problems;
    document.getElementById('current-streak').textContent = stats.current_streak;
    document.getElementById('total-hours').textContent = stats.total_study_hours.toFixed(1);
    
    // Difficulty stats
    document.getElementById('easy-count').textContent = stats.easy_count;
    document.getElementById('medium-count').textContent = stats.medium_count;
    document.getElementById('hard-count').textContent = stats.hard_count;
    document.getElementById('topics-count').textContent = stats.topics_covered.length;
}

/**
 * Update activity list
 */
function updateActivityList(data) {
    const container = document.getElementById('activity-list');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="empty-state">No activity yet. Start solving problems!</p>';
        return;
    }
    
    // Sort by date descending and take last 10
    const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
    
    container.innerHTML = sorted.map(entry => `
        <div class="activity-item">
            <span class="activity-date">${formatDate(entry.date)}</span>
            <div class="activity-content">
                <div class="activity-problems">
                    ${entry.problems.map(p => `
                        <span class="problem-badge ${p.difficulty}">${p.name}</span>
                    `).join('')}
                </div>
                ${entry.notes ? `<p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 4px;">${entry.notes}</p>` : ''}
            </div>
            <span style="color: var(--text-muted)">${entry.study_hours}h</span>
        </div>
    `).join('');
}

/**
 * Format date for display
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initDashboard);
