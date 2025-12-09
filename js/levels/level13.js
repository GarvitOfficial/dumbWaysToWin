export default {
    id: 'level-13',
    title: 'Catch the Glitch',
    description: 'Click the glitching target! 👾',
    html: `
        <div class="game-container beveled-panel" style="gap: 0.5rem;">
            <h3 style="margin: 0;">Level 13: Catch the Glitch 👾</h3>
            <p style="font-size: 0.6rem; margin: 0;">Click the glitching target 5 times!</p>
            <div class="canvas-wrapper beveled-inset" style="position: relative; cursor: crosshair;">
                <canvas id="l13-canvas" width="320" height="280"></canvas>
            </div>
            <p id="l13-msg" class="feedback-text" style="margin: 0;">Catches: 0/5</p>
            <button class="beveled-btn small" id="l13-back-btn">Back</button>
        </div>
    `,
    init: (levelManager) => {
        const canvas = document.getElementById('l13-canvas');
        const ctx = canvas.getContext('2d');
        const msg = document.getElementById('l13-msg');
        const backBtn = document.getElementById('l13-back-btn');

        let target = { x: 160, y: 140, size: 40 };
        let catches = 0;
        let animationId;
        let particles = [];
        let glitchOffset = { x: 0, y: 0 };
        let targetSpeed = 2;

        backBtn.onclick = () => {
            cancelAnimationFrame(animationId);
            levelManager.loadMenu();
        };

        // Click detection
        canvas.onclick = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            // Check if clicked on target
            const dist = Math.sqrt(
                Math.pow(clickX - target.x, 2) +
                Math.pow(clickY - target.y, 2)
            );

            if (dist < target.size) {
                catches++;
                msg.innerText = `Catches: ${catches}/5`;

                // Spawn particles
                for (let i = 0; i < 10; i++) {
                    particles.push({
                        x: target.x,
                        y: target.y,
                        vx: (Math.random() - 0.5) * 10,
                        vy: (Math.random() - 0.5) * 10,
                        life: 30,
                        color: ['#ff00ff', '#00ffff', '#39ff14', '#ffff00'][Math.floor(Math.random() * 4)]
                    });
                }

                // Teleport target
                target.x = Math.random() * (canvas.width - 80) + 40;
                target.y = Math.random() * (canvas.height - 80) + 40;

                // Increase difficulty
                targetSpeed += 0.5;

                if (catches >= 5) {
                    winGame();
                }
            } else {
                // Miss effect
                msg.innerText = `MISS! Catches: ${catches}/5`;
                msg.style.color = "#ff6b6b";
                setTimeout(() => {
                    msg.style.color = "#ffff00";
                }, 300);
            }
        };

        function update() {
            // Glitch movement
            glitchOffset.x = (Math.random() - 0.5) * 10;
            glitchOffset.y = (Math.random() - 0.5) * 10;

            // Random movement
            target.x += (Math.random() - 0.5) * targetSpeed;
            target.y += (Math.random() - 0.5) * targetSpeed;

            // Keep in bounds
            target.x = Math.max(40, Math.min(canvas.width - 40, target.x));
            target.y = Math.max(40, Math.min(canvas.height - 40, target.y));

            // Update particles
            particles = particles.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life--;
                return p.life > 0;
            });
        }

        function draw() {
            // Glitchy background
            ctx.fillStyle = "#0a0a1a";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Scanlines
            ctx.fillStyle = "rgba(255,255,255,0.02)";
            for (let y = 0; y < canvas.height; y += 4) {
                ctx.fillRect(0, y, canvas.width, 2);
            }

            // Random glitch bars
            if (Math.random() > 0.9) {
                ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '255,0,255' : '0,255,255'}, 0.3)`;
                const y = Math.random() * canvas.height;
                ctx.fillRect(0, y, canvas.width, Math.random() * 20);
            }

            // Draw particles
            particles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life / 30;
                ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
            });
            ctx.globalAlpha = 1;

            // Draw glitchy target
            // RGB split effect
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            ctx.beginPath();
            ctx.arc(target.x + glitchOffset.x - 3, target.y, target.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
            ctx.beginPath();
            ctx.arc(target.x + glitchOffset.x, target.y + glitchOffset.y, target.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
            ctx.beginPath();
            ctx.arc(target.x + 3, target.y + glitchOffset.y, target.size, 0, Math.PI * 2);
            ctx.fill();

            // Main target
            ctx.fillStyle = "#ff00ff";
            ctx.shadowColor = "#ff00ff";
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(target.x, target.y, target.size * 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Target face
            ctx.fillStyle = "#000";
            ctx.font = "24px Arial";
            ctx.textAlign = "center";
            ctx.fillText("👾", target.x, target.y + 8);

            // Crosshair cursor guide
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(target.x, 0);
            ctx.lineTo(target.x, canvas.height);
            ctx.moveTo(0, target.y);
            ctx.lineTo(canvas.width, target.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        function gameLoop() {
            update();
            draw();
            animationId = requestAnimationFrame(gameLoop);
        }

        function winGame() {
            cancelAnimationFrame(animationId);
            msg.innerText = "🎮 GLITCH HUNTER! 🎮";
            msg.style.color = "#39ff14";

            ctx.fillStyle = "rgba(0,0,0,0.8)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#39ff14";
            ctx.font = "bold 20px Arial";
            ctx.textAlign = "center";
            ctx.fillText("👾 GLITCH CAUGHT! 👾", canvas.width / 2, canvas.height / 2);

            setTimeout(() => levelManager.completeLevel('level-13'), 1500);
        }

        gameLoop();
    },
    cleanup: () => { }
};
