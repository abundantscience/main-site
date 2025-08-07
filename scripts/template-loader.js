/**
 * Template Loader with lazy loading and caching
 */
class TemplateLoader {
    constructor() {
        this.cache = new Map();
        this.pendingLoads = new Map();
    }

    /**
     * Load template with caching
     */
    async loadTemplate(targetId, templatePath, options = {}) {
        const { 
            cache = true, 
            initForm = false,
            lazyLoad = false 
        } = options;

        const target = document.getElementById(targetId);
        if (!target) {
            console.warn(`⚠️ Target not found: ${targetId}`);
            return;
        }

        // Implement lazy loading with Intersection Observer
        if (lazyLoad) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadTemplate(targetId, templatePath, { ...options, lazyLoad: false });
                        obs.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '50px' });
            
            observer.observe(target);
            return;
        }

        try {
            let html;

            // Check cache first
            if (cache && this.cache.has(templatePath)) {
                html = this.cache.get(templatePath);
                console.log(`⚡ Using cached template: ${templatePath}`);
            } else {
                // Check if already loading
                if (this.pendingLoads.has(templatePath)) {
                    html = await this.pendingLoads.get(templatePath);
                } else {
                    // Start new load
                    const loadPromise = fetch(templatePath)
                        .then(res => {
                            if (!res.ok) throw new Error(`HTTP ${res.status}`);
                            return res.text();
                        });
                    
                    this.pendingLoads.set(templatePath, loadPromise);
                    html = await loadPromise;
                    this.pendingLoads.delete(templatePath);
                    
                    // Cache the result
                    if (cache) {
                        this.cache.set(templatePath, html);
                    }
                }
            }

            // Insert HTML
            target.innerHTML = html;
            console.log(`✅ Loaded template: ${targetId}`);

            // Initialize forms if needed
            if (initForm) {
                // Wait for next tick to ensure DOM is updated
                await new Promise(resolve => setTimeout(resolve, 0));
                
                const form = target.querySelector('#waitlist-form');
                if (form && typeof window.initWaitlistForm === 'function') {
                    window.initWaitlistForm();
                    console.log(`✅ Form initialized: ${targetId}`);
                }
            }

            // Dispatch event
            target.dispatchEvent(new CustomEvent('templateLoaded', {
                detail: { targetId, templatePath }
            }));

        } catch (error) {
            console.error(`❌ Failed to load template ${targetId}:`, error);
            target.innerHTML = `<div class="template-error">Failed to load content</div>`;
        }
    }

    /**
     * Preload templates for better performance
     */
    async preloadTemplates(paths) {
        const promises = paths.map(path => 
            fetch(path)
                .then(res => res.text())
                .then(html => {
                    this.cache.set(path, html);
                    console.log(`📦 Preloaded: ${path}`);
                })
                .catch(err => console.warn(`⚠️ Failed to preload ${path}:`, err))
        );
        
        await Promise.all(promises);
    }
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", function () {
    const loader = new TemplateLoader();

    // Define templates with their options
    const templates = [
        { 
            id: 'basic-form-template-placeholder', 
            path: '/templates/basic-form-template.html',
            initForm: true
        },
        { 
            id: 'form-placeholder', 
            path: '/templates/form-template.html',
            initForm: true
        },
        { 
            id: 'signup-placeholder', 
            path: '/templates/signup-template.html',
            initForm: true
        },
        { 
            id: 'signup-form-placeholder', 
            path: '/templates/signup-form-template.html',
            initForm: true,
            lazyLoad: true  // Lazy load if below fold
        },
        { 
            id: 'waitlist-form-placeholder', 
            path: '/templates/waitlist-form.html',
            initForm: true
        },
        { 
            id: 'homepage-form-placeholder', 
            path: '/templates/homepage-form.html',
            initForm: true
        }
    ];

    // Load templates
    templates.forEach(({ id, path, ...options }) => {
        if (document.getElementById(id)) {
            loader.loadTemplate(id, path, options);
        }
    });

    // Optional: Preload common templates on idle
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            loader.preloadTemplates([
                '/templates/signup-form-template.html',
                '/templates/basic-form-template.html'
            ]);
        });
    }
});

// Export for use in other scripts
window.TemplateLoader = TemplateLoader;
