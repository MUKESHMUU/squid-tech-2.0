// ==========================================
// SQUID TECH: Anti-Cheat Security Module
// ==========================================

/**
 * Enter fullscreen mode
 */
function enterFullscreen() {
    const elem = document.documentElement;
    
    try {
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.warn('Fullscreen request failed:', err));
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        console.log('📺 Fullscreen mode activated');
    } catch (error) {
        console.warn('⚠️ Could not enter fullscreen:', error);
    }
}

class AntiCheatManager {
    constructor() {
        this.gameActive = false;
        this.initializeSecurityMeasures();
    }

    /**
     * Initialize all anti-cheating measures
     */
    initializeSecurityMeasures() {
        // Disable right-click context menu
        this.disableRightClick();
        
        // Disable keyboard shortcuts for copy/paste and dev tools
        this.disableKeyboardShortcuts();
        
        // Prevent page refresh during game
        this.preventPageRefresh();
        
        // Prevent back navigation
        this.preventBackNavigation();
        
        // Disable text selection globally
        this.disableTextSelection();

        // Detect tab switching
        this.detectTabSwitch();
    }

    /**
     * Activate security when game starts
     */
    activateDuringGame() {
        this.gameActive = true;
        console.log('🔒 Anti-cheat measures activated');
    }

    /**
     * Deactivate security when game ends
     */
    deactivateAfterGame() {
        this.gameActive = false;
        console.log('🔓 Anti-cheat measures deactivated');
    }

    /**
     * Disable right-click context menu
     */
    disableRightClick() {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showWarning('Right-click is disabled during the game.');
            return false;
        });
    }

    /**
     * Disable keyboard shortcuts for copy, paste, cut, paste, and dev tools
     */
    disableKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameActive) return;

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

            // Disable F5 (Page Refresh)
            if (e.key === 'F5') {
                e.preventDefault();
                this.showWarning('⚠️ Page refresh is disabled during the game!');
                return false;
            }

            // Disable Ctrl+R (Page Refresh)
            if ((ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.showWarning('⚠️ Page refresh is disabled during the game!');
                return false;
            }

            // Disable Ctrl+C (Copy)
            if (ctrlKey && e.key === 'c') {
                e.preventDefault();
                this.showWarning('Copy is disabled during the game.');
                return false;
            }

            // Disable Ctrl+V (Paste)
            if (ctrlKey && e.key === 'v') {
                e.preventDefault();
                this.showWarning('Paste is disabled during the game.');
                return false;
            }

            // Disable Ctrl+X (Cut)
            if (ctrlKey && e.key === 'x') {
                e.preventDefault();
                this.showWarning('Cut is disabled during the game.');
                return false;
            }

            // Disable Ctrl+U (View Page Source)
            if (ctrlKey && e.key === 'u') {
                e.preventDefault();
                this.showWarning('Viewing page source is disabled during the game.');
                return false;
            }

            // Disable F12 (Developer Tools)
            if (e.key === 'F12') {
                e.preventDefault();
                this.showWarning('Developer tools are disabled during the game.');
                return false;
            }

            // Disable Ctrl+Shift+I (Developer Tools alternative)
            if (ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                this.showWarning('Developer tools are disabled during the game.');
                return false;
            }

            // Disable Ctrl+Shift+C (Inspect Element)
            if (ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.showWarning('Inspect is disabled during the game.');
                return false;
            }

            // Disable Ctrl+Shift+J (Developer Console)
            if (ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
                this.showWarning('Console is disabled during the game.');
                return false;
            }
        });
    }

    /**
     * Detect tab switching and apply penalty
     */
    detectTabSwitch() {
        document.addEventListener('visibilitychange', () => {
            if (!this.gameActive) return;

            if (document.hidden) {
                console.warn('⚠️ Player switched away from game tab!');
                this.showWarning('⚠️ Do not switch tabs during the game! -500 points!');
                
                // Apply penalty through the game object
                if (window.game && typeof window.game.applyPenalty === 'function') {
                    window.game.applyPenalty();
                }
            }
        });
    }

    /**
     * Prevent page refresh during game
     */
    preventPageRefresh() {
        window.addEventListener('beforeunload', (e) => {
            if (this.gameActive) {
                e.preventDefault();
                e.returnValue = '';
                this.showWarning('Navigation is disabled during the competition. Your game will be interrupted!');
                return false;
            }
        });
    }

    /**
     * Prevent browser back navigation
     */
    preventBackNavigation() {
        // Push a state to history on page load
        history.pushState(null, '', window.location.href);

        window.addEventListener('popstate', () => {
            if (this.gameActive) {
                // Push state again to prevent back navigation
                history.pushState(null, '', window.location.href);
                this.showWarning('Back navigation is disabled during the game. Please complete the game.');
            }
        });
    }

    /**
     * Disable text selection and copying
     */
    disableTextSelection() {
        // Add CSS rule to prevent user selection
        const style = document.createElement('style');
        style.textContent = `
            * {
                user-select: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
            }
        `;
        document.head.appendChild(style);

        // Prevent select event
        document.addEventListener('selectstart', (e) => {
            if (this.gameActive) {
                e.preventDefault();
                return false;
            }
        });
    }

    /**
     * Show warning message to user
     */
    showWarning(message) {
        // Create or update warning message
        let warningEl = document.getElementById('cheating-warning');
        if (!warningEl) {
            warningEl = document.createElement('div');
            warningEl.id = 'cheating-warning';
            warningEl.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 0, 65, 0.95);
                color: white;
                padding: 20px 30px;
                border-radius: 8px;
                z-index: 10000;
                font-weight: bold;
                text-align: center;
                box-shadow: 0 8px 32px rgba(255, 0, 65, 0.5);
                animation: cheatingWarningPulse 0.4s ease-in-out;
            `;
            document.body.appendChild(warningEl);
        }

        warningEl.textContent = message;
        warningEl.style.display = 'block';

        // Hide after 3 seconds
        setTimeout(() => {
            warningEl.style.display = 'none';
        }, 3000);
    }
}

// Create global security manager instance
const securityManager = new AntiCheatManager();

// Add animation for warning messages
const style = document.createElement('style');
style.textContent = `
    @keyframes cheatingWarningPulse {
        0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.05);
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
