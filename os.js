// System data simulation (in a real app, this would come from a backend API)
let systemData = {
    cpu: {
        percent: 0,
        cores: 0,
        threads: 0,
        frequency: 0,
        history: []
    },
    memory: {
        total: 0,
        used: 0,
        free: 0,
        percent: 0,
        history: []
    },
    processes: {
        total: 0,
        running: 0,
        sleeping: 0,
        other: 0,
        list: []
    },
    alerts: []
};

// DOM Elements
const cpuPercentEl = document.getElementById('cpu-percent');
const cpuCoresEl = document.getElementById('cpu-cores');
const cpuThreadsEl = document.getElementById('cpu-threads');
const cpuFreqEl = document.getElementById('cpu-freq');
const memPercentEl = document.getElementById('mem-percent');
const memTotalEl = document.getElementById('mem-total');
const memUsedEl = document.getElementById('mem-used');
const memFreeEl = document.getElementById('mem-free');
const processCountEl = document.getElementById('process-count');
const runningCountEl = document.getElementById('running-count');
const sleepingCountEl = document.getElementById('sleeping-count');
const otherCountEl = document.getElementById('other-count');
const processTableBody = document.getElementById('process-table-body');
const alertsContainer = document.getElementById('alerts-container');
const hostnameEl = document.getElementById('hostname');
const osInfoEl = document.getElementById('os-info');
const lastUpdatedEl = document.getElementById('last-updated');
const refreshBtn = document.getElementById('refresh-btn');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const processSearch = document.getElementById('process-search');
const searchBtn = document.getElementById('search-btn');
const killBtn = document.getElementById('kill-btn');
const clearAlertsBtn = document.getElementById('clear-alerts');
const priorityModal = new bootstrap.Modal(document.getElementById('priorityModal'));
const priorityProcessName = document.getElementById('priority-process-name');
const priorityProcessPid = document.getElementById('priority-process-pid');
const applyPriorityBtn = document.getElementById('apply-priority');

// Charts
const cpuChart = new Chart(
    document.getElementById('cpu-chart'),
    {
        type: 'line',
        data: {
            labels: Array(60).fill(''),
            datasets: [{
                label: 'CPU Usage',
                data: [],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    display: false
                }
            }
        }
    }
);

