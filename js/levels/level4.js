export default {
    id: 'level-4',
    title: 'Bowling Swipe',
    description: 'Swipe to bowl and knock down pins! 🎳',
    html: `
        <div class="game-container beveled-panel">
            <h3>Level 4: Swipe Bowling 🎳</h3>
            <p>Swipe/drag the ball towards pins! Knock them ALL down!</p>
            <div class="canvas-wrapper beveled-inset">
                <canvas id="l4-canvas" width="320" height="400"></canvas>
            </div>
            <div class="controls">
                <p id="l4-score" class="feedback-text">PINS: 10 | Tries: 3</p>
                <button class="beveled-btn primary hidden" id="l4-reset-btn">🎳 BOWL AGAIN</button>
            </div>
            <button class="beveled-btn small" id="l4-back-btn">Back</button>
        </div>
    `,
    init: (levelManager) => {
        const canvas = document.getElementById('l4-canvas');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('l4-score');
        const backBtn = document.getElementById('l4-back-btn');
        const resetBtn = document.getElementById('l4-reset-btn');

        // Game State
        let ball = { x: 160, y: 350, radius: 15, vx: 0, vy: 0, rolling: false };
        let pins = [];
        let tries = 3;
        let isGameOver = false;
        let isDragging = false;
        let dragStart = { x: 0, y: 0 };
        let animationId;

        // Create Pins in Triangle Formation
        function createPins() {
            pins = [];
            const startX = 120;
            const startY = 80;
            const spacing = 35;

            for (let row = 0; row < 4; row++) {
                for (let col = 0; col <= row; col++) {
                    pins.push({
                        x: startX + col * spacing - (row * spacing / 2) + 40,
                        y: startY + row * 30,
                        radius: 12,
                        knocked: false,
                        vx: 0,
                        vy: 0
                    });
                }
            }
        }

        // Full reset - new game
        function fullReset() {
            tries = 3;
            isGameOver = false;
            createPins();
            ball = { x: 160, y: 350, radius: 15, vx: 0, vy: 0, rolling: false };
            scoreEl.innerText = `PINS LEFT: 10 | Tries: ${tries}`;
            scoreEl.style.color = '';
            resetBtn.classList.add('hidden');
            resetBtn.innerText = '🎳 BOWL AGAIN';
            draw();
        }

        // Just reset ball position for next bowl
        function resetBall() {
            ball = { x: 160, y: 350, radius: 15, vx: 0, vy: 0, rolling: false };
            resetBtn.classList.add('hidden');
            draw();
        }

        backBtn.onclick = () => {
            cancelAnimationFrame(animationId);
            levelManager.loadMenu();
        };

        // Single reset button handler - checks game state
        resetBtn.onclick = () => {
            if (isGameOver) {
                fullReset();
            } else {
                resetBall();
            }
        };

        // Touch/Mouse Controls for Swiping
        canvas.addEventListener('mousedown', startDrag);
        canvas.addEventListener('mousemove', duringDrag);
        canvas.addEventListener('mouseup', endDrag);
        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrag(e.touches[0]); });
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); duringDrag(e.touches[0]); });
        canvas.addEventListener('touchend', (e) => { e.preventDefault(); endDrag(e); });

        function startDrag(e) {
            if (ball.rolling || isGameOver) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const dist = Math.sqrt((x - ball.x) ** 2 + (y - ball.y) ** 2);
            if (dist < ball.radius + 20) {
                isDragging = true;
                dragStart = { x, y };
            }
        }

        function duringDrag(e) {
            if (!isDragging || ball.rolling) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            draw();
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(ball.x, ball.y);
            const dx = x - dragStart.x;
            const dy = y - dragStart.y;
            ctx.lineTo(ball.x + dx, ball.y + dy);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        function endDrag(e) {
            if (!isDragging || ball.rolling) return;
            isDragging = false;

            let endX, endY;
            if (e.changedTouches) {
                const rect = canvas.getBoundingClientRect();
                endX = e.changedTouches[0].clientX - rect.left;
                endY = e.changedTouches[0].clientY - rect.top;
            } else {
                const rect = canvas.getBoundingClientRect();
                endX = e.clientX - rect.left;
                endY = e.clientY - rect.top;
            }

            const dx = endX - dragStart.x;
            const dy = endY - dragStart.y;
            const power = Math.sqrt(dx * dx + dy * dy);

            if (power > 20) {
                ball.vx = dx / 8;
                ball.vy = dy / 8;
                ball.rolling = true;
                tries--;
                animate();
            }
        }

        function animate() {
            if (!ball.rolling) return;

            ball.vx *= 0.98;
            ball.vy *= 0.98;
            ball.x += ball.vx;
            ball.y += ball.vy;

            if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) {
                ball.vx *= -0.8;
                ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x));
            }

            pins.forEach(pin => {
                if (pin.knocked) return;
                const dist = Math.sqrt((ball.x - pin.x) ** 2 + (ball.y - pin.y) ** 2);
                if (dist < ball.radius + pin.radius) {
                    pin.knocked = true;
                    const angle = Math.atan2(pin.y - ball.y, pin.x - ball.x);
                    pin.vx = Math.cos(angle) * 5;
                    pin.vy = Math.sin(angle) * 5;
                    ball.vx *= 0.7;
                    ball.vy *= 0.7;
                }
            });

            pins.forEach(pin => {
                if (pin.knocked) {
                    pin.x += pin.vx;
                    pin.y += pin.vy;
                    pin.vx *= 0.95;
                    pin.vy *= 0.95;
                }
            });

            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            if (speed < 0.3 || ball.y < 0) {
                ball.rolling = false;
                checkWin();
            } else {
                draw();
                animationId = requestAnimationFrame(animate);
            }
        }

        function checkWin() {
            const standingPins = pins.filter(p => !p.knocked).length;
            scoreEl.innerText = `PINS LEFT: ${standingPins} | Tries: ${tries}`;

            if (standingPins === 0) {
                scoreEl.innerText = "🎳 STRIKE! YOU WIN! 🎳";
                scoreEl.style.color = "#39ff14";
                setTimeout(() => levelManager.completeLevel('level-4'), 1500);
            } else if (tries <= 0) {
                // GAME OVER
                isGameOver = true;
                scoreEl.innerText = `💔 GAME OVER! ${standingPins} pins left`;
                scoreEl.style.color = "#ff6b6b";
                resetBtn.classList.remove('hidden');
                resetBtn.innerText = "🔄 RETRY (3 balls)";
            } else {
                // Still have tries left
                resetBtn.classList.remove('hidden');
                resetBtn.innerText = `🎳 BOWL AGAIN (${tries} left)`;
            }
            draw();
        }

        function draw() {
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#2d1b0e');
            gradient.addColorStop(1, '#4a3020');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#5a4030';
            ctx.lineWidth = 2;
            [40, 80, 240, 280].forEach(x => {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            });

            pins.forEach(pin => {
                if (!pin.knocked) {
                    ctx.fillStyle = '#fff';
                    ctx.shadowColor = '#fff';
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.arc(pin.x, pin.y, pin.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = '#ff3333';
                    ctx.beginPath();
                    ctx.arc(pin.x, pin.y - 3, 5, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillStyle = 'rgba(255,255,255,0.3)';
                    ctx.beginPath();
                    ctx.arc(pin.x, pin.y, pin.radius * 0.8, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 20;
            const ballGradient = ctx.createRadialGradient(ball.x - 5, ball.y - 5, 0, ball.x, ball.y, ball.radius);
            ballGradient.addColorStop(0, '#00ffff');
            ballGradient.addColorStop(1, '#0066ff');
            ctx.fillStyle = ballGradient;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#003366';
            ctx.beginPath();
            ctx.arc(ball.x - 4, ball.y - 4, 3, 0, Math.PI * 2);
            ctx.arc(ball.x + 4, ball.y - 4, 3, 0, Math.PI * 2);
            ctx.fill();

            if (!ball.rolling && tries > 0 && !isGameOver) {
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('👆 Drag ball and swipe UP to bowl!', canvas.width / 2, canvas.height - 20);
            }
        }

        // Start game
        fullReset();
    },
    cleanup: () => { }
};
