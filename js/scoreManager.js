/**
 * ScoreManager - Handles scoring, stars, and persistence for Silly Games
 */
export class ScoreManager {
    constructor() {
        this.STORAGE_KEY = 'silly_games_scores';
        this.scores = this.load();
    }

    /**
     * Load scores from localStorage
     */
    load() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.warn('ScoreManager: Failed to parse scores');
            }
        }
        return {
            totalPoints: 0,
            levels: {} // { levelId: { stars: 1-3, points: number, bestTime: ms } }
        };
    }

    /**
     * Save scores to localStorage
     */
    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.scores));
    }

    /**
     * Record level completion with scoring
     * @param {string} levelId - Level identifier
     * @param {number} timeMs - Time taken in milliseconds
     * @param {number} basePoints - Base points for the level (default 100)
     * @returns {object} - { stars, points, isNewHighScore }
     */
    completeLevel(levelId, timeMs = 0, basePoints = 100) {
        // Calculate stars based on time (faster = more stars)
        // Under 10s = 3 stars, under 30s = 2 stars, else 1 star
        let stars = 1;
        if (timeMs > 0) {
            if (timeMs < 10000) stars = 3;
            else if (timeMs < 30000) stars = 2;
        } else {
            // No time tracking = default 2 stars for completion
            stars = 2;
        }

        // Calculate points: base + time bonus
        let points = basePoints;
        if (timeMs > 0 && timeMs < 60000) {
            // Bonus for speed: up to 100 extra points
            const timeBonus = Math.floor((60000 - timeMs) / 600);
            points += Math.min(timeBonus, 100);
        }

        // Star bonus
        points += (stars - 1) * 25;

        // Check if this is a new high score for this level
        const existing = this.scores.levels[levelId];
        let isNewHighScore = false;

        if (!existing || points > existing.points) {
            isNewHighScore = true;
            this.scores.levels[levelId] = { stars, points, bestTime: timeMs };

            // Update total points (replace old points if improving)
            if (existing) {
                this.scores.totalPoints = this.scores.totalPoints - existing.points + points;
            } else {
                this.scores.totalPoints += points;
            }

            this.save();
        }

        return {
            stars,
            points,
            isNewHighScore,
            totalStars: this.getTotalStars(),
            totalPoints: this.scores.totalPoints
        };
    }

    /**
     * Get total stars earned across all levels
     */
    getTotalStars() {
        return Object.values(this.scores.levels).reduce((sum, l) => sum + l.stars, 0);
    }

    /**
     * Get stats for a specific level
     */
    getLevelStats(levelId) {
        return this.scores.levels[levelId] || null;
    }

    /**
     * Get overall stats
     */
    getOverallStats() {
        const levelCount = Object.keys(this.scores.levels).length;
        return {
            totalPoints: this.scores.totalPoints,
            totalStars: this.getTotalStars(),
            levelsCompleted: levelCount,
            maxPossibleStars: levelCount * 3
        };
    }

    /**
     * Reset all scores
     */
    reset() {
        this.scores = { totalPoints: 0, levels: {} };
        this.save();
    }
}
