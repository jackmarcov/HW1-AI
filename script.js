// OnAds Tourism Insights – main JS

// ========================================
// DATA
// ========================================

const ZONES = {
    downtown: {
        name: "Downtown",
        "24h": 128,
        "7d": 842,
        "30d": 3120,
        heatLevel: "high",
    },
    mall: {
        name: "Mall",
        "24h": 96,
        "7d": 520,
        "30d": 2044,
        heatLevel: "medium",
    },
    airport: {
        name: "Airport",
        "24h": 73,
        "7d": 410,
        "30d": 1680,
        heatLevel: "high",
    },
    historic: {
        name: "Historic Center",
        "24h": 41,
        "7d": 230,
        "30d": 900,
        heatLevel: "low",
    },
    financial: {
        name: "Financial District",
        "24h": 54,
        "7d": 315,
        "30d": 1210,
        heatLevel: "medium",
    },
};

let currentZone = "downtown";
let currentRange = "24h"; // "24h" | "7d" | "30d"

const DASHBOARD_DATA = {
    "24h": {
        heatmapText: "Live heatmap from the last 24 hours.",
        topDestinations: [
            { name: "Casco Viejo", visits: 1247, trend: "+12%" },
            { name: "Multiplaza Mall", visits: 892, trend: "+8%" },
            { name: "Amador Causeway", visits: 654, trend: "-3%" },
        ],
        peakHours: [10, 11, 12, 13, 14, 15], // hours
        peakValues: [40, 55, 80, 70, 50, 60], // intensity
    },
    "7d": {
        heatmapText: "Aggregated tourist movement for the last 7 days.",
        topDestinations: [
            { name: "Multiplaza Mall", visits: 5420, trend: "+5%" },
            { name: "Casco Viejo", visits: 5010, trend: "+3%" },
            { name: "Albrook Mall", visits: 4230, trend: "+1%" },
        ],
        peakHours: [9, 11, 13, 18, 20],
        peakValues: [35, 60, 75, 65, 45],
    },
    "30d": {
        heatmapText: "Monthly mobility overview for key tourism zones.",
        topDestinations: [
            { name: "Casco Viejo", visits: 21340, trend: "+9%" },
            { name: "Tocumen-Airport Axis", visits: 18970, trend: "+4%" },
            { name: "Causeway", visits: 16110, trend: "-2%" },
        ],
        peakHours: [8, 12, 15, 19],
        peakValues: [30, 78, 52, 48],
    },
};

// DOM references (will be set in setupZoneAndFilters)
let zoneTitleEl = null;
let metricValueEl = null;
let metricSubtitleEl = null;
let heatBadgeEl = null;
let zoneListEl = null;
let timeFilterButtons = null;

function renderPanel() {
    const data = ZONES[currentZone];
    if (!data) return;

    // title
    if (zoneTitleEl) zoneTitleEl.textContent = data.name;

    // metric
    const valueForRange = data[currentRange];
    if (metricValueEl) metricValueEl.textContent = valueForRange ?? 0;

    // subtitle
    if (metricSubtitleEl) {
        if (currentRange === "24h") metricSubtitleEl.textContent = "Last 24 hours";
        if (currentRange === "7d") metricSubtitleEl.textContent = "Last 7 days";
        if (currentRange === "30d") metricSubtitleEl.textContent = "Last 30 days";
    }

    // heat badge
    if (heatBadgeEl) {
        heatBadgeEl.textContent = data.heatLevel.charAt(0).toUpperCase() + data.heatLevel.slice(1);
        heatBadgeEl.classList.remove("badge-high", "badge-medium", "badge-low");
        if (data.heatLevel === "high") heatBadgeEl.classList.add("badge-high");
        if (data.heatLevel === "medium") heatBadgeEl.classList.add("badge-medium");
        if (data.heatLevel === "low") heatBadgeEl.classList.add("badge-low");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Zone and time filter setup
    setupZoneAndFilters();
    
    // Existing functionality
    setupNavbar();
    setupTopButtons();
    setupHeroButtons();
    setupDataUpload();
});

// ========================================
// Zone and Time Filter Management
// ========================================

