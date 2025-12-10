export default {
    id: 'level-14',
    title: 'Rhythm Tap',
    description: 'Tap to the beat! 🎵',
    html: `
        <div class="game-container beveled-panel" style="gap: 0.5rem;">
            <h3 style="margin: 0;">Level 14: Rhythm Tap 🎵</h3>
            <p style="font-size: 0.6rem; margin: 0;">Tap when circles hit the center!</p>
            <div class="canvas-wrapper beveled-inset">
                <canvas id="l14-canvas" width="320" height="280"></canvas>
            </div>
            <div style="display: flex; gap: 20px; align-items: center;">
                <p id="l14-score" style="color: #39ff14; margin: 0;">Score: 0</p>
                <p id="l14-combo" style="color: #ff00ff; margin: 0;">Combo: 0</p>
            </div>
            <p id="l14-msg" class="feedback-text" style="margin: 0;">Get 500 points!</p>
            <button class="beveled-btn small" id="l14-back-btn">Back</button>
        </div>
    `,
    init: (levelManager) => {
        const canvas = document.getElementById('l14-canvas');
        const ctx = canvas.getContext('2d');
        const msg = document.getElementById('l14-msg');
        const scoreEl = document.getElementById('l14-score');
        const comboEl = document.getElementById('l14-combo');
        const backBtn = document.getElementById('l14-back-btn');

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const hitZone = 30;

        let notes = [];
        let score = 0;
        let combo = 0;
        let lastSpawn = 0;
        let animationId;
        let hitEffects = [];
        let beatPhase = 0;

        backBtn.onclick = () => {
            cancelAnimationFrame(animationId);
            levelManager.loadMenu();
        };

        function spawnNote() {
            const side = Math.floor(Math.random() * 4);
            let x, y, vx, vy;
            const speed = 2;

            switch (side) {
                case 0: x = centerX + (Math.random() - 0.5) * 100; y = -20; vx = (centerX - x) / 80; vy = speed; break;
                case 1: x = canvas.width + 20; y = centerY + (Math.random() - 0.5) * 100; vx = -speed; vy = (centerY - y) / 80; break;
                case 2: x = centerX + (Math.random() - 0.5) * 100; y = canvas.height + 20; vx = (centerX - x) / 80; vy = -speed; break;
                case 3: x = -20; y = centerY + (Math.random() - 0.5) * 100; vx = speed; vy = (centerY - y) / 80; break;
            }

            notes.push({ x, y, vx, vy, radius: 20, color: ['#ff00ff', '#00ffff', '#ffff00', '#39ff14'][side], active: true });
        }

        canvas.onclick = () => {
            let hit = false;
            notes.forEach(note => {
                if (!note.active) return;
                const dist = Math.sqrt(Math.pow(note.x - centerX, 2) + Math.pow(note.y - centerY, 2));
                if (dist < hitZone + note.radius) {
                    hit = true;
                    note.active = false;
                    let points = dist < 15 ? 100 : dist < 30 ? 50 : 25;
                    let rating = dist < 15 ? "PERFECT!" : dist < 30 ? "GREAT!" : "OK";
                    if (dist < 30) combo++; else combo = Math.max(0, combo - 1);
                    score += points * (1 + combo * 0.1);
                    scoreEl.innerText = `Score: ${Math.floor(score)}`;
                    comboEl.innerText = `Combo: ${combo}`;
                    hitEffects.push({ x: note.x, y: note.y, text: rating, life: 30, color: note.color });
                }
            });
            if (!hit) {
                combo = 0;
                comboEl.innerText = `Combo: 0`;
                hitEffects.push({ x: centerX, y: centerY - 30, text: "MISS", life: 20, color: "#ff0000" });
            }
            if (score >= 500) winGame();
        };

        function update() {
            beatPhase += 0.1;
            if (Date.now() - lastSpawn > 800) { spawnNote(); lastSpawn = Date.now(); }
            notes = notes.filter(note => {
                if (!note.active) return false;
                note.x += note.vx; note.y += note.vy;
                const dist = Math.sqrt(Math.pow(note.x - centerX, 2) + Math.pow(note.y - centerY, 2));
                if (dist > 200 && ((note.vx > 0 && note.x > centerX) || (note.vx < 0 && note.x < centerX) || (note.vy > 0 && note.y > centerY) || (note.vy < 0 && note.y < centerY))) {
                    combo = 0; comboEl.innerText = `Combo: 0`; return false;
                }
                return true;
            });
            hitEffects = hitEffects.filter(e => { e.life--; e.y -= 1; return e.life > 0; });
        }

        function draw() {
            const pulse = Math.sin(beatPhase) * 0.1 + 0.9;
            ctx.fillStyle = `rgb(${10 * pulse}, ${10 * pulse}, ${30 * pulse})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let r = 30; r <= 150; r += 40) { ctx.strokeStyle = `rgba(255,255,255,${0.1 - r / 1500})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(centerX, centerY, r, 0, Math.PI * 2); ctx.stroke(); }
            const zoneSize = hitZone + Math.sin(beatPhase * 2) * 5;
            ctx.strokeStyle = "#39ff14"; ctx.lineWidth = 4; ctx.shadowColor = "#39ff14"; ctx.shadowBlur = 20;
            ctx.beginPath(); ctx.arc(centerX, centerY, zoneSize, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
            notes.forEach(note => { if (!note.active) return; ctx.fillStyle = note.color; ctx.shadowColor = note.color; ctx.shadowBlur = 15; ctx.beginPath(); ctx.arc(note.x, note.y, note.radius, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; });
            hitEffects.forEach(e => { ctx.fillStyle = e.color; ctx.globalAlpha = e.life / 30; ctx.font = "bold 16px Arial"; ctx.textAlign = "center"; ctx.fillText(e.text, e.x, e.y); });
            ctx.globalAlpha = 1;
            const progress = Math.min(score / 500, 1);
            ctx.fillStyle = "#333"; ctx.fillRect(10, 10, 100, 10);
            ctx.fillStyle = "#39ff14"; ctx.fillRect(10, 10, 100 * progress, 10);
        }

        function gameLoop() { update(); draw(); animationId = requestAnimationFrame(gameLoop); }

        function winGame() {
            cancelAnimationFrame(animationId);
            msg.innerText = "🎵 RHYTHM MASTER! 🎵"; msg.style.color = "#39ff14";
            ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#39ff14"; ctx.font = "bold 24px Arial"; ctx.textAlign = "center";
            ctx.fillText("🎵 PERFECT RHYTHM! 🎵", canvas.width / 2, canvas.height / 2);
            setTimeout(() => levelManager.completeLevel('level-14'), 1500);
        }

        gameLoop();
    },
    cleanup: () => { }
};
