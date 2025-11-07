/**
 * HungrAI.ai - UI Interactions and State Management
 * Handles modals, forms, and user interface logic
 */

// Global state management
window.hungraiState = {
    selectedMood: null,
    preferences: {
        vibe: 'cook',
        people: '1',
        time: 'now',
        budget: '2',
        dietary: []
    },

    getCurrentPreferences() {
        return {
            mood: this.selectedMood,
            location: document.getElementById('location-input')?.value || '',
            vibe: this.preferences.vibe,
            budget: this.preferences.budget,
            people: this.preferences.people,
            time: this.preferences.time,
            dietary: this.preferences.dietary
        };
    },

    updatePreference(key, value) {
        this.preferences[key] = value;
        console.log('Updated preference:', key, value);
    }
};

// UI Management Class
window.hungraiUI = {
    
    // Modal Functions
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    },

    nextStep(nextModalId) {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => modal.classList.remove('active'));
        
        setTimeout(() => {
            this.openModal(nextModalId);
        }, 300);
    },

    previousStep(prevModalId) {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => modal.classList.remove('active'));
        
        setTimeout(() => {
            this.openModal(prevModalId);
        }, 300);
    },

    // Budget Display Update
    updateBudgetDisplay() {
        const budgetRange = document.getElementById('budget-range');
        const budgetDisplay = document.getElementById('budget-display');
        
        if (budgetRange && budgetDisplay) {
            const value = budgetRange.value;
            const labels = ['Budget ($)', 'Moderate ($$)', 'Upscale ($$$)', 'Fine Dining ($$$$)'];
            budgetDisplay.textContent = labels[value - 1];
            window.hungraiState.updatePreference('budget', value);
        }
    },

    // Results Display
    displayResults(results) {
        const resultsContent = document.getElementById('results-content');
        if (!resultsContent) return;

        let resultsHTML = '';
        
        // Mood summary
        resultsHTML += '<div class="mood-summary">';
        resultsHTML += '<div class="mood-summary-title">Perfect matches for your ' + (window.hungraiState.selectedMood || 'current') + ' mood!</div>';
        resultsHTML += '<div class="mood-summary-text">' + (results.mood_summary || 'Here are personalized recommendations just for you') + '</div>';
        resultsHTML += '</div>';
        
        // Display recommendations
        if (results.recommendations && results.recommendations.length > 0) {
            results.recommendations.forEach(rec => {
                resultsHTML += '<div class="result-item">';
                resultsHTML += '<div class="result-header">';
                resultsHTML += '<h4 class="result-title">' + rec.title + '</h4>';
                resultsHTML += '<span class="result-badge ' + rec.type.toLowerCase() + '">' + rec.type + '</span>';
                resultsHTML += '</div>';
                resultsHTML += '<p class="result-description">' + rec.description + '</p>';
                
                if (rec.why_perfect) {
                    resultsHTML += '<div style="background: #e7f3ff; padding: 0.5rem; border-radius: 6px; margin: 0.5rem 0; font-size: 0.85rem; color: #0066cc;">';
                    resultsHTML += '💡 <strong>Why it\'s perfect:</strong> ' + rec.why_perfect;
                    resultsHTML += '</div>';
                }
                
                resultsHTML += '<div class="result-meta">';
                resultsHTML += '<div class="result-meta-item">⏱️ ' + rec.time + '</div>';
                resultsHTML += '<div class="result-meta-item">💰 ' + rec.budget + '</div>';
                resultsHTML += '<div class="result-meta-item">👥 ' + window.hungraiState.preferences.people + '</div>';
                resultsHTML += '</div>';
                resultsHTML += '</div>';
            });
        }
        
        // Action buttons
        resultsHTML += '<div class="action-buttons">';
        resultsHTML += '<button class="action-btn" onclick="generateResults()">Get More Options</button>';
        resultsHTML += '<button class="action-btn" onclick="alert(\'Save feature coming soon!\')">Save Favorites</button>';
        resultsHTML += '<button class="action-btn primary" onclick="startOver()">Start Over</button>';
        resultsHTML += '</div>';
        
        resultsContent.innerHTML = resultsHTML;
    },

    // Error Display
    showError(errorType) {
        const resultsContent = document.getElementById('results-content');
        if (!resultsContent) return;

        const content = window.hungraiContent?.content;
        let resultsHTML = '';

        switch (errorType) {
            case 'API_KEY_MISSING':
                resultsHTML = '<div style="text-align: center; padding: 2rem;">';
                resultsHTML += '<h4 style="color: #dc3545; margin-bottom: 1rem;">⚠️ API Key Required</h4>';
                resultsHTML += '<p style="color: #6c757d; margin-bottom: 1rem;">To use the AI recommendations, you need to:</p>';
                resultsHTML += '<ol style="text-align: left; color: #495057; line-height: 1.6;">';
                resultsHTML += '<li>Get an OpenAI API key from <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a></li>';
                resultsHTML += '<li>Configure your environment variables</li>';
                resultsHTML += '<li>Reload the page and try again</li>';
                resultsHTML += '</ol>';
                resultsHTML += '<p style="color: #6c757d; font-size: 0.9rem; margin-top: 1rem;">Once configured, you\'ll get personalized AI recommendations!</p>';
                resultsHTML += '</div>';
                break;

            case 'PARSE_ERROR':
                resultsHTML = '<div style="text-align: center; padding: 2rem;">';
                resultsHTML += '<h4 style="color: #ffc107; margin-bottom: 1rem;">⚠️ Response Parse Error</h4>';
                resultsHTML += '<p style="color: #6c757d;">AI responded, but in an unexpected format.</p>';
                resultsHTML += '<button class="action-btn primary" onclick="generateResults()" style="margin-top: 1rem;">Try Again</button>';
                resultsHTML += '</div>';
                break;

            default:
                resultsHTML = '<div style="text-align: center; padding: 2rem;">';
                resultsHTML += '<h4 style="color: #dc3545; margin-bottom: 1rem;">⚠️ Error</h4>';
                resultsHTML += '<p style="color: #6c757d;">Sorry, there was an issue: ' + errorType + '</p>';
                resultsHTML += '<button class="action-btn primary" onclick="generateResults()" style="margin-top: 1rem;">Try Again</button>';
                resultsHTML += '</div>';
        }
        
        resultsContent.innerHTML = resultsHTML;
    }
};

