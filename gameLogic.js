// ==========================================
// SQUID TECH: Code to Survive - Game Logic
// ==========================================

/**
 * Private Score Manager using Closure
 * Prevents score manipulation via browser console
 */
function createScoreManager() {
    let internalScore = 0;

    return {
        getScore: function() {
            return internalScore;
        },
        addPoints: function(points) {
            internalScore = Math.max(0, internalScore + points);
            return internalScore;
        },
        subtractPoints: function(points) {
            internalScore = Math.max(0, internalScore - points);
            return internalScore;
        },
        reset: function() {
            internalScore = 0;
            return internalScore;
        }
    };
}

class SquidGameController {
    constructor() {
        // Game State
        this.gameStarted = false;
        this.gameOver = false;
        this.currentRoundIndex = 0;
        this.currentPhase = null; // 'green' or 'red'
        this.scoreManager = createScoreManager(); // Private score using closure
        this.roundResponses = [];
        this.answerSubmittedTime = null;
        this.roundStartTime = null;
        this.greenLightEndTime = null;
        this.selectedOption = null;
        this.answerLocked = false;
        this.teamName = null; // For lobby

        // Timers
        this.overallStartTime = null;
        this.phaseTimerInterval = null;
        this.phaseAutoAdvanceTimeout = null;
        this.greenLightDuration = 0;
        this.redLightDuration = 30; // Fixed 30 seconds
        this.overallTimerInterval = null;

        // UI References
        this.dom = {
            startBtn: document.getElementById('startBtn'),
            scenarioBox: document.getElementById('scenarioBox'),
            questionBox: document.getElementById('questionBox'),
            answerSection: document.getElementById('answerSection'),
            startSection: document.getElementById('startSection'),
            gameOver: document.getElementById('gameOver'),
            gameContainer: document.querySelector('.game-container'),
            phaseLight: document.querySelector('.phase-light'),
            phaseText: document.getElementById('phaseText'),
            timerText: document.getElementById('timerText'),
            timerProgress: document.getElementById('timerProgress'),
            currentRound: document.getElementById('currentRound'),
            currentScore: document.getElementById('currentScore'),
            totalTime: document.getElementById('totalTime'),
            scenarioText: document.getElementById('scenarioText'),
            questionText: document.getElementById('questionText'),
            submissionStatus: document.getElementById('submissionStatus'),
            finalScore: document.getElementById('finalScore'),
            finalTime: document.getElementById('finalTime'),
            mcqContainer: document.querySelector('.mcq-container')
        };

        this.attachEventListeners();
    }

    attachEventListeners() {
        this.dom.startBtn.addEventListener('click', () => this.startGame());
        
        // MCQ option listeners
        document.querySelectorAll('.mcq-option').forEach((btn, index) => {
            btn.addEventListener('click', () => this.selectOption(index));
        });
    }

    startGame() {
        console.log('🎮 Game Started!');
        
        // Load team name from lobby
        const currentTeam = lobbyManager.getCurrentTeam();
        this.teamName = currentTeam ? currentTeam.name : 'Anonymous';
        
        // Update team display in header
        const teamDisplay = document.getElementById('teamDisplay');
        const headerTeamName = document.getElementById('headerTeamName');
        if (teamDisplay && headerTeamName) {
            headerTeamName.textContent = this.teamName;
            teamDisplay.style.display = 'block';
        }
        
        // Initialize session and activate security
        lobbyManager.initializeGameSession();
        securityManager.activateDuringGame();
        
        this.gameStarted = true;
        this.gameOver = false;
        this.currentRoundIndex = 0;
        this.scoreManager.reset();
        this.roundResponses = [];
        this.overallStartTime = Date.now();

        // Hide start section
        this.dom.startSection.style.display = 'none';
        this.dom.gameOver.style.display = 'none';

        // Remove any existing glow
        this.dom.gameContainer.classList.remove('green-glow', 'red-glow');

        // Start first round
        this.startRound();

        // Start overall game timer
        this.startOverallTimer();
    }

