export default {
    id: 'level-18',
    title: 'Sniper Shot',
    description: 'Aim and shoot the targets! 🎯',
    html: `
        <div class="game-container beveled-panel" style="gap: 0.5rem; padding: 10px;">
            <h3 style="margin: 0; color: #ff3333;">🎯 SNIPER SHOT 🔫</h3>
            <p style="font-size: 0.5rem; margin: 0; color: #aaa;">Click/Tap targets before time runs out!</p>
            
            <div class="canvas-wrapper" style="border: 4px solid #333; margin: 0 auto; position: relative; cursor: crosshair;">
                <canvas id="l18-canvas" width="320" height="280" style="display: block; max-width: 100%;"></canvas>
                <!-- Scope overlay -->
                <div id="l18-scope" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; 
                    background: radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.8) 60%);
                    border-radius: 50%; display: none;"></div>
            </div>
            
            <div style="display: flex; gap: 20px; align-items: center; justify-content: center; flex-wrap: wrap;">
                <p id="l18-score" style="color: #39ff14; margin: 0;">HITS: 0/5</p>
                <p id="l18-time" style="color: #ff6b6b; margin: 0;">⏱️ 20s</p>
                <p id="l18-ammo" style="color: #ffff00; margin: 0;">🔫 10</p>
            </div>
            
            <p id="l18-msg" style="color: #00ffff; margin: 0; font-size: 0.6rem;">AIM and CLICK to shoot!</p>
            
            <button class="beveled-btn small" id="l18-back-btn">← BACK</button>
        </div>
    `,
    init: (levelManager) => {
        const canvas = document.getElementById('l18-canvas');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('l18-score');
        const timeEl = document.getElementById('l18-time');
        const ammoEl = document.getElementById('l18-ammo');
        const msgEl = document.getElementById('l18-msg');
        const backBtn = document.getElementById('l18-back-btn');
        const scope = document.getElementById('l18-scope');

        // Game settings
        const WIN_HITS = 5;
        const START_TIME = 20;
        const START_AMMO = 10;

        let targets = [];
        let hits = 0;
        let ammo = START_AMMO;
        let timeLeft = START_TIME;
        let gameOver = false;
        let mouseX = 0, mouseY = 0;
        let hitEffects = [];
        let muzzleFlash = 0;

        backBtn.onclick = () => levelManager.loadMenu();

        // Spawn initial targets
        function spawnTarget() {
            const size = 25 + Math.random() * 20;
            targets.push({
                x: 30 + Math.random() * (canvas.width - 60),
                y: 30 + Math.random() * (canvas.height - 60),
                radius: size,
                speed: 1 + Math.random() * 2,
                angle: Math.random() * Math.PI * 2,
                color: Math.random() > 0.3 ? '#ff3333' : '#ffff00', // Yellow = bonus
                points: Math.random() > 0.3 ? 1 : 2,
                pulse: 0
            });
        }

        // Initial targets
        for (let i = 0; i < 3; i++) spawnTarget();

        // Mouse/Touch tracking
        canvas.onmousemove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
            mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
        };

        canvas.ontouchmove = (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            mouseX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
            mouseY = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
        };

        // Shoot
        function shoot(e) {
            if (gameOver) return;
            if (ammo <= 0) {
                msgEl.innerText = "🔫 OUT OF AMMO!";
                return;
            }

            ammo--;
            ammoEl.innerText = `🔫 ${ammo}`;
            muzzleFlash = 5;

            // Get click position
            let clickX, clickY;
            const rect = canvas.getBoundingClientRect();

            if (e.touches) {
                clickX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
                clickY = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
            } else {
                clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
                clickY = (e.clientY - rect.top) * (canvas.height / rect.height);
            }

            // Check hits
            let hitTarget = false;
            for (let i = targets.length - 1; i >= 0; i--) {
                const t = targets[i];
                const dist = Math.sqrt((clickX - t.x) ** 2 + (clickY - t.y) ** 2);

                if (dist < t.radius) {
                    hitTarget = true;
                    hits += t.points;

                    // Hit effect
                    hitEffects.push({
                        x: t.x, y: t.y,
                        text: t.points > 1 ? '+2 BONUS!' : '+1',
                        color: t.points > 1 ? '#ffff00' : '#39ff14',
                        life: 30
                    });

                    targets.splice(i, 1);
                    scoreEl.innerText = `HITS: ${hits}/${WIN_HITS}`;

                    if (hits >= WIN_HITS) {
                        winGame();
                        return;
                    }

                    // Spawn new target
                    setTimeout(spawnTarget, 500);
                    break;
                }
            }

            if (!hitTarget) {
                hitEffects.push({
                    x: clickX, y: clickY,
                    text: 'MISS',
                    color: '#ff0000',
                    life: 20
                });
                msgEl.innerText = "❌ MISSED!";
            } else {
                msgEl.innerText = "🎯 HIT!";
            }

            // Check ammo after shot
            if (ammo <= 0 && hits < WIN_HITS) {
                setTimeout(() => loseGame("OUT OF AMMO!"), 500);
            }
        }

        canvas.onclick = shoot;
        canvas.ontouchstart = (e) => { e.preventDefault(); shoot(e); };

        // Timer
        const timerInterval = setInterval(() => {
            if (gameOver) return;
            timeLeft--;
            timeEl.innerText = `⏱️ ${timeLeft}s`;

            if (timeLeft <= 5) {
                timeEl.style.color = '#ff0000';
                timeEl.style.animation = 'blink 0.5s infinite';
            }

            if (timeLeft <= 0) {
                loseGame("TIME'S UP!");
            }
        }, 1000);

        function update() {
            if (gameOver) return;

            // Move targets
            targets.forEach(t => {
                t.x += Math.cos(t.angle) * t.speed;
                t.y += Math.sin(t.angle) * t.speed;
                t.pulse = (t.pulse + 0.1) % (Math.PI * 2);

                // Bounce off walls
                if (t.x < t.radius || t.x > canvas.width - t.radius) {
                    t.angle = Math.PI - t.angle;
                    t.x = Math.max(t.radius, Math.min(canvas.width - t.radius, t.x));
                }
                if (t.y < t.radius || t.y > canvas.height - t.radius) {
                    t.angle = -t.angle;
                    t.y = Math.max(t.radius, Math.min(canvas.height - t.radius, t.y));
                }
            });

            // Update effects
            hitEffects = hitEffects.filter(e => {
                e.y -= 1;
                e.life--;
                return e.life > 0;
            });

            if (muzzleFlash > 0) muzzleFlash--;
        }

        function draw() {
            // Background - dark shooting range
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Grid lines
            ctx.strokeStyle = '#2a2a2a';
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += 40) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Draw targets
            targets.forEach(t => {
                const pulseSize = Math.sin(t.pulse) * 3;

                // Target glow
                ctx.shadowColor = t.color;
                ctx.shadowBlur = 15;

                // Outer ring
                ctx.strokeStyle = t.color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(t.x, t.y, t.radius + pulseSize, 0, Math.PI * 2);
                ctx.stroke();

                // Inner rings
                ctx.beginPath();
                ctx.arc(t.x, t.y, t.radius * 0.6, 0, Math.PI * 2);
                ctx.stroke();

                // Center
                ctx.fillStyle = t.color;
                ctx.beginPath();
                ctx.arc(t.x, t.y, t.radius * 0.25, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowBlur = 0;
            });

            // Crosshair
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(mouseX - 15, mouseY);
            ctx.lineTo(mouseX - 5, mouseY);
            ctx.moveTo(mouseX + 5, mouseY);
            ctx.lineTo(mouseX + 15, mouseY);
            ctx.moveTo(mouseX, mouseY - 15);
            ctx.lineTo(mouseX, mouseY - 5);
            ctx.moveTo(mouseX, mouseY + 5);
            ctx.lineTo(mouseX, mouseY + 15);
            ctx.stroke();

            // Crosshair center dot
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 2, 0, Math.PI * 2);
            ctx.fill();

            // Muzzle flash
            if (muzzleFlash > 0) {
                ctx.fillStyle = `rgba(255, 255, 0, ${muzzleFlash / 5})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Hit effects
            hitEffects.forEach(e => {
                ctx.fillStyle = e.color;
                ctx.globalAlpha = e.life / 30;
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(e.text, e.x, e.y);
            });
            ctx.globalAlpha = 1;
        }

        function gameLoop() {
            update();
            draw();
            if (!gameOver) requestAnimationFrame(gameLoop);
        }

        function winGame() {
            gameOver = true;
            clearInterval(timerInterval);

            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#39ff14';
            ctx.font = 'bold 24px monospace';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#39ff14';
            ctx.shadowBlur = 20;
            ctx.fillText('🎯 SHARPSHOOTER!', canvas.width / 2, canvas.height / 2 - 10);
            ctx.font = '14px monospace';
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 0;
            ctx.fillText(`${ammo} bullets left!`, canvas.width / 2, canvas.height / 2 + 20);

            setTimeout(() => levelManager.completeLevel('level-18'), 1500);
        }

        function loseGame(reason) {
            gameOver = true;
            clearInterval(timerInterval);

            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 20px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(reason, canvas.width / 2, canvas.height / 2 - 10);
            ctx.font = '12px monospace';
            ctx.fillStyle = '#fff';
            ctx.fillText('TAP TO RETRY', canvas.width / 2, canvas.height / 2 + 20);

            canvas.onclick = () => location.reload();
        }

        gameLoop();

        this.cleanup = () => clearInterval(timerInterval);
    },
    cleanup: () => { }
};
