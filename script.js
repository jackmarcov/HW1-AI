// OnAds Tourism Mobility Insights - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupButtons();
    setupFileUpload();
    setupDashboard();
    setupAnimations();
    setupScrollEffects();
}

// ----- NAVBAR SMOOTH SCROLL -----
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    function findTargetSection(id) {
        if (!id) return null;
        let el = document.getElementById(id);
        if (el) return el;
        // fallback for common mismatches
        const fallbacks = {
            report: "reports",
            reports: "report",
            data: "data-upload",
            "data-upload": "data",
        };
        if (fallbacks[id]) {
            return document.getElementById(fallbacks[id]);
        }
        return null;
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const rawTarget = link.getAttribute('href').substring(1);
            const targetEl = findTargetSection(rawTarget);
            if (!targetEl) {
                console.warn(`[nav] Section with id="${rawTarget}" not found.`);
                return;
            }
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // toggle active class
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Make findTargetSection available globally for other functions
    window.findTargetSection = findTargetSection;
    
    // Update active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', function() {
        let current = '';
        const scrollPosition = window.pageYOffset + 100; // Offset for navbar
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        // If we're at the top, highlight dashboard by default
        if (window.pageYOffset < 100) {
            current = 'dashboard';
        }
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

// ----- TOP BUTTONS -----
function setupButtons() {
    const loginBtn = document.getElementById('btn-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            alert('Login coming soon. Please explore the dashboard below.');
        });
    } else {
        console.warn('[ui] #btn-login not found');
    }

    const getStartedBtn = document.getElementById('btn-get-started');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            const findTargetSection = window.findTargetSection || function(id) {
                return document.getElementById(id);
            };
            const dash = findTargetSection('dashboard');
            if (dash) {
                dash.scrollIntoView({ behavior: 'smooth' });
                // Update active nav link
                const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
                navLinks.forEach(l => l.classList.remove('active'));
                const dashboardLink = document.querySelector('.nav-link[href="#dashboard"]');
                if (dashboardLink) {
                    dashboardLink.classList.add('active');
                }
            } else {
                console.warn('[ui] dashboard section not found');
            }
        });
    } else {
        console.warn('[ui] #btn-get-started not found');
    }
}

// ----- DATA UPLOAD -----
function setupFileUpload() {
    const uploadInput = document.getElementById('data-file');
    const uploadStatus = document.getElementById('upload-status');
    
    if (uploadInput) {
        uploadInput.addEventListener('change', () => {
            const file = uploadInput.files[0];
            if (!file) return;
            if (uploadStatus) {
                uploadStatus.textContent = `Loaded: ${file.name} ✅ (mock processed)`;
            } else {
                console.warn('[upload] #upload-status not found');
            }
        });
    } else {
        console.warn('[upload] #data-file not found');
    }
    
    // Keep drag and drop functionality if upload area exists
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea && uploadInput) {
        uploadArea.addEventListener('click', function() {
            uploadInput.click();
        });
        
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                // Create a FileList-like object and trigger change
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(files[0]);
                uploadInput.files = dataTransfer.files;
                uploadInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }
}

function handleFileUpload(file) {
    if (!file) return;
    
    const uploadStatus = document.getElementById('upload-status');
    
    // Validate file type
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const isValidType = allowedTypes.includes(file.type) || fileExtension === 'csv' || fileExtension === 'xlsx';
    
    if (!isValidType) {
        if (uploadStatus) {
            uploadStatus.textContent = 'Error: Please upload a CSV or Excel file.';
            uploadStatus.style.color = '#ef4444';
        }
        showNotification('Please upload a CSV or Excel file.', 'error');
        return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        if (uploadStatus) {
            uploadStatus.textContent = 'Error: File size must be less than 10MB.';
            uploadStatus.style.color = '#ef4444';
        }
        showNotification('File size must be less than 10MB.', 'error');
        return;
    }
    
    // Show processing state
    if (uploadStatus) {
        uploadStatus.textContent = 'Processing...';
        uploadStatus.style.color = '#3b82f6';
    }
    
    // Show processing state in upload area
    showProcessingState();
    
    // Simulate file processing
    setTimeout(() => {
        processFileData(file);
    }, 2000);
}