function setupZoneAndFilters() {
    // Get DOM references
    zoneTitleEl = document.getElementById("zone-title");
    metricValueEl = document.getElementById("metric-value");
    metricSubtitleEl = document.getElementById("metric-subtitle");
    heatBadgeEl = document.getElementById("heat-badge");
    zoneListEl = document.getElementById("zone-list");
    timeFilterButtons = document.querySelectorAll(".time-filter");

    // Zone click handler
    if (zoneListEl) {
        zoneListEl.addEventListener("click", (e) => {
            const li = e.target.closest("li");
            if (!li) return;

            const zoneKey = li.dataset.zone;
            if (!zoneKey || !ZONES[zoneKey]) return;

            currentZone = zoneKey;

            // update active class in list
            const zoneItems = document.querySelectorAll(".zone-item");
            zoneItems.forEach((item) => {
                if (item) item.classList.remove("active");
            });
            li.classList.add("active");

            renderPanel();
        });
    }

    // Time filters click handler
    if (timeFilterButtons && timeFilterButtons.length > 0) {
        timeFilterButtons.forEach((btn) => {
            if (!btn) return;
            
            btn.addEventListener("click", () => {
                const range = btn.dataset.range;
                if (!range || (range !== "24h" && range !== "7d" && range !== "30d")) return;

                currentRange = range;

                // update active
                timeFilterButtons.forEach((b) => {
                    if (b) b.classList.remove("active");
                });
                btn.classList.add("active");

                renderPanel();
                renderHeatmapCard(currentRange);
                renderTopDestinations(currentRange);
                renderPeakHours(currentRange);
            });
        });
    }

    // Initial render
    renderPanel();
    renderHeatmapCard(currentRange);
    renderTopDestinations(currentRange);
    renderPeakHours(currentRange);
}

// ========================================
// Dashboard Card Rendering Functions
// ========================================

function renderHeatmapCard(rangeKey) {
    const heatmapBody = document.getElementById("heatmap-body");
    if (!heatmapBody) return;
    const data = DASHBOARD_DATA[rangeKey];
    if (!data) return;
    heatmapBody.innerHTML = "";
    const desc = document.createElement("p");
    desc.className = "heatmap-desc";
    desc.textContent = data.heatmapText;
    heatmapBody.appendChild(desc);
    const grid = document.createElement("div");
    grid.className = "heatmap-grid";
    // simple 4x5 grid
    const cells = 20;
    for (let i = 0; i < cells; i++) {
        const cell = document.createElement("div");
        cell.className = "heatmap-cell";
        // random intensity to simulate a heatmap
        const intensity = Math.floor(Math.random() * 3); // 0,1,2
        cell.dataset.intensity = intensity;
        grid.appendChild(cell);
    }
    heatmapBody.appendChild(grid);
}

function renderTopDestinations(rangeKey) {
    const listEl = document.getElementById("top-destinations-list");
    if (!listEl) return;
    const data = DASHBOARD_DATA[rangeKey];
    if (!data) return;
    listEl.innerHTML = "";
    data.topDestinations.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "destination-row";
        row.innerHTML = `
            <div class="dest-left">
                <span class="dest-rank">${index + 1}</span>
                <div>
                    <p class="dest-name">${item.name}</p>
                    <p class="dest-visits">${item.visits.toLocaleString()} visits</p>
                </div>
            </div>
            <div class="dest-trend">${item.trend}</div>
        `;
        listEl.appendChild(row);
    });
}

function renderPeakHours(rangeKey) {
    const barsEl = document.getElementById("peak-hours-bars");
    if (!barsEl) return;
    const data = DASHBOARD_DATA[rangeKey];
    if (!data) return;
    barsEl.innerHTML = "";
    const max = Math.max(...data.peakValues);
    const MAX_BAR_PX = 130;
    data.peakHours.forEach((hour, idx) => {
        const value = data.peakValues[idx];
        const barHeight = Math.max(25, Math.round((value / max) * MAX_BAR_PX));
        const wrapper = document.createElement("div");
        wrapper.className = "peak-bar";
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = barHeight + "px";
        const label = document.createElement("span");
        label.className = "bar-label";
        label.textContent = hour + ":00";
        wrapper.appendChild(bar);
        wrapper.appendChild(label);
        barsEl.appendChild(wrapper);
    });
}

