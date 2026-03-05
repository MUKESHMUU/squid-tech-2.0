// ==========================================
// SQUID TECH: Lobby Management System (Firebase)
// ==========================================

class LobbyManager {
    constructor() {
        // Lobby configuration
        this.MAX_TEAMS = 200;
        
        this.STORAGE_KEYS = {
            CURRENT_TEAM: 'squid_current_team',
            GAME_SESSION_ID: 'squid_game_session_id'
        };

        this.listeners = {
            onGameStart: null,
            onTeamJoin: null,
            onTeamsUpdate: null
        };

        // Wait for Firebase to be ready
        this.firebaseReady = false;
        this.initializeFirebaseListeners();
    }

    /**
     * Register event listeners for game events
     */
    registerListener(eventName, callback) {
        if (this.listeners.hasOwnProperty(`on${eventName}`)) {
            this.listeners[`on${eventName}`] = callback;
        }
    }

    /**
     * Initialize Firebase listeners
     */
    initializeFirebaseListeners() {
        // Wait for Firebase to be available
        const checkFirebase = setInterval(() => {
            if (typeof window.firebaseDB !== 'undefined') {
                clearInterval(checkFirebase);
                this.firebaseReady = true;
                console.log('✅ Firebase listeners initialized');

                // Listen to game start
                window.firebaseDB.onGameStart((isStarted) => {
                    if (isStarted && this.listeners.onGameStart) {
                        this.listeners.onGameStart();
                    }
                });

                // Listen to teams updates
                window.firebaseDB.onTeamsUpdate((teams) => {
                    if (this.listeners.onTeamsUpdate) {
                        this.listeners.onTeamsUpdate(teams);
                    }
                });
            }
        }, 100);
    }

    /**
     * Add team to lobby (Firebase)
     */
    async joinLobby(teamName) {
        if (!teamName || teamName.trim().length === 0) {
            return { success: false, message: 'Team name cannot be empty' };
        }

        // Check if game has already started
        if (await this.isGameStarted()) {
            return { success: false, message: 'Game already started. Entry closed.' };
        }

        // Use Firebase to add team
        const result = await window.firebaseDB.addTeamToLobby(teamName.trim());
        
        if (result.success) {
            // Store current team in localStorage for session persistence
            const teamData = { name: teamName.trim() };
            localStorage.setItem(this.STORAGE_KEYS.CURRENT_TEAM, JSON.stringify(teamData));
            
            console.log(`✅ Team "${teamName}" joined the lobby`);

            if (this.listeners.onTeamJoin) {
                this.listeners.onTeamJoin(teamData);
            }
        }

        return result;
    }

    /**
     * Get all teams in lobby (Firebase)
     */
    async getTeamsList() {
        if (!this.firebaseReady || typeof window.firebaseDB === 'undefined') {
            return [];
        }

        try {
            const snapshot = await firebase.database().ref('teams').once('value');
            if (snapshot.exists()) {
                return Object.keys(snapshot.val()).map(teamName => ({
                    name: teamName,
                    ...snapshot.val()[teamName]
                }));
            }
            return [];
        } catch (error) {
            console.error('❌ Error getting teams list:', error);
            return [];
        }
    }

    /**
     * Get current team
     */
    getCurrentTeam() {
        const teamJson = localStorage.getItem(this.STORAGE_KEYS.CURRENT_TEAM);
        return teamJson ? JSON.parse(teamJson) : null;
    }

    /**
     * Check if game has started (Firebase)
     */
    async isGameStarted() {
        if (!this.firebaseReady || typeof window.firebaseDB === 'undefined') {
            return false;
        }
        return await window.firebaseDB.isGameStarted();
    }

    /**
     * Admin: Start game (Firebase)
     */
    async startGame() {
        if (!this.firebaseReady || typeof window.firebaseDB === 'undefined') {
            console.error('❌ Firebase not ready');
            return;
        }

        const result = await window.firebaseDB.startGame();
        if (result.success) {
            const sessionId = Date.now().toString();
            sessionStorage.setItem('gameStarted', 'true');
            sessionStorage.setItem('gameSessionId', sessionId);
            console.log('🎮 Game started by admin');
        }
    }

    /**
     * Reset lobby (admin only) - Firebase
     */
    async resetLobby() {
        if (!this.firebaseReady || typeof window.firebaseDB === 'undefined') {
            console.error('❌ Firebase not ready');
            return;
        }

        await window.firebaseDB.resetLobby();
        localStorage.removeItem(this.STORAGE_KEYS.CURRENT_TEAM);
        localStorage.removeItem(this.STORAGE_KEYS.GAME_SESSION_ID);
        sessionStorage.removeItem('gameStarted');
        sessionStorage.removeItem('gameSessionId');
        
        console.log('🔄 Lobby has been reset');
    }

    /**
     * Store game session data when game starts
     */
    initializeGameSession() {
        sessionStorage.setItem('gameStarted', 'true');
        const sessionId = localStorage.getItem(this.STORAGE_KEYS.GAME_SESSION_ID);
        if (sessionId) {
            sessionStorage.setItem('gameSessionId', sessionId);
        }
    }

    /**
     * Get game session data
     */
    getGameSession() {
        return {
            isStarted: sessionStorage.getItem('gameStarted') === 'true',
            sessionId: sessionStorage.getItem('gameSessionId')
        };
    }

    /**
     * Restore game session on page reload
     */
    restoreSession() {
        const session = this.getGameSession();
        return session.isStarted;
    }

    /**
     * 9️⃣ Restore player progress on page refresh
     */
    async restorePlayerProgress(teamName) {
        if (!this.firebaseReady || typeof window.firebaseDB === 'undefined') {
            return null;
        }
        return await window.firebaseDB.getPlayerProgress(teamName);
    }

    /**
     * Clear all game data (use with caution)
     */
    async clearAllData() {
        localStorage.clear();
        sessionStorage.clear();
        if (this.firebaseReady && typeof window.firebaseDB !== 'undefined') {
            await window.firebaseDB.resetLobby();
        }
        console.log('🗑️ All game data cleared');
    }
}

// Create global lobby manager instance
const lobbyManager = new LobbyManager();