    startRound() {
        if (this.currentRoundIndex >= GAME_SCENARIOS.length) {
            this.endGame();
            return;
        }

        console.log(`📍 Starting Round ${this.currentRoundIndex + 1}`);
        this.roundStartTime = Date.now();
        this.answerSubmittedTime = null;
        this.selectedOption = null;
        this.answerLocked = false;
        this.dom.submissionStatus.textContent = '';
        this.dom.submissionStatus.className = '';

        // Update round display
        this.updateRoundDisplay();

        // Start Green Light
        this.startGreenLight();
    }

    startGreenLight() {
        this.currentPhase = 'green';
        console.log('🟢 Green Light Started');

        // Generate random duration between 10-45 seconds
        this.greenLightDuration = Math.floor(Math.random() * 36) + 10; // 10-45 seconds
        this.greenLightEndTime = Date.now() + (this.greenLightDuration * 1000);

        // Update UI
        this.updatePhaseIndicator('green');
        this.dom.scenarioBox.style.display = 'block';
        this.dom.questionBox.style.display = 'none';
        this.dom.answerSection.style.display = 'none';

        // Display scenario
        const scenario = GAME_SCENARIOS[this.currentRoundIndex];
        this.dom.scenarioText.textContent = scenario.scenario;

        // Start phase timer display
        this.startPhaseTimer('green', this.greenLightDuration);

        // Auto-switch to red light after duration
        clearTimeout(this.phaseAutoAdvanceTimeout);
        this.phaseAutoAdvanceTimeout = setTimeout(() => {
            this.startRedLight();
        }, this.greenLightDuration * 1000);
    }

    startRedLight() {
        this.currentPhase = 'red';
        console.log('🔴 Red Light Started');
        this.answerLocked = false;
        this.selectedOption = null;

        // Stop green timer
        clearInterval(this.phaseTimerInterval);
        clearTimeout(this.phaseAutoAdvanceTimeout);

        // Update UI
        this.updatePhaseIndicator('red');
        this.dom.scenarioBox.style.display = 'none';
        this.dom.questionBox.style.display = 'block';
        this.dom.answerSection.style.display = 'flex';

        // Display question
        const scenario = GAME_SCENARIOS[this.currentRoundIndex];
        this.dom.questionText.textContent = scenario.question;

        // Setup MCQ options
        this.setupMCQOptions(scenario);

        // Record red light start time
        this.greenLightEndTime = Date.now();

        // Start phase timer display
        this.startPhaseTimer('red', this.redLightDuration);

        // Auto-advance to next round after 30 seconds
        clearTimeout(this.phaseAutoAdvanceTimeout);
        this.phaseAutoAdvanceTimeout = setTimeout(() => {
            this.endRedLight();
        }, this.redLightDuration * 1000);
    }

    setupMCQOptions(scenario) {
        const options = document.querySelectorAll('.mcq-option');
        options.forEach((btn, index) => {
            btn.textContent = scenario.options[index];
            btn.classList.remove('selected', 'correct', 'incorrect', 'disabled');
            btn.disabled = false;
            btn.dataset.optionIndex = index;
        });
    }

    startPhaseTimer(phase, duration) {
        // Clear existing timer
        if (this.phaseTimerInterval) {
            clearInterval(this.phaseTimerInterval);
        }

        let elapsed = 0;
        const startTime = Date.now();
        const totalCircumference = 282.7;

        const updateTimer = () => {
            elapsed = (Date.now() - startTime) / 1000;

            if (elapsed >= duration) {
                elapsed = duration;
            }

            // Update timer display
            const displaySeconds = Math.max(0, duration - elapsed);
            const minutes = Math.floor(displaySeconds / 60);
            const seconds = Math.floor(displaySeconds % 60);
            this.dom.timerText.textContent = 
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            // Update progress circle
            const progress = elapsed / duration;
            const offset = totalCircumference * (1 - progress);
            this.dom.timerProgress.style.strokeDashoffset = offset;

            // Update circle color
            if (phase === 'green') {
                this.dom.timerProgress.classList.add('green');
                this.dom.timerProgress.classList.remove('red');
            } else {
                this.dom.timerProgress.classList.remove('green');
                this.dom.timerProgress.classList.add('red');
            }
        };

        // Initial update
        updateTimer();

        // Set interval for continuous update
        this.phaseTimerInterval = setInterval(() => {
            if (Date.now() - startTime >= duration * 1000) {
                clearInterval(this.phaseTimerInterval);
            } else {
                updateTimer();
            }
        }, 100);
    }

