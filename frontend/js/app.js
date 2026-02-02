/**
 * Growth Dashboard - Main Application
 */

const API_BASE = '/api';

// State
let progressData = [];
let statsData = null;
let todayProblems = []; // Track problems added today

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
 * Post data to API
 */
async function postData(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error posting to ${endpoint}:`, error);
        throw error;
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
    
    // Load today's problems from existing data
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = progressData.find(p => p.date === today);
    if (todayEntry) {
        todayProblems = todayEntry.problems || [];
    }
    
    // Update goal tracker
    updateGoalTracker(stats);
    
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
        initTopicProgress(knowledgeGraph);
    }
    
    // Setup form handler
    setupFormHandler();
    
    console.log('✅ Dashboard initialized');
}

/**
 * Setup form submission handler
 */
function setupFormHandler() {
    const form = document.getElementById('progress-form');
    const messageEl = document.getElementById('form-message');
    
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const problemName = document.getElementById('problem-name').value.trim();
        const difficulty = document.getElementById('difficulty').value;
        const topic = document.getElementById('topic').value;
        const studyHours = parseFloat(document.getElementById('study-hours').value) || 0;
        const notes = document.getElementById('notes').value.trim();
        
        if (!problemName) {
            showMessage(messageEl, 'Please enter a problem name', 'error');
            return;
        }
        
        // Add to today's problems
        todayProblems.push({
            name: problemName,
            difficulty: difficulty,
            topic: topic,
        });
        
        const today = new Date().toISOString().split('T')[0];
        const entry = {
            date: today,
            problems_solved: todayProblems.length,
            problems: todayProblems,
            study_hours: studyHours,
            notes: notes || null,
            mood: 'good',
        };
        
        try {
            await postData('/progress', entry);
            showMessage(messageEl, `✅ Logged: ${problemName} (${difficulty})`, 'success');
            
            // Clear form (except study hours)
            document.getElementById('problem-name').value = '';
            document.getElementById('notes').value = '';
            
            // Refresh dashboard
            setTimeout(() => {
                initDashboard();
            }, 500);
        } catch (error) {
            showMessage(messageEl, '❌ Failed to log progress', 'error');
        }
    });
}

/**
 * Show form message
 */
function showMessage(el, text, type) {
    el.textContent = text;
    el.className = `form-message ${type}`;
    setTimeout(() => {
        el.className = 'form-message';
    }, 3000);
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

/**
 * Update goal tracker
 */
function updateGoalTracker(stats) {
    if (!stats) return;
    
    const goal = 50;
    const startDate = new Date('2026-02-02');
    const endDate = new Date('2026-03-04');
    const today = new Date();
    
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.max(1, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
    
    const current = stats.total_problems;
    const remaining = Math.max(0, goal - current);
    const dailyNeeded = daysRemaining > 0 ? (remaining / daysRemaining).toFixed(1) : '—';
    const currentPace = (current / daysElapsed).toFixed(1);
    
    // Calculate predicted finish date
    let prediction = '—';
    if (current > 0 && parseFloat(currentPace) > 0) {
        const daysToFinish = Math.ceil(remaining / parseFloat(currentPace));
        const finishDate = new Date(today);
        finishDate.setDate(finishDate.getDate() + daysToFinish);
        
        if (current >= goal) {
            prediction = '✅ Done!';
        } else if (finishDate <= endDate) {
            prediction = '🎯 On track';
        } else {
            prediction = finishDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }
    
    // Update DOM
    document.getElementById('goal-current').textContent = current;
    document.getElementById('days-remaining').textContent = daysRemaining;
    document.getElementById('daily-needed').textContent = dailyNeeded;
    document.getElementById('current-pace').textContent = currentPace;
    document.getElementById('prediction').textContent = prediction;
    
    // Update circle progress
    const percent = Math.min((current / goal) * 100, 100);
    const circumference = 283; // 2 * PI * 45
    const offset = circumference - (percent / 100) * circumference;
    
    const fillEl = document.getElementById('goal-fill');
    if (fillEl) {
        fillEl.style.strokeDashoffset = offset;
        
        // Add gradient definition if not exists
        const svg = fillEl.closest('svg');
        if (svg && !svg.querySelector('#goalGradient')) {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            defs.innerHTML = `
                <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#667eea"/>
                    <stop offset="100%" style="stop-color:#764ba2"/>
                </linearGradient>
            `;
            svg.insertBefore(defs, svg.firstChild);
        }
    }
}

/**
 * Initialize topic progress bars
 */
function initTopicProgress(graphData) {
    const container = document.getElementById('topics-grid');
    if (!container) return;
    
    if (!graphData.nodes || graphData.nodes.length === 0) {
        container.innerHTML = '<p class="empty-state">Solve problems to track topic progress!</p>';
        return;
    }
    
    // Sort by problems solved descending
    const sorted = [...graphData.nodes].sort((a, b) => b.problems_solved - a.problems_solved);
    
    // Define all DSA topics with targets
    const allTopics = {
        'arrays': { target: 15, label: 'Arrays & Hashing' },
        'hash-table': { target: 10, label: 'Hash Table' },
        'two-pointers': { target: 10, label: 'Two Pointers' },
        'sliding-window': { target: 8, label: 'Sliding Window' },
        'stack': { target: 8, label: 'Stack' },
        'binary-search': { target: 10, label: 'Binary Search' },
        'linked-list': { target: 8, label: 'Linked List' },
        'trees': { target: 15, label: 'Trees' },
        'tries': { target: 5, label: 'Tries' },
        'heap': { target: 8, label: 'Heap / Priority Queue' },
        'backtracking': { target: 8, label: 'Backtracking' },
        'graphs': { target: 15, label: 'Graphs' },
        'dynamic-programming': { target: 20, label: 'Dynamic Programming' },
        'greedy': { target: 8, label: 'Greedy' },
        'intervals': { target: 6, label: 'Intervals' },
        'math': { target: 5, label: 'Math' },
        'bit-manipulation': { target: 5, label: 'Bit Manipulation' },
    };
    
    // Merge existing progress with all topics
    const topicProgress = {};
    for (const [id, info] of Object.entries(allTopics)) {
        const node = sorted.find(n => n.id === id);
        topicProgress[id] = {
            ...info,
            solved: node ? node.problems_solved : 0,
            mastery: node ? node.mastery : 0,
        };
    }
    
    // Render progress bars
    container.innerHTML = Object.entries(topicProgress)
        .sort((a, b) => b[1].solved - a[1].solved)
        .map(([id, data]) => {
            const percent = Math.min((data.solved / data.target) * 100, 100);
            const level = percent < 25 ? 1 : percent < 50 ? 2 : percent < 75 ? 3 : 4;
            
            return `
                <div class="topic-item">
                    <div class="topic-header">
                        <span class="topic-name">${data.label}</span>
                        <span class="topic-count">${data.solved}/${data.target}</span>
                    </div>
                    <div class="topic-progress-bar">
                        <div class="topic-progress-fill level-${level}" style="width: ${percent}%"></div>
                    </div>
                </div>
            `;
        }).join('');
}
