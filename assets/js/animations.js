/**
 * HungrAI.ai - Animations and Parallax Effects
 * Handles scroll-based animations, parallax effects, and progress bar
 */

// Animation Management Class
window.hungraiAnimations = {
    container: null,
    progressBar: null,
    heroBg: null,
    emojis: null,
    isInitialized: false,

    // Initialize animations
    init() {
        if (this.isInitialized) return;

        this.container = document.getElementById('container');
        this.progressBar = document.getElementById('progressBar');
        this.heroBg = document.querySelector('.hero-parallax-bg');
        this.emojis = document.querySelectorAll('.emoji');

        if (this.container) {
            this.setupScrollListener();
            this.isInitialized = true;
            console.log('HungrAI animations initialized');
        }
    },

    // Main scroll event handler
    setupScrollListener() {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateAnimations();
                    ticking = false;
                });
                ticking = true;
            }
        };

        this.container.addEventListener('scroll', handleScroll);
        
        // Initial call
        this.updateAnimations();
    },

    // Update all scroll-based animations
    updateAnimations() {
        const scrolled = this.container.scrollTop;
        const maxScroll = this.container.scrollHeight - this.container.clientHeight;
        
        // Update progress bar
        this.updateProgressBar(scrolled, maxScroll);
        
        // Update parallax effects
        this.updateParallax(scrolled);
        
        // Update floating emojis
        this.updateFloatingEmojis(scrolled);
    },

    // Progress bar animation
    updateProgressBar(scrolled, maxScroll) {
        if (!this.progressBar) return;
        
        const scrollProgress = Math.min((scrolled / maxScroll) * 100, 100);
        this.progressBar.style.width = scrollProgress + '%';
    },

    // Parallax background effect
    updateParallax(scrolled) {
        if (!this.heroBg) return;
        
        const rate = scrolled * -0.5;
        this.heroBg.style.transform = `translateY(${rate}px)`;
    },

    // Floating emojis animation
    updateFloatingEmojis(scrolled) {
        if (!this.emojis || this.emojis.length === 0) return;
        
        this.emojis.forEach((emoji, index) => {
            const speed = 0.3 + (index * 0.1);
            const yTransform = scrolled * speed;
            const rotation = scrolled * 0.1;
            
            emoji.style.transform = `translateY(${yTransform}px) rotate(${rotation}deg)`;
        });
    },

    // Smooth scroll to element
    scrollToElement(selector) {
        const element = document.querySelector(selector);
        if (!element || !this.container) return;
        
        const containerRect = this.container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const scrollTarget = this.container.scrollTop + elementRect.top - containerRect.top;
        
        this.container.scrollTo({
            top: scrollTarget,
            behavior: 'smooth'
        });
    },

    // Enhanced modal transitions
    enhanceModalTransitions() {
        const modals = document.querySelectorAll('.modal');
        
        modals.forEach(modal => {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const overlay = modal.closest('.modal-overlay');
                        if (overlay && overlay.classList.contains('active')) {
                            this.animateModalEntrance(modal);
                        }
                    }
                });
            });
            
            observer.observe(modal.closest('.modal-overlay'), {
                attributes: true,
                attributeFilter: ['class']
            });
        });
    },

    // Modal entrance animation
    animateModalEntrance(modal) {
        modal.style.transform = 'scale(0.9) translateY(20px)';
        modal.style.opacity = '0';
        
        requestAnimationFrame(() => {
            modal.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            modal.style.transform = 'scale(1) translateY(0)';
            modal.style.opacity = '1';
        });
    },

    // Staggered entrance animations
    setupStaggeredAnimations() {
        const animatedGroups = [
            { selector: '.overview-card', delay: 100 },
            { selector: '.step', delay: 150 },
            { selector: '.difference-item', delay: 120 },
            { selector: '.project-link', delay: 80 }
        ];

        animatedGroups.forEach(group => {
            const elements = document.querySelectorAll(group.selector);
            
            elements.forEach((element, index) => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = `all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * group.delay}ms`;
            });

            // Intersection Observer for entrance animations
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            elements.forEach(element => observer.observe(element));
        });
    },

    // Button hover enhancements
    enhanceButtonAnimations() {
        const buttons = document.querySelectorAll('.cta-button, .modal-btn, .action-btn, .detail-btn');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px) scale(1.02)';
                this.style.transition = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
            
            button.addEventListener('mousedown', function() {
                this.style.transform = 'translateY(0) scale(0.98)';
            });
            
            button.addEventListener('mouseup', function() {
                this.style.transform = 'translateY(-2px) scale(1.02)';
            });
        });
    },

    // Card hover effects
    enhanceCardAnimations() {
        const cards = document.querySelectorAll('.overview-card, .step, .difference-item, .result-item, .project-link');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                this.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '';
            });
        });
    },

    // Loading animation for results
    createLoadingAnimation() {
        const loadingSpinner = document.querySelector('.loading-spinner');
        if (!loadingSpinner) return;

        // Enhanced spinning animation
        loadingSpinner.style.animation = 'spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite';
        
        // Add pulsing effect
        const pulseKeyframes = `
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.8; }
            }
        `;
        
        if (!document.querySelector('#pulse-animation')) {
            const style = document.createElement('style');
            style.id = 'pulse-animation';
            style.textContent = pulseKeyframes;
            document.head.appendChild(style);
        }
        
        // Apply pulsing to loading text
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.style.animation = 'pulse 2s ease-in-out infinite';
        }
    },

    // Cleanup animations
    cleanup() {
        if (this.container) {
            this.container.removeEventListener('scroll', this.updateAnimations);
        }
        this.isInitialized = false;
    },

    // Performance optimization - reduce animations on slow devices
    optimizeForPerformance() {
        const isSlowDevice = navigator.hardwareConcurrency < 4 || 
                           /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isSlowDevice) {
            // Disable parallax effects on slow devices
            if (this.heroBg) {
                this.heroBg.style.transform = 'none';
            }
            
            // Reduce emoji animations
            this.emojis.forEach(emoji => {
                emoji.style.animation = 'float 12s ease-in-out infinite';
            });
            
            console.log('Animations optimized for slower device');
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize core animations
    window.hungraiAnimations.init();
    
    // Set up enhanced animations
    setTimeout(() => {
        window.hungraiAnimations.enhanceModalTransitions();
        window.hungraiAnimations.setupStaggeredAnimations();
        window.hungraiAnimations.enhanceButtonAnimations();
        window.hungraiAnimations.enhanceCardAnimations();
        window.hungraiAnimations.optimizeForPerformance();
    }, 100);
    
    console.log('HungrAI animations ready');
});

// Handle page visibility changes to pause animations when not visible
document.addEventListener('visibilitychange', function() {
    const animations = document.querySelectorAll('.emoji, .loading-spinner');
    
    if (document.hidden) {
        animations.forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    } else {
        animations.forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
});

// Export for global access
window.scrollToSection = window.hungraiAnimations.scrollToElement.bind(window.hungraiAnimations);