export default {
    id: 'level-15',
    title: 'Grand Finale',
    description: 'The Ultimate Celebration! 🎉',
    html: `
        <div class="game-container beveled-panel" style="gap: 0.5rem; overflow: hidden;">
            <canvas id="l15-canvas" width="320" height="400" style="position: absolute; top: 0; left: 0; pointer-events: none;"></canvas>
            <h3 style="margin: 0; color: #39ff14; animation: pulse 0.5s infinite;">🏆 CONGRATULATIONS! 🏆</h3>
            <div style="font-size: 3rem; animation: bounce 0.5s infinite;">🎮</div>
            <p style="font-size: 0.7rem; color: #00ffff; margin: 0;">You've conquered all Silly Games!</p>
            
            <div style="background: #111; padding: 15px; border: 2px solid #333; width: 100%;">
                <p style="font-size: 0.6rem; color: #888; margin: 0 0 10px 0;">ACHIEVEMENTS UNLOCKED:</p>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
                    <span style="background: #222; padding: 5px 10px; border-radius: 5px;">🎤 Screamer</span>
                    <span style="background: #222; padding: 5px 10px; border-radius: 5px;">🎳 Bowler</span>
                    <span style="background: #222; padding: 5px 10px; border-radius: 5px;">💕 Flirt Master</span>
                    <span style="background: #222; padding: 5px 10px; border-radius: 5px;">🔄 Gravity Bender</span>
                    <span style="background: #222; padding: 5px 10px; border-radius: 5px;">🎵 Rhythm King</span>
                </div>
            </div>

            <div style="margin-top: 10px;">
                <p style="font-size: 0.5rem; color: #666;">Made with 💜 and questionable decisions</p>
                <p style="font-size: 0.5rem; color: #444;">Thanks for playing Silly Games!</p>
            </div>

            <div style="display: flex; gap: 10px;">
                <button class="beveled-btn primary" id="l15-celebrate-btn" style="animation: glow 1s infinite;">🎉 CELEBRATE!</button>
                <button class="beveled-btn small" id="l15-back-btn">Menu</button>
            </div>
        </div>
        <style>
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            @keyframes glow {
                0%, 100% { box-shadow: 0 0 10px #39ff14; }
                50% { box-shadow: 0 0 30px #39ff14, 0 0 50px #00ffff; }
            }
        </style>
    `,
    init: (levelManager) => {
        const canvas = document.getElementById('l15-canvas');
        const ctx = canvas.getContext('2d');
        const backBtn = document.getElementById('l15-back-btn');
        const celebrateBtn = document.getElementById('l15-celebrate-btn');

        let confetti = [];
        let animationId;
        let celebrating = false;

        backBtn.onclick = () => {
            cancelAnimationFrame(animationId);
            levelManager.loadMenu();
        };

        celebrateBtn.onclick = () => {
            if (celebrating) return;
            celebrating = true;
            celebrateBtn.innerText = "🎊 WOOHOO! 🎊";

            // Spawn lots of confetti
            for (let i = 0; i < 100; i++) {
                setTimeout(() => spawnConfetti(), i * 30);
            }

            // Complete level after celebration
            setTimeout(() => {
                levelManager.completeLevel('level-15');
            }, 4000);
        };

        function spawnConfetti() {
            const colors = ['#ff00ff', '#00ffff', '#39ff14', '#ffff00', '#ff6b6b', '#fff'];
            for (let i = 0; i < 5; i++) {
                confetti.push({
                    x: Math.random() * canvas.width,
                    y: -20,
                    vx: (Math.random() - 0.5) * 4,
                    vy: Math.random() * 3 + 2,
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 10,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: Math.random() * 10 + 5,
                    shape: Math.random() > 0.5 ? 'rect' : 'circle'
                });
            }
        }

        function update() {
            confetti = confetti.filter(c => {
                c.x += c.vx;
                c.y += c.vy;
                c.vy += 0.05; // Gravity
                c.vx *= 0.99; // Air resistance
                c.rotation += c.rotationSpeed;
                return c.y < canvas.height + 20;
            });
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            confetti.forEach(c => {
                ctx.save();
                ctx.translate(c.x, c.y);
                ctx.rotate(c.rotation * Math.PI / 180);
                ctx.fillStyle = c.color;

                if (c.shape === 'rect') {
                    ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, c.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            });

            // Sparkle effect
            if (celebrating && Math.random() > 0.7) {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                const sx = Math.random() * canvas.width;
                const sy = Math.random() * canvas.height;
                ctx.arc(sx, sy, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function gameLoop() {
            update();
            draw();
            animationId = requestAnimationFrame(gameLoop);
        }

        // Start with some initial confetti
        for (let i = 0; i < 20; i++) {
            confetti.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 2 + 1,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 5,
                color: ['#ff00ff', '#00ffff', '#39ff14'][Math.floor(Math.random() * 3)],
                size: Math.random() * 8 + 4,
                shape: Math.random() > 0.5 ? 'rect' : 'circle'
            });
        }

        gameLoop();
    },
    cleanup: () => { }
};