const memChart = new Chart(
    document.getElementById('mem-chart'),
    {
        type: 'doughnut',
        data: {
            labels: ['Used', 'Free', 'Cached'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    '#e74c3c',
                    '#2ecc71',
                    '#3498db'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            cutout: '70%'
        }
    }
);

const processChart = new Chart(
    document.getElementById('process-chart'),
    {
        type: 'doughnut',
        data: {
            labels: ['Running', 'Sleeping', 'Other'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    '#2ecc71',
                    '#3498db',
                    '#f39c12'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            cutout: '70%'
        }
    }
);

// Initialize the dashboard
function initDashboard() {
    // Set host info
    hostnameEl.textContent = window.location.hostname || 'localhost';
    osInfoEl.textContent = `${navigator.platform} (${navigator.userAgent.split(') ')[0].split('(')[1]})`;
    
    // Load initial data
    fetchSystemData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start periodic updates
    setInterval(fetchSystemData, 2000);
}

// Fetch system data (simulated)
function fetchSystemData() {
    // Simulate data fetching
    const now = new Date();
    lastUpdatedEl.textContent = now.toLocaleTimeString();
    
    // Generate random data for demo purposes
    systemData.cpu.cores = navigator.hardwareConcurrency / 2 || 4;
    systemData.cpu.threads = navigator.hardwareConcurrency || 8;
    systemData.cpu.frequency = (2 + Math.random()).toFixed(2);
    systemData.cpu.percent = Math.min(100, Math.max(0, systemData.cpu.percent + (Math.random() * 10 - 5)));
    systemData.cpu.history.push(systemData.cpu.percent);
    if (systemData.cpu.history.length > 60) systemData.cpu.history.shift();
    
    systemData.memory.total = 16;
    systemData.memory.used = Math.min(systemData.memory.total, Math.max(0, systemData.memory.used + (Math.random() * 2 - 1)));
    systemData.memory.free = systemData.memory.total - systemData.memory.used;
    systemData.memory.percent = (systemData.memory.used / systemData.memory.total * 100).toFixed(1);
    systemData.memory.history.push(parseFloat(systemData.memory.percent));
    if (systemData.memory.history.length > 60) systemData.memory.history.shift();
    
    // Generate random processes
    const processStates = ['Running', 'Sleeping', 'Zombie', 'Stopped'];
    systemData.processes.list = Array.from({length: 50}, (_, i) => {
        const state = processStates[Math.floor(Math.random() * processStates.length)];
        return {
            pid: 1000 + i,
            name: ['chrome', 'node', 'python', 'mysqld', 'bash', 'systemd', 'docker', 'vscode'][Math.floor(Math.random() * 8)],
            user: ['root', 'user', 'system', 'mysql', 'docker'][Math.floor(Math.random() * 5)],
            cpu: (Math.random() * 30).toFixed(1),
            memory: (Math.random() * 5).toFixed(1),
            status: state.charAt(0)
        };
    });
    
    // Count process states
    systemData.processes.running = systemData.processes.list.filter(p => p.status === 'R').length;
    systemData.processes.sleeping = systemData.processes.list.filter(p => p.status === 'S').length;
    systemData.processes.other = systemData.processes.list.length - systemData.processes.running - systemData.processes.sleeping;
    systemData.processes.total = systemData.processes.list.length;
    
    // Check for alerts
    checkForAlerts();
    
    // Update UI
    updateUI();
}

// Update UI with current system data
function updateUI() {
    // CPU
    cpuPercentEl.textContent = `${systemData.cpu.percent.toFixed(1)}%`;
    cpuCoresEl.textContent = systemData.cpu.cores;
    cpuThreadsEl.textContent = systemData.cpu.threads;
    cpuFreqEl.textContent = `${systemData.cpu.frequency} GHz`;
    
    // Memory
    memPercentEl.textContent = `${systemData.memory.percent}%`;
    memTotalEl.textContent = `${systemData.memory.total} GB`;
    memUsedEl.textContent = `${systemData.memory.used.toFixed(1)} GB`;
    memFreeEl.textContent = `${systemData.memory.free.toFixed(1)} GB`;
    
    // Processes
    processCountEl.textContent = systemData.processes.total;
    runningCountEl.textContent = systemData.processes.running;
    sleepingCountEl.textContent = systemData.processes.sleeping;
    otherCountEl.textContent = systemData.processes.other;
    
    // Update charts
    updateCharts();
    
    // Update process table
    updateProcessTable();
    
    // Update alerts
    updateAlerts();
}

// Update charts with current data
function updateCharts() {
    // CPU Chart
    cpuChart.data.datasets[0].data = systemData.cpu.history;
    cpuChart.update();
    
    // Memory Chart
    memChart.data.datasets[0].data = [
        systemData.memory.used,
        systemData.memory.free,
        systemData.memory.total * 0.2  // Simulate cached memory
    ];
    memChart.update();
    
    // Process Chart
    processChart.data.datasets[0].data = [
        systemData.processes.running,
        systemData.processes.sleeping,
        systemData.processes.other
    ];
    processChart.update();
}

// Update process table
function updateProcessTable() {
    processTableBody.innerHTML = '';
    
    // Sort processes based on current sort column
    const sortedProcesses = [...systemData.processes.list];
    sortedProcesses.sort((a, b) => {
        if (a[processSortColumn] < b[processSortColumn]) return processSortReverse ? 1 : -1;
        if (a[processSortColumn] > b[processSortColumn]) return processSortReverse ? -1 : 1;
        return 0;
    });
    
    // Add rows to table
    sortedProcesses.forEach(process => {
        const row = document.createElement('tr');
        row.dataset.pid = process.pid;
        
        row.innerHTML = `
            <td>${process.pid}</td>
            <td>${process.name}</td>
            <td>${process.user}</td>
            <td>${process.cpu}</td>
            <td>${process.memory} MB</td>
            <td>${process.status}</td>
            <td class="process-actions">
                <button class="btn-priority" data-pid="${process.pid}" title="Set Priority">
                    <i class="fas fa-sliders-h"></i>
                </button>
                <button class="btn-kill" data-pid="${process.pid}" title="Kill Process">
                    <i class="fas fa-skull"></i>
                </button>
            </td>
        `;
        
        processTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.btn-priority').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pid = e.currentTarget.dataset.pid;
            showPriorityModal(pid);
        });
    });
    
    document.querySelectorAll('.btn-kill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pid = e.currentTarget.dataset.pid;
            killProcess(pid);
        });
    });
}

// Update alerts display
function updateAlerts() {
    alertsContainer.innerHTML = '';
    
    systemData.alerts.forEach(alert => {
        const alertEl = document.createElement('div');
        alertEl.className = `alert-item ${alert.type}`;
        alertEl.innerHTML = `
            <div>
                <strong>${alert.message}</strong>
                ${alert.details ? `<div class="alert-details">${alert.details}</div>` : ''}
            </div>
            <div class="alert-time">${alert.time}</div>
        `;
        
        alertsContainer.appendChild(alertEl);
    });
}

