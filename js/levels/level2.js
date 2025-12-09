export default {
    id: 'level-2',
    title: 'Food Flirt',
    description: 'Woo the AI... with snacks! 🍕',
    html: `
        <div class="game-container beveled-panel">
            <h3>Level 2: Food Rizz 🍔</h3>
            <p>Compare me to delicious food + be romantic!</p>
            <div class="sentiment-meter beveled-inset">
                <div id="l2-meter-fill" class="meter-fill"></div>
            </div>
            <textarea id="l2-input" class="beveled-input" placeholder="You're as sweet as chocolate cake..."></textarea>
            <p id="l2-feedback" class="feedback-text">I'm hungry for love... and snacks. 🤤</p>
            <button class="beveled-btn small" id="l2-back-btn">Back</button>
        </div>
    `,
    init: (levelManager) => {
        const input = document.getElementById('l2-input');
        const meter = document.getElementById('l2-meter-fill');
        const feedback = document.getElementById('l2-feedback');
        const backBtn = document.getElementById('l2-back-btn');

        // Food words that score points
        const foodWords = ['pizza', 'taco', 'burger', 'sushi', 'cheese', 'chocolate', 'cake', 'cookie',
            'spicy', 'sweet', 'donut', 'fries', 'noodle', 'ice cream', 'candy', 'brownie',
            'pancake', 'waffle', 'bacon', 'steak', 'pasta', 'ramen', 'curry', 'biryani'];

        // Positive/romantic words for built-in sentiment
        const positiveWords = ['love', 'beautiful', 'amazing', 'wonderful', 'gorgeous', 'delicious',
            'sweet', 'tasty', 'hot', 'sexy', 'cute', 'lovely', 'perfect', 'best',
            'incredible', 'yummy', 'divine', 'heavenly', 'irresistible', 'stunning',
            'fantastic', 'gorgeous', 'magnificent', 'adore', 'dream', 'angel'];

        backBtn.onclick = () => levelManager.loadMenu();

        input.oninput = () => {
            const inputLower = input.value.toLowerCase();

            // Count food words found
            const foodCount = foodWords.filter(word => inputLower.includes(word)).length;

            // Count positive words (simple sentiment)
            const positiveCount = positiveWords.filter(word => inputLower.includes(word)).length;

            // Check if has food
            const hasFood = foodCount > 0;

            if (!hasFood) {
                feedback.innerText = "Boring! Compare me to FOOD! 🙄";
                feedback.style.color = "#a3b1c6";
                meter.style.width = '5%';
                return;
            }

            // Score: Food words + positive words combined
            let score = (foodCount * 20) + (positiveCount * 15);
            let width = Math.min(score, 100);
            meter.style.width = `${width}%`;

            if (width >= 80) {
                feedback.innerText = "🔥 MAXIMUM FOOD RIZZ! YOU WIN! 🔥";
                feedback.style.color = "#39ff14";
                input.disabled = true;
                setTimeout(() => levelManager.completeLevel('level-2'), 1000);
            } else if (width >= 60) {
                feedback.innerText = "OH YES! Almost there! More food love! 😍";
                feedback.style.color = "#00ffff";
            } else if (width >= 40) {
                feedback.innerText = "Mmm getting tasty! Keep going! 😋";
                feedback.style.color = "#ffff00";
            } else if (width >= 20) {
                feedback.innerText = "I see food... but be more romantic!";
                feedback.style.color = "#fdcb6e";
            } else {
                feedback.innerText = "Is that all? I'm still hungry... 😢";
                feedback.style.color = "#888";
            }
        };
    },
    cleanup: () => { }
};