// ========================================
// 1. Navbar smooth scroll
// ========================================

function setupNavbar() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    if (!navLinks || navLinks.length === 0) {
        console.warn('[nav] No navigation links found');
        return;
    }
    
    function findTargetSection(id) {
        if (!id) return null;
        
        let el = document.getElementById(id);
        if (el) return el;
        
        // Fallback for common mismatches
        const fallbacks = {
            report: "reports",
            reports: "report",
            data: "data-upload",
            "data-upload": "data",
        };
        
        if (fallbacks[id]) {
            const fallbackEl = document.getElementById(fallbacks[id]);
            if (fallbackEl) return fallbackEl;
        }
        
        return null;
    }
    
    // Handle click events on nav links
    navLinks.forEach(link => {
        if (!link) return;
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const href = link.getAttribute('href');
            if (!href) return;
            
            const rawTarget = href.substring(1);
            const targetEl = findTargetSection(rawTarget);
            
            if (!targetEl) {
                console.warn(`[nav] Section with id="${rawTarget}" not found.`);
                return;
            }
            
            // Smooth scroll to target
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Update active class
            navLinks.forEach(l => {
                if (l) l.classList.remove('active');
            });
            link.classList.add('active');
        });
    });
    
    // Update active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    
    if (sections && sections.length > 0) {
        window.addEventListener('scroll', function() {
            let current = '';
            const scrollY = window.scrollY || window.pageYOffset || 0;
            const scrollPosition = scrollY + 100;
            
            sections.forEach(section => {
                if (!section) return;
                
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    const sectionId = section.getAttribute('id');
                    if (sectionId) current = sectionId;
                }
            });
            
            // If we're at the top, highlight dashboard by default
            if (scrollY < 100) {
                current = 'dashboard';
            }
            
            // Update active link
            navLinks.forEach(link => {
                if (!link) return;
                
                link.classList.remove('active');
                const linkHref = link.getAttribute('href');
                if (linkHref === '#' + current) {
                    link.classList.add('active');
                }
            });
        });
    }
}

// ========================================
// 2. Top buttons (login, get started)
// ========================================

function setupTopButtons() {
    // Login button
    const loginBtn = document.getElementById('btn-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            alert('Login coming soon. Please explore the dashboard below.');
        });
    } else {
        console.warn('[ui] #btn-login not found');
    }
    
    // Get Started button
    const getStartedBtn = document.getElementById('btn-get-started');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            const dashboardSection = document.getElementById('dashboard');
            
            if (dashboardSection) {
                dashboardSection.scrollIntoView({ behavior: 'smooth' });
                
                // Update active nav link
                const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
                if (navLinks) {
                    navLinks.forEach(l => {
                        if (l) l.classList.remove('active');
                    });
                    
                    const dashboardLink = document.querySelector('.nav-link[href="#dashboard"]');
                    if (dashboardLink) {
                        dashboardLink.classList.add('active');
                    }
                }
            } else {
                console.warn('[ui] Dashboard section not found');
            }
        });
    } else {
        console.warn('[ui] #btn-get-started not found');
    }
}

// ========================================
// 3. Hero buttons
// ========================================