// Check for system alerts
function checkForAlerts() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    
    // Clear old alerts
    if (systemData.alerts.length > 20) {
        systemData.alerts.shift();
    }
    
    // CPU alert
    if (systemData.cpu.percent > 80) {
        systemData.alerts.push({
            type: 'warning',
            message: 'High CPU Usage',
            details: `CPU usage is ${systemData.cpu.percent.toFixed(1)}%`,
            time: timeStr
        });
    }
    
    // Memory alert
    if (systemData.memory.percent > 80) {
        systemData.alerts.push({
            type: 'warning',
            message: 'High Memory Usage',
            details: `Memory usage is ${systemData.memory.percent}%`,
            time: timeStr
        });
    }
}

// Show priority modal for a process
function showPriorityModal(pid) {
    const process = systemData.processes.list.find(p => p.pid == pid);
    if (process) {
        priorityProcessName.textContent = process.name;
        priorityProcessPid.textContent = pid;
        priorityModal.show();
    }
}

// Kill a process
function killProcess(pid) {
    // In a real app, this would call a backend API
    systemData.processes.list = systemData.processes.list.filter(p => p.pid != pid);
    
    const now = new Date();
    systemData.alerts.push({
        type: 'success',
        message: 'Process Terminated',
        details: `PID: ${pid}`,
        time: now.toLocaleTimeString()
    });
    
    updateProcessTable();
    updateAlerts();
}

// Set up event listeners
function setupEventListeners() {
    // Refresh button
    refreshBtn.addEventListener('click', fetchSystemData);
    
    // Dark mode toggle
    darkModeToggle.addEventListener('change', toggleDarkMode);
    
    // Process search
    searchBtn.addEventListener('click', searchProcesses);
    processSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchProcesses();
    });
    
    // Kill process button
    killBtn.addEventListener('click', () => {
        const selectedRow = document.querySelector('#process-table tr.selected');
        if (selectedRow) {
            const pid = selectedRow.dataset.pid;
            killProcess(pid);
        } else {
            alert('Please select a process first');
        }
    });
    
    // Clear alerts
    clearAlertsBtn.addEventListener('click', () => {
        systemData.alerts = [];
        updateAlerts();
    });
    
    // Apply priority
    applyPriorityBtn.addEventListener('click', () => {
        const pid = priorityProcessPid.textContent;
        const priority = document.querySelector('input[name="priority"]:checked').value;
        
        const now = new Date();
        systemData.alerts.push({
            type: 'success',
            message: 'Priority Set',
            details: `PID: ${pid}, Priority: ${priority}`,
            time: now.toLocaleTimeString()
        });
        
        priorityModal.hide();
        updateAlerts();
    });
    
    // Process table row selection
    processTableBody.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        if (row) {
            document.querySelectorAll('#process-table tr').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
        }
    });
    
    // Process table sorting
    document.querySelectorAll('#process-table th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.sort;
            if (processSortColumn === column) {
                processSortReverse = !processSortReverse;
            } else {
                processSortColumn = column;
                processSortReverse = true;
            }
            
            // Update sort indicators
            document.querySelectorAll('#process-table th i').forEach(icon => {
                icon.className = 'fas fa-sort';
            });
            
            const icon = th.querySelector('i');
            icon.className = processSortReverse ? 'fas fa-sort-down' : 'fas fa-sort-up';
            
            updateProcessTable();
        });
    });
}

// Search processes
function searchProcesses() {
    const query = processSearch.value.toLowerCase();
    if (!query) return;
    
    const rows = document.querySelectorAll('#process-table tbody tr');
    let found = false;
    
    rows.forEach(row => {
        const pid = row.cells[0].textContent;
        const name = row.cells[1].textContent.toLowerCase();
        const user = row.cells[2].textContent.toLowerCase();
        
        if (pid.includes(query) || name.includes(query) || user.includes(query)) {
            row.scrollIntoView({behavior: 'smooth', block: 'center'});
            row.classList.add('highlight');
            setTimeout(() => row.classList.remove('highlight'), 2000);
            found = true;
        }
    });
    
    if (!found) {
        alert('No matching processes found');
    }
}

// Toggle dark mode
function toggleDarkMode() {
    const isDark = darkModeToggle.checked;
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('darkMode', isDark);
    
    // Update chart colors for dark mode
    updateChartThemes(isDark);
}

// Update chart themes
function updateChartThemes(isDark) {
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // CPU Chart
    cpuChart.options.scales.y.grid.color = gridColor;
    cpuChart.update();
    
    // Memory Chart
    memChart.update();
    
    // Process Chart
    processChart.update();
}

// Initialize sort variables
let processSortColumn = 'cpu';
let processSortReverse = true;

// Start the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);
