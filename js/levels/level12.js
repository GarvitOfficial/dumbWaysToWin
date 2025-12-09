export default {
    id: 'level-12',
    title: 'Gravity Flip',
    description: 'Tap to flip gravity! 🔄',
    html: `
        <div class="game-container beveled-panel" style="gap: 0.5rem;">
            <h3 style="margin: 0;">Level 12: Gravity Flip 🔄</h3>
            <p style="font-size: 0.6rem; margin: 0;">TAP/CLICK to flip gravity! Reach the goal!</p>
            <div class="canvas-wrapper beveled-inset">
                <canvas id="l12-canvas" width="320" height="300"></canvas>
            </div>
            <p id="l12-msg" class="feedback-text" style="margin: 0;">Click anywhere to flip!</p>
            <button class="beveled-btn small" id="l12-back-btn">Back</button>
        </div>
    `,
    init: (levelManager) => {
        const canvas = document.getElementById('l12-canvas');
        const ctx = canvas.getContext('2d');
        const msg = document.getElementById('l12-msg');
        const backBtn = document.getElementById('l12-back-btn');

        // Game state
        let ball = { x: 40, y: 150, radius: 12, vy: 0 };
        let gravity = 0.3;
        let gravityDir = 1; // 1 = down, -1 = up
        let platforms = [];
        let goal = { x: 280, y: 30, width: 30, height: 30 };
        let animationId;
        let won = false;

        // Create platforms
        function createLevel() {
            platforms = [
                { x: 0, y: 280, width: 100, height: 20 },    // Bottom left
                { x: 100, y: 200, width: 80, height: 15 },   // Middle
                { x: 200, y: 120, width: 80, height: 15 },   // Upper middle
                { x: 0, y: 50, width: 100, height: 15 },     // Top left
                { x: 220, y: 280, width: 100, height: 20 },  // Bottom right
            ];
        }

        backBtn.onclick = () => {
            cancelAnimationFrame(animationId);
            levelManager.loadMenu();
        };

        // Flip gravity on click/tap
        canvas.onclick = () => {
            if (won) return;
            gravityDir *= -1;
            // Visual feedback
            msg.innerText = gravityDir > 0 ? "⬇️ Gravity DOWN!" : "⬆️ Gravity UP!";
            msg.style.color = gravityDir > 0 ? "#ff6b6b" : "#00ffff";
        };

        function update() {
            if (won) return;

            // Apply gravity
            ball.vy += gravity * gravityDir;
            ball.vy = Math.max(-8, Math.min(8, ball.vy)); // Cap velocity
            ball.y += ball.vy;

            // Move right slowly
            ball.x += 0.5;

            // Platform collision
            platforms.forEach(p => {
                if (ball.x + ball.radius > p.x && ball.x - ball.radius < p.x + p.width) {
                    // Landing on top
                    if (gravityDir > 0 && ball.y + ball.radius > p.y && ball.y + ball.radius < p.y + p.height + 10) {
                        ball.y = p.y - ball.radius;
                        ball.vy = 0;
                    }
                    // Hitting from bottom (when gravity up)
                    if (gravityDir < 0 && ball.y - ball.radius < p.y + p.height && ball.y - ball.radius > p.y - 10) {
                        ball.y = p.y + p.height + ball.radius;
                        ball.vy = 0;
                    }
                }
            });

            // Ceiling/Floor bounds
            if (ball.y - ball.radius < 0) {
                ball.y = ball.radius;
                ball.vy = 0;
            }
            if (ball.y + ball.radius > canvas.height) {
                ball.y = canvas.height - ball.radius;
                ball.vy = 0;
            }

            // Win condition
            if (ball.x + ball.radius > goal.x &&
                ball.y > goal.y && ball.y < goal.y + goal.height) {
                winGame();
            }

            // Reset if ball goes off screen
            if (ball.x > canvas.width + 50) {
                ball.x = 40;
                ball.y = 150;
                ball.vy = 0;
            }
        }

        function draw() {
            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, gravityDir < 0 ? "#1a1a4e" : "#0a0a2e");
            gradient.addColorStop(1, gravityDir < 0 ? "#0a0a2e" : "#1a1a4e");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Platforms
            ctx.fillStyle = "#4a4a6a";
            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 5;
            platforms.forEach(p => {
                ctx.fillRect(p.x, p.y, p.width, p.height);
            });
            ctx.shadowBlur = 0;

            // Goal (pulsing)
            const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(57, 255, 20, ${pulse})`;
            ctx.shadowColor = "#39ff14";
            ctx.shadowBlur = 20;
            ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
            ctx.fillStyle = "#fff";
            ctx.font = "16px Arial";
            ctx.fillText("🎯", goal.x + 5, goal.y + 22);
            ctx.shadowBlur = 0;

            // Ball with trail effect
            ctx.fillStyle = "rgba(255, 100, 100, 0.3)";
            ctx.beginPath();
            ctx.arc(ball.x - ball.vy * 2, ball.y - ball.vy, ball.radius * 0.7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ff6b6b";
            ctx.shadowColor = "#ff6b6b";
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Gravity indicator
            ctx.fillStyle = "#fff";
            ctx.font = "20px Arial";
            ctx.fillText(gravityDir > 0 ? "⬇️" : "⬆️", 10, 25);
        }

        function gameLoop() {
            update();
            draw();
            animationId = requestAnimationFrame(gameLoop);
        }

        function winGame() {
            won = true;
            cancelAnimationFrame(animationId);
            msg.innerText = "🎉 GRAVITY MASTER! 🎉";
            msg.style.color = "#39ff14";

            // Draw win screen
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#39ff14";
            ctx.font = "bold 24px Arial";
            ctx.textAlign = "center";
            ctx.fillText("YOU WIN!", canvas.width / 2, canvas.height / 2);

            setTimeout(() => levelManager.completeLevel('level-12'), 1500);
        }

        createLevel();
        gameLoop();
    },
    cleanup: () => { }
};