    startOverallTimer() {
        if (this.overallTimerInterval) {
            clearInterval(this.overallTimerInterval);
        }

        this.overallTimerInterval = setInterval(() => {
            if (this.gameStarted && !this.gameOver) {
                const elapsed = Math.floor((Date.now() - this.overallStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                this.dom.totalTime.textContent = 
                    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        }, 100);
    }

    selectOption(optionIndex) {
        if (this.answerLocked || this.currentPhase !== 'red') {
            return;
        }

        this.selectedOption = optionIndex;
        const options = document.querySelectorAll('.mcq-option');
        options.forEach((btn, index) => {
            btn.classList.remove('selected');
            if (index === optionIndex) {
                btn.classList.add('selected');
            }
        });

        // Auto-submit on selection
        this.submitAnswer();
    }

    submitAnswer() {
        if (this.selectedOption === null || this.answerLocked) {
            console.log('⚠️ No answer selected or already submitted');
            return;
        }

        this.answerLocked = true;

        // Calculate submission time (from red light start)
        const submissionTime = (Date.now() - this.greenLightEndTime) / 1000;
        const scenario = GAME_SCENARIOS[this.currentRoundIndex];

        // Validate answer
        const isCorrect = this.selectedOption === scenario.correctAnswer;

        // Calculate score change
        const scoreChange = this.calculateScore(isCorrect, submissionTime);

        // Update score using private manager
        let newScore = this.scoreManager.getScore() + scoreChange;
        newScore = Math.max(0, newScore); // No negative scores
        
        // Apply the score change
        if (scoreChange >= 0) {
            this.scoreManager.addPoints(scoreChange);
        } else {
            this.scoreManager.subtractPoints(Math.abs(scoreChange));
        }
        const currentScore = this.scoreManager.getScore();

        // Show feedback
        this.showFeedback(isCorrect, submissionTime, scoreChange, scenario, currentScore);

        // Record response
        this.roundResponses.push({
            roundIndex: this.currentRoundIndex,
            userOption: this.selectedOption,
            correctOption: scenario.correctAnswer,
            isCorrect,
            submissionTime,
            scoreChange,
            scoreAfter: currentScore
        });

        // Disable further interactions
        this.disableMCQOptions();

        // Stop red light timer
        clearInterval(this.phaseTimerInterval);
        clearTimeout(this.phaseAutoAdvanceTimeout);

        // Advance after brief delay for feedback
        setTimeout(() => {
            this.advanceToNextRound();
        }, 2000);
    }

    calculateScore(isCorrect, submissionTime) {
        // Validation: ensure submissionTime is a number
        if (isNaN(submissionTime)) {
            submissionTime = 0;
        }
        
        const currentScore = this.scoreManager.getScore();
        
        if (!isCorrect) {
            // Wrong answer penalty
            if (currentScore >= 200) {
                return -200; // Reduce by 200 points
            } else if (currentScore === 0) {
                return 0; // Stays at 0
            } else {
                return -currentScore; // Reduce to 0
            }
        }

        // Correct answer scoring
        if (submissionTime <= 15) {
            return 1500; // 1500 points for fast answer
        } else if (submissionTime <= 30) {
            return 1300; // 1300 points for slower answer
        }

        return 0; // Should not reach (red light is 30 seconds max)
    }

    showFeedback(isCorrect, submissionTime, scoreChange, scenario, currentScore) {
        const statusEl = this.dom.submissionStatus;
        const options = document.querySelectorAll('.mcq-option');

        // Show correct/incorrect on options
        options.forEach((btn, index) => {
            if (index === scenario.correctAnswer) {
                btn.classList.add('correct');
            } else if (index === this.selectedOption && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        if (isCorrect) {
            statusEl.className = 'success';
            const pointsText = scoreChange >= 1500 ? '1500 points ⚡' : '1300 points ✓';
            statusEl.innerHTML = `
                <div style="font-size: 1.2em; margin-bottom: 8px;">✅ Correct!</div>
                <div style="font-size: 0.95em;">+${pointsText}</div>
                <div style="font-size: 0.85em; margin-top: 5px;">Time: ${submissionTime.toFixed(1)}s | Total Score: ${currentScore}</div>
            `;
        } else {
            statusEl.className = 'error';
            const penalty = scoreChange < 0 ? Math.abs(scoreChange) : 0;
            statusEl.innerHTML = `
                <div style="font-size: 1.2em; margin-bottom: 8px;">❌ Incorrect</div>
                <div style="font-size: 0.9em;">Correct answer: ${scenario.options[scenario.correctAnswer]}</div>
                <div style="font-size: 0.85em; margin-top: 5px;">${penalty > 0 ? `-${penalty} points` : 'No penalty'} | Total Score: ${currentScore}</div>
            `;
        }

        this.updateScoreDisplay();
    }

    disableMCQOptions() {
        const options = document.querySelectorAll('.mcq-option');
        options.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
        });
    }

    endRedLight() {
        if (!this.answerLocked && this.currentPhase === 'red') {
            console.log('🔴 Red Light Expired - No Answer Submitted');
            this.answerLocked = true;
            
            // Apply -100 point penalty for no answer
            const currentScore = this.scoreManager.getScore();
            let scoreAfter = currentScore;
            
            if (currentScore >= 100) {
                this.scoreManager.subtractPoints(100);
                scoreAfter = this.scoreManager.getScore();
            } else if (currentScore > 0) {
                this.scoreManager.reset();
                scoreAfter = 0;
            }
            
            this.dom.submissionStatus.className = 'error';
            this.dom.submissionStatus.innerHTML = `
                <div style="font-size: 1.2em;">⏱️ Time's Up! No Answer</div>
                <div style="font-size: 0.9em;">-100 points penalty</div>
                <div style="font-size: 0.85em; margin-top: 5px;">Total Score: ${scoreAfter}</div>
            `;

            this.updateScoreDisplay();
            this.disableMCQOptions();
            
            // Record no answer response
            const scenario = GAME_SCENARIOS[this.currentRoundIndex];
            this.roundResponses.push({
                roundIndex: this.currentRoundIndex,
                userOption: null,
                correctOption: scenario.correctAnswer,
                isCorrect: false,
                submissionTime: this.redLightDuration,
                scoreChange: -Math.min(100, currentScore),
                scoreAfter: scoreAfter
            });
            
            // Advance after brief delay
            setTimeout(() => {
                this.advanceToNextRound();
            }, 2000);
        }
    }

    advanceToNextRound() {
        console.log(`✅ Round ${this.currentRoundIndex + 1} Complete`);
        this.currentRoundIndex++;

        // Update player progress to Firebase
        if (this.teamName && typeof firebaseDB !== 'undefined') {
            const elapsedSeconds = Math.floor((Date.now() - this.overallStartTime) / 1000);
            firebaseDB.updatePlayerProgress(
                this.teamName,
                this.currentRoundIndex,
                this.scoreManager.getScore(),
                elapsedSeconds
            ).catch(error => console.error('💾 Firebase update error:', error));
        }

        if (this.currentRoundIndex < GAME_SCENARIOS.length) {
            this.startRound();
        } else {
            this.endGame();
        }
    }

    /**
     * Restore game progress from Firebase after page refresh
     */
    restoreProgress(progressData) {
        if (!progressData) return false;

        try {
            this.currentRoundIndex = Math.min(progressData.round || 0, GAME_SCENARIOS.length - 1);
            
            // Restore score
            const currentScore = progressData.score || 0;
            this.scoreManager.reset();
            this.scoreManager.addPoints(currentScore);
            
            // Update display
            const scoreDisplay = document.getElementById('currentScore');
            if (scoreDisplay) {
                scoreDisplay.textContent = currentScore;
            }
            
            const roundDisplay = document.getElementById('currentRound');
            if (roundDisplay) {
                roundDisplay.textContent = this.currentRoundIndex + 1;
            }
            
            console.log(`✅ Progress restored: Round ${this.currentRoundIndex + 1}, Score ${currentScore}`);
            return true;
        } catch (error) {
            console.error('❌ Error restoring progress:', error);
            return false;
        }
    }

    /**
     * Apply penalty for cheating (tab switch, etc.)
     */
    applyPenalty(amount = 500) {
        this.scoreManager.subtractPoints(amount);
        const newScore = this.scoreManager.getScore();
        
        // Update score display
        const scoreDisplay = document.getElementById('currentScore');
        if (scoreDisplay) {
            scoreDisplay.textContent = newScore;
        }
        
        // Log the penalty
        console.warn(`⚠️ Penalty applied: -${amount} points. New score: ${newScore}`);
    }

    endGame() {
        console.log('🏁 Game Over!');
        
        // Deactivate security and end session
        securityManager.deactivateAfterGame();
        lobbyManager.endGameSession();
        
        this.gameOver = true;
        this.gameStarted = false;

        // Stop all timers
        clearInterval(this.phaseTimerInterval);
        clearTimeout(this.phaseAutoAdvanceTimeout);
        clearInterval(this.overallTimerInterval);

        // Calculate final stats
        const elapsedSeconds = Math.floor((Date.now() - this.overallStartTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;

        // Get final score
        const finalScore = this.scoreManager.getScore();

        // Update Firebase with final stats
        if (this.teamName && typeof firebaseDB !== 'undefined') {
            firebaseDB.updatePlayerProgress(
                this.teamName,
                GAME_SCENARIOS.length, // All 30 rounds completed
                finalScore,
                elapsedSeconds
            ).catch(error => console.error('💾 Firebase final update error:', error));
        }

        // Update game over screen
        this.dom.finalScore.textContent = finalScore.toLocaleString();
        this.dom.finalTime.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Show game over screen
        this.dom.scenarioBox.style.display = 'none';
        this.dom.questionBox.style.display = 'none';
        this.dom.answerSection.style.display = 'none';
        this.dom.gameOver.style.display = 'block';
        this.dom.gameContainer.classList.remove('green-glow', 'red-glow');

        // Log summary
        console.log('=== GAME SUMMARY ===');
        console.log(`Team: ${this.teamName}`);
        console.log(`Final Score: ${finalScore}`);
        console.log(`Total Time: ${minutes}m ${seconds}s`);
        console.log(`Responses:`, this.roundResponses);
    }


    updatePhaseIndicator(phase) {
        this.dom.phaseLight.className = 'phase-light';
        
        if (phase === 'green') {
            this.dom.phaseLight.classList.add('green');
            this.dom.phaseText.textContent = '🟢 Green Light - Read Carefully!';
            this.dom.gameContainer.classList.remove('red-glow');
            this.dom.gameContainer.classList.add('green-glow');
        } else if (phase === 'red') {
            this.dom.phaseLight.classList.add('red');
            this.dom.phaseText.textContent = '🔴 Red Light - Answer Now!';
            this.dom.gameContainer.classList.remove('green-glow');
            this.dom.gameContainer.classList.add('red-glow');
        }
    }

    updateScoreDisplay() {
        this.dom.currentScore.textContent = this.scoreManager.getScore().toLocaleString();
    }

    updateRoundDisplay() {
        this.dom.currentRound.textContent = (this.currentRoundIndex + 1);
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if game session is active (from page refresh)
    const gameSession = lobbyManager.restoreSession();
    
    window.game = new SquidGameController();
    console.log('🎮 SQUID TECH: Code to Survive - Ready to play!');
    
    // If game was in progress, restore it
    if (gameSession && !window.game.gameStarted) {
        console.log('📂 Restoring game session...');
        // Auto-start if session exists
    }
});
