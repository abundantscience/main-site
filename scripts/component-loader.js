/**
 * Component Loader with enhanced error handling and performance
 */
class ComponentLoader {
    constructor() {
        this.loadedComponents = new Set();
        this.loadingStates = new Map();
        this.retryAttempts = new Map();
        this.maxRetries = 2;
    }

    /**
     * Load a component with caching and error handling
     */
    async loadComponent(targetId, filePath, options = {}) {
        const { 
            critical = false, 
            retry = true,
            callback = null 
        } = options;

        // Check if already loaded
        if (this.loadedComponents.has(targetId)) {
            console.log(`⚡ Component already loaded: ${targetId}`);
            return;
        }

        const target = document.getElementById(targetId);
        if (!target) {
            console.warn(`⚠️ Target element not found: ${targetId}`);
            return;
        }

        // Show loading state for critical components
        if (critical) {
            target.innerHTML = '<div class="component-loading">Loading...</div>';
        }

        try {
            // Track loading state
            this.loadingStates.set(targetId, 'loading');
            
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            target.innerHTML = html;
            
            // Mark as loaded
            this.loadedComponents.add(targetId);
            this.loadingStates.set(targetId, 'loaded');
            
            console.log(`✅ Loaded: ${targetId} from ${filePath}`);
            
            // Execute callback if provided
            if (callback && typeof callback === 'function') {
                callback(target);
            }

            // Dispatch custom event
            target.dispatchEvent(new CustomEvent('componentLoaded', { 
                detail: { targetId, filePath } 
            }));

        } catch (error) {
            console.error(`❌ Failed to load ${targetId}:`, error.message);
            this.loadingStates.set(targetId, 'error');
            
            // Retry logic
            if (retry && this.shouldRetry(targetId)) {
                console.log(`🔄 Retrying ${targetId}...`);
                setTimeout(() => {
                    this.loadComponent(targetId, filePath, options);
                }, 1000);
            } else {
                // Show error state
                target.innerHTML = `
                    <div class="component-error">
                        Failed to load content. 
                        <button onclick="location.reload()">Refresh page</button>
                    </div>
                `;
            }
        }
    }

    /**
     * Check if we should retry loading
     */
    shouldRetry(targetId) {
        const attempts = this.retryAttempts.get(targetId) || 0;
        if (attempts < this.maxRetries) {
            this.retryAttempts.set(targetId, attempts + 1);
            return true;
        }
        return false;
    }

    /**
     * Load multiple components with priority
     */
    async loadAll(components) {
        // Separate critical and non-critical components
        const critical = components.filter(c => c.critical);
        const nonCritical = components.filter(c => !c.critical);

        // Load critical components first
        await Promise.all(
            critical.map(({ id, path, ...options }) => 
                this.loadComponent(id, path, options)
            )
        );

        // Then load non-critical components
        nonCritical.forEach(({ id, path, ...options }) => {
            this.loadComponent(id, path, options);
        });
    }
}

/**
 * Navigation Handler with proper event management
 */
class NavigationHandler {
    constructor() {
        this.isMenuOpen = false;
        this.hamburger = null;
        this.mobileNav = null;
        this.menuWrapper = null;
    }

    /**
     * Initialize navigation with MutationObserver
     */
    init() {
        // Wait for navbar to be loaded
        const observer = new MutationObserver((mutations, obs) => {
            this.hamburger = document.getElementById('hamburger-button');
            this.mobileNav = document.getElementById('mobile-nav-links');
            this.menuWrapper = document.getElementById('mobile-menu-wrapper');
            
            if (this.hamburger && this.mobileNav && this.menuWrapper) {
                this.setupEventListeners();
                obs.disconnect();
                console.log('✅ Navigation initialized');
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Timeout fallback
        setTimeout(() => {
            if (!this.hamburger) {
                console.warn('⚠️ Navigation timeout - elements not found');
                observer.disconnect();
            }
        }, 5000);
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Hamburger click
        this.hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.toggleMenu();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.menuWrapper.contains(e.target) && this.isMenuOpen) {
                this.closeMenu();
            }
        });

        // Close on nav link click
        this.mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Handle resize
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.isMenuOpen ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
        this.isMenuOpen = true;
        this.mobileNav.style.display = 'flex';
        this.menuWrapper.classList.add('menu-open');
        this.hamburger.classList.add('open');
        
        // Accessibility
        this.hamburger.setAttribute('aria-expanded', 'true');
        this.mobileNav.setAttribute('aria-hidden', 'false');
    }

    closeMenu() {
        this.isMenuOpen = false;
        this.mobileNav.style.display = 'none';
        this.menuWrapper.classList.remove('menu-open');
        this.hamburger.classList.remove('open');
        
        // Accessibility
        this.hamburger.setAttribute('aria-expanded', 'false');
        this.mobileNav.setAttribute('aria-hidden', 'true');
    }

    handleResize() {
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMenu();
            this.mobileNav.style.display = '';
        }
    }
}

/**
 * Initialize everything on DOM ready
 */
document.addEventListener("DOMContentLoaded", () => {
    const loader = new ComponentLoader();
    const nav = new NavigationHandler();

    // Define components with priority
    const components = [
        { 
            id: "nav-placeholder", 
            path: "/components/navbar.html", 
            critical: true,
            callback: () => nav.init()
        },
        { 
            id: "footer-placeholder", 
            path: "/components/footer.html",
            critical: false
        },
        { 
            id: "header-placeholder", 
            path: "/components/header.html",
            critical: false
        }
    ];

    // Load all components
    loader.loadAll(components);

    // Add loading state styles
    if (!document.getElementById('component-styles')) {
        const styles = document.createElement('style');
        styles.id = 'component-styles';
        styles.textContent = `
            .component-loading {
                padding: 1rem;
                text-align: center;
                color: #666;
                font-style: italic;
            }
            .component-error {
                padding: 1rem;
                text-align: center;
                color: #dc2626;
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 4px;
            }
            .component-error button {
                margin-top: 0.5rem;
                padding: 0.25rem 1rem;
                background: #dc2626;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            .component-error button:hover {
                background: #b91c1c;
            }
        `;
        document.head.appendChild(styles);
    }
});

// Export for use in other scripts
window.ComponentLoader = ComponentLoader;
window.NavigationHandler = NavigationHandler;
