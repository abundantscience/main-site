/**
 * Centralized Supabase initialization and form handling
 */
(function() {
    // Singleton pattern to ensure single initialization
    if (window.SupabaseHandler) return;

    class SupabaseHandler {
        constructor() {
            this.client = null;
            this.initialized = false;
            this.initPromise = null;
        }

        /**
         * Initialize Supabase client (singleton)
         */
        async init() {
            if (this.initialized) return this.client;
            if (this.initPromise) return this.initPromise;

            this.initPromise = new Promise((resolve) => {
                const SUPABASE_URL = "https://jicytgdlbevccejowlnf.supabase.co";
                const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppY3l0Z2RsYmV2Y2Nlam93bG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNDQzNTYsImV4cCI6MjA2MDkyMDM1Nn0.DRfZefUPOLjhdxYudhvQKGePr6ex-Xf3JBkedbF7_OY";
                
                this.client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                this.initialized = true;
                console.log('✅ Supabase initialized');
                resolve(this.client);
            });

            return this.initPromise;
        }

        /**
         * Validate email with enhanced checks
         */
        validateEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!emailRegex.test(email)) {
                return { valid: false, message: 'Please enter a valid email address' };
            }

            // Check for disposable email domains
            const disposableDomains = ['tempmail', 'throwaway', '10minutemail'];
            const domain = email.split('@')[1].toLowerCase();
            
            if (disposableDomains.some(d => domain.includes(d))) {
                return { valid: false, message: 'Please use a permanent email address' };
            }

            return { valid: true };
        }

        /**
         * Submit form data to Supabase
         */
        async submitForm(formData, table = 'waitlist') {
            await this.init();

            try {
                const { data, error } = await this.client
                    .from(table)
                    .insert([formData]);

                if (error) throw error;

                console.log(`✅ Data submitted to ${table}`);
                return { success: true, data };

            } catch (error) {
                console.error(`❌ Submission failed:`, error);
                return { 
                    success: false, 
                    error: error.message || 'Something went wrong' 
                };
            }
        }

        /**
         * Initialize form handlers
         */
        initWaitlistForm() {
            const form = document.getElementById("waitlist-form");
            if (!form) return;

            // Remove any existing listeners
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);

            newForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                await this.handleFormSubmit(newForm);
            });

            console.log('✅ Waitlist form initialized');
        }

        /**
         * Handle form submission with validation
         */
        
        async handleFormSubmit(form) {
            const formData = new FormData(form);
            const submitButton = form.querySelector('button[type="submit"]');
            const messageEl = form.querySelector('#message') || this.createMessageElement(form);
        
            // Disable submit button
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Submitting...';
            }
        
            // Build data object
            const dataToSubmit = {
                source_page: window.location.pathname,
                timestamp: new Date().toISOString()
            };
        
            // Supported fields
            const FIELDS = [
                "email", "full_name", "name", "phone", "province", "country",
                "business_name", "business_type", "campaign", "discreet", 
                "consent", "age", "quiz-dr-rb", "quiz-lab-rb", "quiz-hc-sa", 
                "quiz_source"
            ];
        
            // Process form data
            for (let [key, value] of formData.entries()) {
                if (FIELDS.includes(key) && key !== 'campaign') {
                    dataToSubmit[key] = value;
                }
            }
        
            // Handle campaign checkboxes specially
            const campaignCheckboxes = form.querySelectorAll('.campaign-checkbox:checked');
            if (campaignCheckboxes.length > 0) {
                const campaigns = Array.from(campaignCheckboxes).map(cb => cb.value);
                // Store as JSON string for Supabase JSONB column
                dataToSubmit.campaign = JSON.stringify(campaigns);
            } else {
                // Check for regular campaign field
                const campaignValue = formData.get('campaign');
                if (campaignValue) {
                    dataToSubmit.campaign = Array.isArray(campaignValue) 
                        ? JSON.stringify(campaignValue) 
                        : campaignValue;
                }
            }
        
            // Handle discreet checkbox
            const discreetCheckbox = form.querySelector('#discreet-checkbox');
            if (discreetCheckbox) {
                dataToSubmit.discreet = discreetCheckbox.checked;
            }
        
            // Validate email
            if (dataToSubmit.email) {
                const validation = this.validateEmail(dataToSubmit.email);
                if (!validation.valid) {
                    this.showMessage(messageEl, validation.message, 'error');
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = 'Submit';
                    }
                    return;
                }
            }
        
            // Submit to Supabase
            const result = await this.submitForm(dataToSubmit);
        
            if (result.success) {
                this.showMessage(messageEl, "✅ You're on the list!", 'success');
                form.reset();
                
                // Track event
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        'event_category': 'engagement',
                        'event_label': dataToSubmit.source_page
                    });
                }
            } else {
                this.showMessage(messageEl, `❌ ${result.error}`, 'error');
            }
        
            // Re-enable submit button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit';
            }
        }
        /**
         * Show message to user
         */
        showMessage(element, text, type) {
            element.textContent = text;
            element.className = type;
            element.style.display = 'block';

            // Auto-hide success messages
            if (type === 'success') {
                setTimeout(() => {
                    element.style.display = 'none';
                }, 5000);
            }
        }

        /**
         * Create message element if it doesn't exist
         */
        createMessageElement(form) {
            const msg = document.createElement('div');
            msg.id = 'message';
            msg.style.marginTop = '1rem';
            form.appendChild(msg);
            return msg;
        }
    }

    // Create global instance
    window.SupabaseHandler = new SupabaseHandler();
    window.initWaitlistForm = () => window.SupabaseHandler.initWaitlistForm();

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.SupabaseHandler.init();
        });
    } else {
        window.SupabaseHandler.init();
    }
})();