// Global Functions (for backward compatibility)
window.openModal = window.hungraiUI.openModal.bind(window.hungraiUI);
window.closeModal = window.hungraiUI.closeModal.bind(window.hungraiUI);
window.nextStep = window.hungraiUI.nextStep.bind(window.hungraiUI);
window.previousStep = window.hungraiUI.previousStep.bind(window.hungraiUI);

// Utility Functions
window.scrollToSection = function(selector) {
    const element = document.querySelector(selector);
    const container = document.getElementById('container');
    
    if (!element || !container) return;
    
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const scrollTarget = container.scrollTop + elementRect.top - containerRect.top;
    
    container.scrollTo({
        top: scrollTarget,
        behavior: 'smooth'
    });
};

window.startOver = function() {
    window.hungraiState.selectedMood = null;
    window.hungraiState.preferences = {
        vibe: 'cook',
        people: '1',
        time: 'now',
        budget: '2',
        dietary: []
    };
    
    // Reset forms
    const moodOptions = document.querySelectorAll('.mood-option');
    moodOptions.forEach(option => option.classList.remove('selected'));
    
    const moodNext = document.getElementById('mood-next');
    if (moodNext) moodNext.disabled = true;
    
    window.hungraiUI.closeModal('results-modal');
    window.hungraiUI.openModal('mood-modal');
};

// OpenStreetMaps integration
window.openDirections = function(destination, origin) {
    const osmUrl = 'https://www.openstreetmap.org/directions?from=' + 
                  encodeURIComponent(origin) + '&to=' + encodeURIComponent(destination);
    window.open(osmUrl, '_blank');
};

// DOM Ready Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('HungrAI.ai UI initialized');

    // Mood selection listeners
    const moodOptions = document.querySelectorAll('.mood-option');
    moodOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected from all options
            moodOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected to clicked option
            this.classList.add('selected');
            window.hungraiState.selectedMood = this.dataset.mood;
            
            // Enable next button
            const nextBtn = document.getElementById('mood-next');
            if (nextBtn) nextBtn.disabled = false;
        });

        // Keyboard support
        option.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // Toggle group listeners
    const toggleGroups = document.querySelectorAll('.toggle-group');
    toggleGroups.forEach(group => {
        const options = group.querySelectorAll('.toggle-option');
        options.forEach(option => {
            option.addEventListener('click', function() {
                // Remove active from siblings
                options.forEach(opt => {
                    opt.classList.remove('active');
                    opt.setAttribute('aria-checked', 'false');
                });
                
                // Add active to clicked option
                this.classList.add('active');
                this.setAttribute('aria-checked', 'true');
                
                // Update state
                if (this.dataset.vibe) {
                    window.hungraiState.updatePreference('vibe', this.dataset.vibe);
                } else if (this.dataset.people) {
                    window.hungraiState.updatePreference('people', this.dataset.people);
                } else if (this.dataset.time) {
                    window.hungraiState.updatePreference('time', this.dataset.time);
                }
            });
        });
    });

    // Budget slider listener
    const budgetRange = document.getElementById('budget-range');
    if (budgetRange) {
        budgetRange.addEventListener('input', window.hungraiUI.updateBudgetDisplay);
        window.hungraiUI.updateBudgetDisplay(); // Initialize display
    }

    // Location input listener
    const locationInput = document.getElementById('location-input');
    if (locationInput) {
        locationInput.addEventListener('blur', function() {
            window.hungraiState.updatePreference('location', this.value);
        });
    }

    // Dietary preferences listeners
    const checkboxes = document.querySelectorAll('#preferences-modal input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const checked = document.querySelectorAll('#preferences-modal input[type="checkbox"]:checked');
            const dietary = Array.from(checked).map(cb => cb.value);
            window.hungraiState.updatePreference('dietary', dietary);
        });
    });

    // Modal overlay click to close
    const overlays = document.querySelectorAll('.modal-overlay');
    overlays.forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                window.hungraiUI.closeModal(this.id);
            }
        });
    });

    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                window.hungraiUI.closeModal(activeModal.id);
            }
        }
    });

    // Initialize entrance animations observer
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
        root: document.getElementById('container')
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe animated elements
    const animatedElements = document.querySelectorAll('.overview-card, .step, .difference-item, .project-link');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease-out';
        observer.observe(element);
    });

    console.log('All UI event listeners attached');
});