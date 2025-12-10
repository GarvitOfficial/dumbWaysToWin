export default {
    id: 'level-16',
    title: 'Pac-Man Fever',
    description: 'Eat all the dots! 👻',
    html: `
        <div class="game-container beveled-panel" style="gap: 0.5rem; padding: 15px; max-width: 100%;">
            <h3 style="margin: 0; color: #ffff00; text-shadow: 0 0 10px #ffff00;">🟡 PAC-MAN FEVER 👻</h3>
            <p style="font-size: 0.55rem; margin: 0; color: #aaa;">ARROWS/SWIPE to move! Eat 20 dots!</p>
            
            <div class="canvas-wrapper" style="border: 4px solid #2121de; box-shadow: 0 0 20px #2121de; margin: 0 auto;">
                <canvas id="l16-canvas" width="320" height="320" style="display: block; max-width: 100%;"></canvas>
            </div>
            
            <div style="display: flex; gap: 20px; align-items: center; justify-content: center;">
                <p id="l16-score" style="color: #ffff00; margin: 0; text-shadow: 0 0 5px #ffff00;">DOTS: 0/20</p>
                <p id="l16-lives" style="color: #ff0000; margin: 0;">❤️❤️❤️</p>
            </div>
            
            <div id="l16-controls" style="display: grid; grid-template-columns: repeat(3, 50px); gap: 5px; justify-content: center;">
                <div></div>
                <button class="pac-btn" data-dir="up" style="width:50px;height:50px;background:#2121de;border:2px solid #5555ff;color:#fff;font-size:1.2rem;border-radius:8px;">▲</button>
                <div></div>
                <button class="pac-btn" data-dir="left" style="width:50px;height:50px;background:#2121de;border:2px solid #5555ff;color:#fff;font-size:1.2rem;border-radius:8px;">◀</button>
                <button class="pac-btn" data-dir="down" style="width:50px;height:50px;background:#2121de;border:2px solid #5555ff;color:#fff;font-size:1.2rem;border-radius:8px;">▼</button>
                <button class="pac-btn" data-dir="right" style="width:50px;height:50px;background:#2121de;border:2px solid #5555ff;color:#fff;font-size:1.2rem;border-radius:8px;">▶</button>
            </div>
            
            <button class="beveled-btn small" id="l16-back-btn">← BACK</button>
        </div>
    `,
    init: (levelManager) => {
        const canvas = document.getElementById('l16-canvas');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('l16-score');
        const livesEl = document.getElementById('l16-lives');
        const backBtn = document.getElementById('l16-back-btn');

        const TILE = 20, W = 16, H = 16, WIN = 20;

        const maze = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 0],
            [0, 2, 0, 0, 2, 0, 2, 2, 2, 2, 0, 2, 0, 0, 2, 0],
            [0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0],
            [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
            [0, 2, 0, 0, 2, 0, 2, 0, 0, 2, 0, 2, 0, 0, 2, 0],
            [0, 2, 2, 2, 2, 0, 2, 0, 0, 2, 0, 2, 2, 2, 2, 0],
            [0, 0, 0, 0, 2, 0, 2, 2, 2, 2, 0, 2, 0, 0, 0, 0],
            [0, 0, 0, 0, 2, 0, 2, 2, 2, 2, 0, 2, 0, 0, 0, 0],
            [0, 2, 2, 2, 2, 0, 2, 0, 0, 2, 0, 2, 2, 2, 2, 0],
            [0, 2, 0, 0, 2, 0, 2, 0, 0, 2, 0, 2, 0, 0, 2, 0],
            [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
            [0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0],
            [0, 2, 0, 0, 2, 0, 2, 2, 2, 2, 0, 2, 0, 0, 2, 0],
            [0, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];

        let pac = { x: 1, y: 1, dir: 'right', nextDir: null };
        let ghosts = [{ x: 7, y: 7, color: '#ff0000', dir: 'left' }, { x: 8, y: 8, color: '#00ffff', dir: 'up' }];
        let dots = [], score = 0, lives = 3, gameOver = false, mouthAng = 0;

        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (maze[y][x] === 2) dots.push({ x, y, eaten: false });

        backBtn.onclick = () => levelManager.loadMenu();

        function handleKey(e) {
            if (gameOver) return;
            if (e.key === 'ArrowUp' || e.key === 'w') pac.nextDir = 'up';
            if (e.key === 'ArrowDown' || e.key === 's') pac.nextDir = 'down';
            if (e.key === 'ArrowLeft' || e.key === 'a') pac.nextDir = 'left';
            if (e.key === 'ArrowRight' || e.key === 'd') pac.nextDir = 'right';
        }
        document.addEventListener('keydown', handleKey);

        document.querySelectorAll('.pac-btn').forEach(btn => {
            btn.onclick = () => { if (!gameOver) pac.nextDir = btn.dataset.dir; };
        });

        let touchStart = { x: 0, y: 0 };
        canvas.ontouchstart = e => { touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
        canvas.ontouchend = e => {
            const dx = e.changedTouches[0].clientX - touchStart.x;
            const dy = e.changedTouches[0].clientY - touchStart.y;
            pac.nextDir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        };

        function canMove(x, y) { return x >= 0 && x < W && y >= 0 && y < H && maze[y][x] !== 0; }
        function getNext(e, d) { let nx = e.x, ny = e.y; if (d === 'up') ny--; if (d === 'down') ny++; if (d === 'left') nx--; if (d === 'right') nx++; return { x: nx, y: ny }; }

        function update() {
            if (gameOver) return;
            if (pac.nextDir) { const n = getNext(pac, pac.nextDir); if (canMove(n.x, n.y)) { pac.dir = pac.nextDir; pac.nextDir = null; } }
            const next = getNext(pac, pac.dir); if (canMove(next.x, next.y)) { pac.x = next.x; pac.y = next.y; }
            mouthAng = (mouthAng + 0.3) % (Math.PI * 2);
            dots.forEach(d => { if (!d.eaten && d.x === pac.x && d.y === pac.y) { d.eaten = true; score++; scoreEl.innerText = `DOTS: ${score}/${WIN}`; if (score >= WIN) winGame(); } });
            ghosts.forEach(g => {
                if (Math.random() > 0.3) { const dx = pac.x - g.x, dy = pac.y - g.y; g.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
                else g.dir = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
                const gn = getNext(g, g.dir); if (canMove(gn.x, gn.y)) { g.x = gn.x; g.y = gn.y; }
                if (g.x === pac.x && g.y === pac.y) { lives--; livesEl.innerText = '❤️'.repeat(lives) || '💀'; if (lives <= 0) loseGame(); else { pac.x = 1; pac.y = 1; } }
            });
        }

        function draw() {
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (maze[y][x] === 0) { ctx.fillStyle = '#2121de'; ctx.fillRect(x * TILE, y * TILE, TILE, TILE); ctx.fillStyle = '#000'; ctx.fillRect(x * TILE + 2, y * TILE + 2, TILE - 4, TILE - 4); }
            ctx.fillStyle = '#ffb8ae'; dots.forEach(d => { if (!d.eaten) { ctx.beginPath(); ctx.arc(d.x * TILE + TILE / 2, d.y * TILE + TILE / 2, 3, 0, Math.PI * 2); ctx.fill(); } });

            // Pac-Man
            const px = pac.x * TILE + TILE / 2, py = pac.y * TILE + TILE / 2;
            let rot = pac.dir === 'right' ? 0 : pac.dir === 'down' ? Math.PI / 2 : pac.dir === 'left' ? Math.PI : -Math.PI / 2;
            const mouth = Math.abs(Math.sin(mouthAng)) * 0.4;
            ctx.save(); ctx.translate(px, py); ctx.rotate(rot);
            ctx.fillStyle = '#ffff00'; ctx.shadowColor = '#ffff00'; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.arc(0, 0, TILE / 2 - 2, mouth, Math.PI * 2 - mouth); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
            ctx.shadowBlur = 0; ctx.restore();

            // Ghosts
            ghosts.forEach(g => {
                const gx = g.x * TILE + TILE / 2, gy = g.y * TILE + TILE / 2;
                ctx.fillStyle = g.color; ctx.shadowColor = g.color; ctx.shadowBlur = 8;
                ctx.beginPath(); ctx.arc(gx, gy - 2, TILE / 2 - 3, Math.PI, 0); ctx.lineTo(gx + TILE / 2 - 3, gy + TILE / 2 - 5);
                for (let i = 0; i < 3; i++) ctx.arc(gx + TILE / 2 - 3 - i * 5, gy + TILE / 2 - 5, 2.5, 0, Math.PI);
                ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
                ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(gx - 3, gy - 3, 3, 0, Math.PI * 2); ctx.arc(gx + 3, gy - 3, 3, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#00f'; ctx.beginPath(); ctx.arc(gx - 2, gy - 3, 1.5, 0, Math.PI * 2); ctx.arc(gx + 4, gy - 3, 1.5, 0, Math.PI * 2); ctx.fill();
            });
        }

        function winGame() {
            gameOver = true;
            ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffff00'; ctx.font = 'bold 24px monospace'; ctx.textAlign = 'center';
            ctx.shadowColor = '#ffff00'; ctx.shadowBlur = 20;
            ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2);
            setTimeout(() => levelManager.completeLevel('level-16'), 1500);
        }

        function loseGame() {
            gameOver = true;
            ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff0000'; ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);
            ctx.fillStyle = '#fff'; ctx.font = '12px monospace';
            ctx.fillText('TAP TO RETRY', canvas.width / 2, canvas.height / 2 + 20);
            canvas.onclick = () => { location.reload(); };
        }

        setInterval(update, 200);
        function loop() { draw(); if (!gameOver) requestAnimationFrame(loop); }
        loop();

        this.cleanup = () => document.removeEventListener('keydown', handleKey);
    },
    cleanup: () => { }
};
