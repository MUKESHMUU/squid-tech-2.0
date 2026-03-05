// ==========================================
// SQUID TECH: Firebase Database Operations
// ==========================================

class FirebaseDB {
    constructor() {
        this.MAX_TEAMS = 200;
        this.db = firebase.database();
        this.listeners = {};
        console.log('✅ FirebaseDB initialized');
    }

    /**
     * 1️⃣ ADD TEAM TO LOBBY
     */
    async addTeamToLobby(teamName) {
        try {
            const teamRef = this.db.ref(`teams/${teamName}`);
            const snapshot = await teamRef.once('value');
            
            // Check if team already exists
            if (snapshot.exists()) {
                return { success: false, message: 'Team name already exists' };
            }

            // Get total teams count
            const teamsRef = this.db.ref('teams');
            const teamsSnapshot = await teamsRef.once('value');
            const teamsCount = teamsSnapshot.exists() ? Object.keys(teamsSnapshot.val()).length : 0;

            if (teamsCount >= this.MAX_TEAMS) {
                return { success: false, message: `Lobby is full. Maximum ${this.MAX_TEAMS} teams allowed.` };
            }

            // Add team to Firebase
            await teamRef.set({
                name: teamName,
                joinedAt: firebase.database.ServerValue.TIMESTAMP,
                status: 'waiting'
            });

            console.log(`✅ Team "${teamName}" added to Firebase`);
            return { success: true, teamName };
        } catch (error) {
            console.error('❌ Error adding team:', error);
            return { success: false, message: 'Error joining lobby' };
        }
    }

    /**
     * 2️⃣ GET TEAMS COUNT
     */
    async getTeamsCount() {
        try {
            const snapshot = await this.db.ref('teams').once('value');
            return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
        } catch (error) {
            console.error('❌ Error getting teams count:', error);
            return 0;
        }
    }

    /**
     * LISTEN TO TEAMS LIST (Real-time updates)
     */
    onTeamsUpdate(callback) {
        const teamsRef = this.db.ref('teams');
        teamsRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                const teams = Object.keys(snapshot.val()).map(teamName => ({
                    name: teamName,
                    ...snapshot.val()[teamName]
                }));
                callback(teams);
            } else {
                callback([]);
            }
        });

        // Store listener for cleanup
        this.listeners.teams = teamsRef;
    }

    /**
     * 4️⃣ START GAME (Admin)
     */
    async startGame() {
        try {
            await this.db.ref('game/started').set(true);
            await this.db.ref('game/startedAt').set(firebase.database.ServerValue.TIMESTAMP);
            console.log('✅ Game started in Firebase');
            return { success: true };
        } catch (error) {
            console.error('❌ Error starting game:', error);
            return { success: false };
        }
    }

    /**
     * 5️⃣ LISTEN TO GAME START
     */
    onGameStart(callback) {
        const gameRef = this.db.ref('game/started');
        gameRef.on('value', (snapshot) => {
            const isStarted = snapshot.val() === true;
            callback(isStarted);
        });

        this.listeners.gameStart = gameRef;
    }

    /**
     * CHECK IF GAME STARTED
     */
    async isGameStarted() {
        try {
            const snapshot = await this.db.ref('game/started').once('value');
            return snapshot.val() === true;
        } catch (error) {
            console.error('❌ Error checking game status:', error);
            return false;
        }
    }

    /**
     * 6️⃣ UPDATE PLAYER PROGRESS
     */
    async updatePlayerProgress(teamName, round, score, elapsedTime) {
        try {
            const playerData = {
                round,
                score,
                time: elapsedTime,
                lastUpdate: firebase.database.ServerValue.TIMESTAMP
            };

            // Update player progress
            await this.db.ref(`players/${teamName}`).set(playerData);

            // Update leaderboard
            await this.updateLeaderboard(teamName, score, elapsedTime);

            console.log(`✅ Player progress updated: ${teamName} - Round ${round}, Score ${score}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating player progress:', error);
            return { success: false };
        }
    }

    /**
     * 7️⃣ UPDATE LEADERBOARD
     */
    async updateLeaderboard(teamName, score, time) {
        try {
            await this.db.ref(`leaderboard/${teamName}`).set({
                score,
                time,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            });
        } catch (error) {
            console.error('❌ Error updating leaderboard:', error);
        }
    }

    /**
     * 8️⃣ GET LEADERBOARD (Sorted)
     */
    async getLeaderboard() {
        try {
            const snapshot = await this.db.ref('leaderboard').once('value');
            
            if (!snapshot.exists()) {
                return [];
            }

            const leaderboard = Object.keys(snapshot.val()).map(teamName => ({
                teamName,
                ...snapshot.val()[teamName]
            }));

            // Sort: Higher score first, if equal then lower time first
            leaderboard.sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                return a.time - b.time;
            });

            return leaderboard;
        } catch (error) {
            console.error('❌ Error getting leaderboard:', error);
            return [];
        }
    }

    /**
     * LISTEN TO LEADERBOARD (Real-time)
     */
    onLeaderboardUpdate(callback) {
        const leaderboardRef = this.db.ref('leaderboard');
        leaderboardRef.on('value', async (snapshot) => {
            const leaderboard = await this.getLeaderboard();
            callback(leaderboard);
        });

        this.listeners.leaderboard = leaderboardRef;
    }

    /**
     * 9️⃣ GET PLAYER PROGRESS (For refresh recovery)
     */
    async getPlayerProgress(teamName) {
        try {
            const snapshot = await this.db.ref(`players/${teamName}`).once('value');
            return snapshot.exists() ? snapshot.val() : null;
        } catch (error) {
            console.error('❌ Error getting player progress:', error);
            return null;
        }
    }

    /**
     * RESET LOBBY (Admin)
     */
    async resetLobby() {
        try {
            await this.db.ref('teams').remove();
            await this.db.ref('players').remove();
            await this.db.ref('leaderboard').remove();
            await this.db.ref('game').remove();
            console.log('✅ Lobby reset in Firebase');
            return { success: true };
        } catch (error) {
            console.error('❌ Error resetting lobby:', error);
            return { success: false };
        }
    }

    /**
     * REMOVE ALL LISTENERS
     */
    removeAllListeners() {
        Object.values(this.listeners).forEach(ref => {
            if (ref) ref.off();
        });
        this.listeners = {};
        console.log('✅ All Firebase listeners removed');
    }
}

// Create global Firebase DB instance
window.firebaseDB = new FirebaseDB();
