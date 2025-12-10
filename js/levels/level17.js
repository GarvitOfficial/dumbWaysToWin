export default {
    id: 'level-17',
    title: 'Escape Box',
    description: 'Jump and run to escape! 🏃',
    html: `
        <div class="game-container beveled-panel" style="gap: 0.5rem; padding: 10px; max-width: 100%;">
            <h3 style="margin: 0; color: #ff6b6b;">🏃 ESCAPE THE BOX! 🚪</h3>
            <p style="font-size: 0.5rem; margin: 0; color: #aaa;">Reach the green exit door!</p>
            
            <div class="canvas-wrapper" style="border: 4px solid #444; margin: 0 auto;">
                <canvas id="l17-canvas" width="320" height="280" style="display: block; max-width: 100%;"></canvas>
            </div>
            
            <p id="l17-msg" style="color: #ffff00; margin: 0; font-size: 0.7rem;">ARROWS or BUTTONS to move!</p>
            
            <!-- Mobile Controls -->
            <div id="l17-controls" style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <div style="display: flex; gap: 5px;">
                    <button class="ctrl-btn" data-key="left" style="width:55px;height:55px;background:#333;border:3px solid #666;color:#fff;font-size:1.5rem;border-radius:10px;">◀</button>
                    <button class="ctrl-btn" data-key="right" style="width:55px;height:55px;background:#333;border:3px solid #666;color:#fff;font-size:1.5rem;border-radius:10px;">▶</button>
                </div>
                <button class="ctrl-btn" data-key="jump" style="width:80px;height:55px;background:#39ff14;border:3px solid #2a2;color:#000;font-size:1rem;border-radius:10px;font-weight:bold;">JUMP</button>
            </div>
            
            <button class="beveled-btn small" id="l17-back-btn">← BACK</button>
        </div>
    `,
    init: (levelManager) => {
        const canvas = document.getElementById('l17-canvas');
        const ctx = canvas.getContext('2d');
        const msgEl = document.getElementById('l17-msg');
        const backBtn = document.getElementById('l17-back-btn');

        // Game constants
        const GRAVITY = 0.5;
        const JUMP_FORCE = -10;
        const MOVE_SPEED = 4;
        const TILE = 20;

        // Player
        let player = {
            x: 30, y: 200,
            vx: 0, vy: 0,
            width: 20, height: 30,
            onGround: false,
            color: '#ff6b6b'
        };

        // Level layout (simple platformer)
        const platforms = [
            { x: 0, y: 260, w: 320, h: 20 },     // Ground
            { x: 60, y: 220, w: 60, h: 15 },     // Platform 1
            { x: 150, y: 180, w: 60, h: 15 },    // Platform 2
            { x: 240, y: 140, w: 60, h: 15 },    // Platform 3
            { x: 140, y: 100, w: 60, h: 15 },    // Platform 4
            { x: 40, y: 60, w: 60, h: 15 },      // Platform 5
            // Walls
            { x: 0, y: 0, w: 10, h: 280 },       // Left wall
            { x: 310, y: 0, w: 10, h: 280 },     // Right wall
            { x: 0, y: 0, w: 320, h: 10 },       // Ceiling
        ];

        // Exit door
        const exit = { x: 50, y: 25, w: 30, h: 35 };

        // Obstacles (spikes)
        const spikes = [
            { x: 120, y: 250, w: 30, h: 10 },
            { x: 200, y: 250, w: 30, h: 10 },
        ];

        let keys = { left: false, right: false, jump: false };
        let gameOver = false;
        let won = false;

        backBtn.onclick = () => levelManager.loadMenu();

        // Keyboard
        function handleKeyDown(e) {
            if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') keys.jump = true;
        }
        function handleKeyUp(e) {
            if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') keys.jump = false;
        }
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        // Mobile buttons
        document.querySelectorAll('.ctrl-btn').forEach(btn => {
            const key = btn.dataset.key;
            btn.ontouchstart = btn.onmousedown = (e) => {
                e.preventDefault();
                keys[key] = true;
            };
            btn.ontouchend = btn.onmouseup = btn.onmouseleave = (e) => {
                keys[key] = false;
            };
        });

        function update() {
            if (gameOver) return;

            // Horizontal movement
            if (keys.left) player.vx = -MOVE_SPEED;
            else if (keys.right) player.vx = MOVE_SPEED;
            else player.vx *= 0.8; // Friction

            // Jumping
            if (keys.jump && player.onGround) {
                player.vy = JUMP_FORCE;
                player.onGround = false;
            }

            // Gravity
            player.vy += GRAVITY;

            // Move X
            player.x += player.vx;

            // Collision X
            platforms.forEach(p => {
                if (collides(player, p)) {
                    if (player.vx > 0) player.x = p.x - player.width;
                    if (player.vx < 0) player.x = p.x + p.w;
                    player.vx = 0;
                }
            });

            // Move Y
            player.y += player.vy;
            player.onGround = false;

            // Collision Y
            platforms.forEach(p => {
                if (collides(player, p)) {
                    if (player.vy > 0) {
                        player.y = p.y - player.height;
                        player.onGround = true;
                    }
                    if (player.vy < 0) {
                        player.y = p.y + p.h;
                    }
                    player.vy = 0;
                }
            });

            // Spike collision
            spikes.forEach(s => {
                if (collides(player, s)) {
                    die();
                }
            });

            // Exit collision
            if (collides(player, exit)) {
                win();
            }
        }

        function collides(a, b) {
            return a.x < b.x + b.w && a.x + a.width > b.x &&
                a.y < b.y + b.h && a.y + a.height > b.y;
        }

        function die() {
            gameOver = true;
            msgEl.innerText = "💀 OUCH! TAP TO RETRY";
            msgEl.style.color = "#ff0000";
            canvas.onclick = () => { canvas.onclick = null; resetGame(); };
        }

        function win() {
            gameOver = true;
            won = true;
            msgEl.innerText = "🎉 ESCAPED!";
            msgEl.style.color = "#39ff14";
            setTimeout(() => levelManager.completeLevel('level-17'), 1500);
        }

        function resetGame() {
            player = { x: 30, y: 200, vx: 0, vy: 0, width: 20, height: 30, onGround: false, color: '#ff6b6b' };
            gameOver = false;
            won = false;
            msgEl.innerText = "ARROWS or BUTTONS to move!";
            msgEl.style.color = "#ffff00";
        }

        function draw() {
            // Background gradient
            const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bg.addColorStop(0, '#1a1a2e');
            bg.addColorStop(1, '#16213e');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Exit door (green)
            ctx.fillStyle = '#39ff14';
            ctx.shadowColor = '#39ff14';
            ctx.shadowBlur = 15;
            ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
            ctx.shadowBlur = 0;
            // Door details
            ctx.fillStyle = '#2a8f2a';
            ctx.fillRect(exit.x + 5, exit.y + 5, exit.w - 10, exit.h - 5);
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(exit.x + exit.w - 8, exit.y + exit.h / 2, 3, 0, Math.PI * 2);
            ctx.fill();

            // Platforms
            platforms.forEach(p => {
                const platGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
                platGrad.addColorStop(0, '#666');
                platGrad.addColorStop(1, '#444');
                ctx.fillStyle = platGrad;
                ctx.fillRect(p.x, p.y, p.w, p.h);
                ctx.strokeStyle = '#888';
                ctx.lineWidth = 1;
                ctx.strokeRect(p.x, p.y, p.w, p.h);
            });

            // Spikes
            ctx.fillStyle = '#ff3333';
            spikes.forEach(s => {
                ctx.beginPath();
                for (let i = 0; i < s.w; i += 10) {
                    ctx.moveTo(s.x + i, s.y + s.h);
                    ctx.lineTo(s.x + i + 5, s.y);
                    ctx.lineTo(s.x + i + 10, s.y + s.h);
                }
                ctx.closePath();
                ctx.fill();
            });

            // Player
            ctx.fillStyle = player.color;
            ctx.shadowColor = player.color;
            ctx.shadowBlur = 10;
            ctx.fillRect(player.x, player.y, player.width, player.height);
            ctx.shadowBlur = 0;

            // Player face
            ctx.fillStyle = '#fff';
            ctx.fillRect(player.x + 4, player.y + 6, 4, 4);
            ctx.fillRect(player.x + 12, player.y + 6, 4, 4);
            ctx.fillStyle = '#000';
            ctx.fillRect(player.x + 5, player.y + 7, 2, 2);
            ctx.fillRect(player.x + 13, player.y + 7, 2, 2);

            // Instructions
            if (!gameOver) {
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('↑ Reach the green door!', canvas.width / 2, canvas.height - 5);
            }
        }

        function gameLoop() {
            update();
            draw();
            if (!won) requestAnimationFrame(gameLoop);
        }

        gameLoop();

        this.cleanup = () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    },
    cleanup: () => { }
};
