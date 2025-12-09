export default {
    id: 'level-1',
    title: 'Sentiment Flirt',
    description: 'Write a paragraph of love to win! 💕',
    html: `
        <div class="game-container beveled-panel">
            <h3>Level 1: Flirt to Win 💖</h3>
            <p>The AI is sad. Pour your heart out with kind words!</p>
            <div class="sentiment-meter beveled-inset">
                <div id="l1-meter-fill" class="meter-fill"></div>
            </div>
            <textarea id="l1-input" class="beveled-input" placeholder="You are beautiful, amazing, wonderful..."></textarea>
            <p id="l1-feedback" class="feedback-text">Waiting for kindness... 💔</p>
            <button class="beveled-btn small" id="l1-back-btn">Back</button>
        </div>
    `,
    init: (levelManager) => {
        const input = document.getElementById('l1-input');
        const meter = document.getElementById('l1-meter-fill');
        const feedback = document.getElementById('l1-feedback');
        const backBtn = document.getElementById('l1-back-btn');
        const WIN_THRESHOLD = 100; // Percentage to win

        // Built-in positive words for sentiment analysis (no external lib needed!)
        const positiveWords = [
            'love', 'beautiful', 'amazing', 'wonderful', 'gorgeous', 'perfect', 'incredible',
            'awesome', 'fantastic', 'brilliant', 'lovely', 'sweet', 'kind', 'caring', 'happy',
            'joy', 'adorable', 'cute', 'stunning', 'magnificent', 'excellent', 'great', 'best',
            'nice', 'good', 'angel', 'heaven', 'dream', 'blessing', 'treasure', 'precious',
            'heart', 'sunshine', 'star', 'sparkle', 'magical', 'special', 'unique', 'dear',
            'charming', 'delightful', 'graceful', 'radiant', 'glowing', 'warm', 'gentle',
            'pretty', 'handsome', 'attractive', 'captivating', 'enchanting', 'adore', 'cherish'
        ];

        const negativeWords = [
            'hate', 'ugly', 'terrible', 'horrible', 'bad', 'awful', 'disgusting', 'stupid',
            'dumb', 'idiot', 'fool', 'worst', 'evil', 'nasty', 'mean', 'cruel', 'angry'
        ];

        // Back Button
        backBtn.onclick = () => levelManager.loadMenu();

        // Use 'input' event for immediate real-time capture
        input.oninput = () => {
            const inputLower = input.value.toLowerCase();
            const words = inputLower.split(/\s+/);

            // Count positive and negative words
            let positiveCount = 0;
            let negativeCount = 0;

            words.forEach(word => {
                if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
                if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
            });

            // Calculate score: each positive word = 10 points, negative = -15 points
            let score = (positiveCount * 12) - (negativeCount * 20);
            let percentage = Math.max(0, Math.min(score, 100));

            meter.style.width = `${percentage}%`;

            // ARCADE FEEDBACK
            if (percentage >= 100) {
                feedback.innerText = "💖 MAXIMUM LOVE! YOU WIN! 💖";
                feedback.style.color = "#39ff14"; // Neon Green
                // DELAY WIN
                input.disabled = true;
                setTimeout(() => {
                    levelManager.completeLevel('level-1');
                }, 1000);
            } else if (percentage > 75) {
                feedback.innerText = "😍 COMBO! KEEP GOING!";
                feedback.style.color = "#00ffff"; // Neon Blue
            } else if (percentage > 50) {
                feedback.innerText = "🔥 HEATING UP!";
                feedback.style.color = "#ffff00"; // Neon Yellow
            } else if (percentage > 25) {
                feedback.innerText = "✨ GOOD START...";
                feedback.style.color = "#ff00ff"; // Neon Pink
            } else if (negativeCount > 0) {
                feedback.innerText = "😠 CRITICAL ERROR: RUDE!";
                feedback.style.color = "red";
            } else {
                feedback.innerText = "💭 INSERT KINDNESS...";
                feedback.style.color = "#aaa";
            }
        };
    },
    cleanup: () => {
        // No special cleanup needed for pure DOM events attached to elements that get removed
    }
};