function showProcessingState() {
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <div class="upload-content">
            <i class="fas fa-spinner fa-spin"></i>
            <h3>Processing your data...</h3>
            <p>This may take a few moments</p>
        </div>
    `;
}

function processFileData(file) {
    // Simulate data processing
    const mockData = generateMockData();
    updateDashboard(mockData);
    
    // Update upload status
    const uploadStatus = document.getElementById('upload-status');
    if (uploadStatus) {
        uploadStatus.innerHTML = `Loaded: ${file.name} ✅ (mock processed)`;
        uploadStatus.style.color = '#10b981';
    }
    
    // Reset upload area
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.innerHTML = `
            <div class="upload-content">
                <i class="fas fa-check-circle" style="color: #10b981;"></i>
                <h3>Data processed successfully!</h3>
                <p>Your insights are now available in the dashboard</p>
                <div class="upload-formats">
                    <span>Supported formats: CSV, Excel</span>
                </div>
            </div>
            <input type="file" id="data-file" accept=".csv,.xlsx" style="display: none;">
        `;
        
        // Re-attach the file input event listener
        const newFileInput = document.getElementById('data-file');
        if (newFileInput) {
            newFileInput.addEventListener('change', function(e) {
                handleFileUpload(e.target.files[0]);
            });
        }
    }
    
    showNotification('Data processed successfully! Dashboard updated.', 'success');
}

function generateMockData() {
    return {
        totalTrips: Math.floor(Math.random() * 1000) + 500,
        topDestinations: [
            { name: 'Casco Viejo', visits: Math.floor(Math.random() * 500) + 800, trend: Math.random() > 0.5 ? 'up' : 'down', change: Math.floor(Math.random() * 20) + 5 },
            { name: 'Multiplaza Mall', visits: Math.floor(Math.random() * 400) + 600, trend: Math.random() > 0.5 ? 'up' : 'down', change: Math.floor(Math.random() * 15) + 3 },
            { name: 'Amador Causeway', visits: Math.floor(Math.random() * 300) + 400, trend: Math.random() > 0.5 ? 'up' : 'down', change: Math.floor(Math.random() * 10) + 2 },
            { name: 'Panama Canal', visits: Math.floor(Math.random() * 200) + 300, trend: Math.random() > 0.5 ? 'up' : 'down', change: Math.floor(Math.random() * 8) + 1 },
            { name: 'Metro Mall', visits: Math.floor(Math.random() * 150) + 200, trend: Math.random() > 0.5 ? 'up' : 'down', change: Math.floor(Math.random() * 5) + 1 }
        ],
        peakHours: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            trips: Math.floor(Math.random() * 100) + 20
        })),
        heatmapData: generateHeatmapData()
    };
}

function generateHeatmapData() {
    // Generate mock heatmap data points
    const points = [];
    for (let i = 0; i < 50; i++) {
        points.push({
            lat: 8.9824 + (Math.random() - 0.5) * 0.1,
            lng: -79.5199 + (Math.random() - 0.5) * 0.1,
            intensity: Math.random()
        });
    }
    return points;
}

function updateDashboard(data) {
    updateTopDestinations(data.topDestinations);
    updatePeakHours(data.peakHours);
    updateHeatmap(data.heatmapData);
}

function updateTopDestinations(destinations) {
    const destinationsList = document.querySelector('.destinations-list');
    destinationsList.innerHTML = '';
    
    destinations.forEach((dest, index) => {
        const destinationItem = document.createElement('div');
        destinationItem.className = 'destination-item';
        destinationItem.innerHTML = `
            <div class="destination-rank">${index + 1}</div>
            <div class="destination-info">
                <span class="destination-name">${dest.name}</span>
                <span class="destination-count">${dest.visits.toLocaleString()} visits</span>
            </div>
            <div class="destination-trend">
                <i class="fas fa-arrow-${dest.trend}"></i>
                <span>${dest.change}%</span>
            </div>
        `;
        destinationsList.appendChild(destinationItem);
    });
}

function updatePeakHours(hours) {
    const peakHoursChart = document.querySelector('.peak-hours-chart');
    peakHoursChart.innerHTML = '';
    
    // Show only business hours (8 AM to 8 PM)
    const businessHours = hours.slice(8, 20);
    const maxTrips = Math.max(...businessHours.map(h => h.trips));
    
    businessHours.forEach(hour => {
        const hourBar = document.createElement('div');
        hourBar.className = 'hour-bar';
        const height = (hour.trips / maxTrips) * 100;
        hourBar.style.height = `${height}%`;
        
        const hourLabel = document.createElement('span');
        hourLabel.className = 'hour-label';
        hourLabel.textContent = `${hour.hour}:00`;
        
        hourBar.appendChild(hourLabel);
        peakHoursChart.appendChild(hourBar);
    });
}

function updateHeatmap(data) {
    const mapContainer = document.querySelector('.map-container');
    mapContainer.innerHTML = `
        <div class="map-heatmap"></div>
        <div class="map-markers">
            ${data.map((point, index) => `
                <div class="marker marker-${index + 1}" 
                     style="top: ${Math.random() * 80 + 10}%; left: ${Math.random() * 80 + 10}%; 
                            background: rgba(239, 68, 68, ${point.intensity});"></div>
            `).join('')}
        </div>
    `;
}

// Dashboard functionality
function setupDashboard() {
    // Time filter functionality
    const timeFilter = document.querySelector('.time-filter');
    if (timeFilter) {
        timeFilter.addEventListener('change', function() {
            const selectedPeriod = this.value;
            updateDashboardForPeriod(selectedPeriod);
        });
    }
    
    // Initialize with default data
    const mockData = generateMockData();
    updateDashboard(mockData);
}

function updateDashboardForPeriod(period) {
    // Simulate different data based on time period
    const mockData = generateMockData();
    updateDashboard(mockData);
    
    showNotification(`Dashboard updated for ${period.toLowerCase()}`, 'info');
}

// Animation setup
function setupAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-card, .dashboard-card, .upload-area');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Scroll effects
function setupScrollEffects() {
    let ticking = false;
    
    function updateScrollEffects() {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        
        // Parallax effect for hero section
        const heroVisual = document.querySelector('.hero-visual');
        if (heroVisual) {
            heroVisual.style.transform = `translateY(${parallax}px)`;
        }
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 5px;
                border-radius: 4px;
                transition: background 0.2s ease;
            }
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    return colors[type] || '#3b82f6';
}

// Utility functions
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Export functions for potential external use
window.OnAdsApp = {
    updateDashboard,
    showNotification,
    generateMockData
};