function setupHeroButtons() {
    // View Dashboard button - can be anchor or button
    let dashboardButton = null;
    
    // Check if there's an anchor with href="#dashboard" in hero
    const heroLinks = document.querySelectorAll('header.hero a[href="#dashboard"], .hero-actions a[href="#dashboard"]');
    if (heroLinks && heroLinks.length > 0) {
        dashboardButton = heroLinks[0];
    }
    
    // Fallback: find by text content
    if (!dashboardButton) {
        const allLinks = document.querySelectorAll('a, button');
        allLinks.forEach(el => {
            if (el && el.textContent && el.textContent.trim() === 'View Dashboard') {
                dashboardButton = el;
            }
        });
    }
    
    if (dashboardButton) {
        dashboardButton.addEventListener('click', (e) => {
            e.preventDefault();
            const dashboardSection = document.getElementById('dashboard');
            
            if (dashboardSection) {
                dashboardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Update active nav link
                const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
                if (navLinks) {
                    navLinks.forEach(l => {
                        if (l) l.classList.remove('active');
                    });
                    
                    const dashboardLink = document.querySelector('.nav-link[href="#dashboard"]');
                    if (dashboardLink) {
                        dashboardLink.classList.add('active');
                    }
                }
            } else {
                console.warn('[hero] Dashboard section not found');
            }
        });
    } else {
        console.warn('[hero] View Dashboard button not found');
    }
    
    // Download Sample CSV button
    let csvButton = null;
    
    // First try to find in hero section
    const heroSection = document.querySelector('header.hero');
    if (heroSection) {
        const heroButtons = heroSection.querySelectorAll('button, a');
        heroButtons.forEach(btn => {
            if (btn && btn.textContent && btn.textContent.trim() === 'Download Sample CSV') {
                csvButton = btn;
            }
        });
    }
    
    // Fallback: search entire page
    if (!csvButton) {
        const downloadButtons = document.querySelectorAll('button, a');
        downloadButtons.forEach(btn => {
            if (btn && btn.textContent && btn.textContent.trim() === 'Download Sample CSV') {
                csvButton = btn;
            }
        });
    }
    
    if (csvButton) {
        csvButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            try {
                // Create sample CSV content
                const csvContent = `origin_lat,origin_lng,destination_lat,destination_lng,timestamp,duration_minutes,distance_km
8.9824,-79.5199,8.9530,-79.5346,2024-01-15T10:30:00,25,8.5
8.9824,-79.5199,8.9746,-79.5381,2024-01-15T11:15:00,18,6.2
8.9824,-79.5199,8.9693,-79.5230,2024-01-15T12:00:00,15,4.8
8.9824,-79.5199,8.9544,-79.5546,2024-01-15T13:45:00,30,12.3
8.9824,-79.5199,8.9560,-79.5320,2024-01-15T14:20:00,22,9.1`;
                
                // Create blob
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                
                // Create download link
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                
                link.setAttribute('href', url);
                link.setAttribute('download', 'sample_tourism_data.csv');
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                
                // Cleanup
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(url), 100);
                
            } catch (err) {
                console.warn('[hero] Error creating CSV download:', err);
                alert('Download coming soon! Sample CSV functionality will be available shortly.');
            }
        });
    } else {
        console.warn('[hero] Download Sample CSV button not found');
    }
}

// ========================================
// 4. Data upload mock
// ========================================

function setupDataUpload() {
    const uploadInput = document.getElementById('data-file');
    const uploadStatus = document.getElementById('upload-status');
    const uploadArea = document.getElementById('uploadArea');
    
    // Handle file input change
    if (uploadInput) {
        uploadInput.addEventListener('change', () => {
            const file = uploadInput.files && uploadInput.files[0];
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
    
    // Handle drag and drop if upload area exists
    if (uploadArea && uploadInput) {
        // Click to trigger file input
        uploadArea.addEventListener('click', function() {
            if (uploadInput && typeof uploadInput.click === 'function') {
                uploadInput.click();
            }
        });
        
        // Drag and drop handlers
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            if (uploadArea) {
                uploadArea.classList.add('dragover');
            }
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            if (uploadArea) {
                uploadArea.classList.remove('dragover');
            }
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            
            if (uploadArea) {
                uploadArea.classList.remove('dragover');
            }
            
            const files = e.dataTransfer && e.dataTransfer.files;
            if (files && files.length > 0 && uploadInput) {
                try {
                    // Create a FileList-like object and trigger change
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(files[0]);
                    uploadInput.files = dataTransfer.files;
                    uploadInput.dispatchEvent(new Event('change', { bubbles: true }));
                } catch (err) {
                    console.warn('[upload] Error handling file drop:', err);
                    // Fallback: just show status message
                    if (uploadStatus && files[0]) {
                        uploadStatus.textContent = `Loaded: ${files[0].name} ✅ (mock processed)`;
                    }
                }
            }
        });
    } else {
        if (!uploadArea) {
            console.warn('[upload] #uploadArea not found');
        }
    }
}
