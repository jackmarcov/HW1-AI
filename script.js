// OnAds Tourism Insights – main JS

document.addEventListener('DOMContentLoaded', function() {
    setupNavbar();
    setupTopButtons();
    setupDataUpload();
});

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
            const scrollPosition = window.pageYOffset + 100;
            
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
            if (window.pageYOffset < 100) {
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
// 3. Data upload mock
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
