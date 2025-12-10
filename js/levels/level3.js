export default {
    id: 'level-3',
    title: 'Scream to Fly',
    description: 'Yell at your screen to fly! 🎤',
    html: `
        <div class="game-container beveled-panel" style="gap: 0.5rem; padding: 10px;">
            <div class="canvas-wrapper" style="position: relative; margin: 0; border: 4px solid #5a8f3e;">
                <canvas id="l3-canvas" width="320" height="400"></canvas>
                <!-- Overlay UI -->
                <div id="l3-score-display" style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); font-size: 2rem; color: #fff; text-shadow: 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000;">0</div>
                <div id="l3-start-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px;">
                    <div style="font-size: 1.5rem; color: #ffd700;">🐦 SCREAM BIRD 🐦</div>
                    <div style="font-size: 0.6rem; color: #fff;">YELL to make the bird jump!</div>
                    <button id="l3-start-btn" class="beveled-btn primary" style="padding: 15px 30px;">🎤 TAP TO START</button>
                </div>
                <div id="l3-gameover-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: none; flex-direction: column; align-items: center; justify-content: center; gap: 10px;">
                    <div style="font-size: 1.2rem; color: #ff6b6b;">GAME OVER</div>
                    <div id="l3-final-score" style="font-size: 1.5rem; color: #ffd700;">0</div>
                    <button id="l3-retry-btn" class="beveled-btn primary" style="padding: 12px 25px;">🔄 RETRY</button>
                </div>
            </div>
            <div style="width: 100%; padding: 8px; background: #2d5a1e; border: 3px solid #5a8f3e; border-radius: 5px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 0.5rem; color: #90EE90;">🔊</span>
                    <div style="flex: 1; height: 12px; background: #1a3a0e; border-radius: 6px; overflow: hidden;">
                        <div id="l3-vol-meter" style="width: 0%; height: 100%; background: linear-gradient(90deg, #39ff14, #7fff00); transition: width 0.05s;"></div>
                    </div>
                    <input type="range" id="l3-sensitivity" min="20" max="80" value="40" style="width: 60px; accent-color: #39ff14;">
                </div>
            </div>
            <button class="beveled-btn small" id="l3-back-btn" style="padding: 8px;">← BACK</button>
        </div>
    `,
    init: (levelManager) => {
        let audioContext, analyser, microphone, dataArray;
        let isGameRunning = false;
        let animationFrameId;

        // Flappy Bird Physics
        const GRAVITY = 0.4;
        const JUMP_FORCE = -6;
        const PIPE_SPEED = 2;
        const PIPE_GAP = 120;
        const PIPE_WIDTH = 52;
        const PIPE_SPAWN_RATE = 100;
        const WIN_SCORE = 1;

        // Jump cooldown for stability
        let lastJumpTime = 0;
        const JUMP_COOLDOWN = 400;
        let volumeHistory = [];
        const SMOOTH_SAMPLES = 4;

        // Game objects
        let bird = { x: 80, y: 200, velocity: 0, width: 34, height: 24, rotation: 0 };
        let pipes = [];
        let ground = { y: 370, height: 30 };
        let frames = 0;
        let score = 0;
        let gameState = 'ready'; // ready, playing, gameover

        const canvas = document.getElementById('l3-canvas');
        const ctx = canvas.getContext('2d');
        const backBtn = document.getElementById('l3-back-btn');
        const startBtn = document.getElementById('l3-start-btn');
        const retryBtn = document.getElementById('l3-retry-btn');
        const startOverlay = document.getElementById('l3-start-overlay');
        const gameoverOverlay = document.getElementById('l3-gameover-overlay');
        const scoreDisplay = document.getElementById('l3-score-display');
        const finalScoreDisplay = document.getElementById('l3-final-score');
        const volMeter = document.getElementById('l3-vol-meter');

        // Draw initial screen
        drawGame();

        backBtn.onclick = () => {
            stopGame();
            levelManager.loadMenu();
        };

        startBtn.onclick = () => initAudio();
        retryBtn.onclick = () => resetGame();

        async function initAudio() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                microphone = audioContext.createMediaStreamSource(stream);

                microphone.connect(analyser);
                analyser.fftSize = 256;
                dataArray = new Uint8Array(analyser.frequencyBinCount);

                startOverlay.style.display = 'none';
                startGame();
            } catch (err) {
                console.error(err);
                startBtn.innerText = '❌ MIC DENIED';
                startBtn.style.background = '#ff6b6b';
            }
        }

        function startGame() {
            if (isGameRunning) return;
            bird = { x: 80, y: 200, velocity: 0, width: 34, height: 24, rotation: 0 };
            pipes = [];
            frames = 0;
            score = 0;
            volumeHistory = [];
            lastJumpTime = 0;
            gameState = 'playing';
            isGameRunning = true;
            scoreDisplay.innerText = '0';
            gameLoop();
        }

        function resetGame() {
            gameoverOverlay.style.display = 'none';
            startGame();
        }

        function stopGame() {
            isGameRunning = false;
            gameState = 'ready';
            cancelAnimationFrame(animationFrameId);
            if (audioContext && audioContext.state !== 'closed') {
                audioContext.close();
            }
        }

        function getSmoothedVolume() {
            if (!analyser) return 0;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            let currentAvg = sum / dataArray.length;

            volumeHistory.push(currentAvg);
            if (volumeHistory.length > SMOOTH_SAMPLES) volumeHistory.shift();

            return volumeHistory.reduce((a, b) => a + b, 0) / volumeHistory.length;
        }

        function gameLoop() {
            if (!isGameRunning) return;

            update();
            drawGame();
            animationFrameId = requestAnimationFrame(gameLoop);
        }

        function update() {
            frames++;

            // Audio input
            const smoothedVolume = getSmoothedVolume();
            const sensitivity = parseInt(document.getElementById('l3-sensitivity').value);
            const volPercent = Math.min((smoothedVolume / 80) * 100, 100);
            volMeter.style.width = volPercent + '%';

            const now = Date.now();
            const canJump = (now - lastJumpTime) > JUMP_COOLDOWN;

            // Jump on scream
            if (smoothedVolume > sensitivity && canJump) {
                bird.velocity = JUMP_FORCE;
                lastJumpTime = now;
                volMeter.style.background = 'linear-gradient(90deg, #ff6b6b, #ff0000)';
            } else {
                volMeter.style.background = 'linear-gradient(90deg, #39ff14, #7fff00)';
            }

            // Apply gravity
            bird.velocity += GRAVITY;
            bird.y += bird.velocity;

            // Bird rotation based on velocity
            bird.rotation = Math.min(Math.max(bird.velocity * 3, -30), 90);

            // Ground collision
            if (bird.y + bird.height / 2 >= ground.y) {
                gameOver();
                return;
            }

            // Ceiling collision
            if (bird.y - bird.height / 2 <= 0) {
                bird.y = bird.height / 2;
                bird.velocity = 0;
            }

            // Spawn pipes
            if (frames % PIPE_SPAWN_RATE === 0) {
                const minTop = 50;
                const maxTop = ground.y - PIPE_GAP - 50;
                const topHeight = Math.floor(Math.random() * (maxTop - minTop)) + minTop;

                pipes.push({
                    x: canvas.width,
                    topHeight: topHeight,
                    bottomY: topHeight + PIPE_GAP,
                    passed: false
                });
            }

            // Update pipes
            for (let i = pipes.length - 1; i >= 0; i--) {
                const pipe = pipes[i];
                pipe.x -= PIPE_SPEED;

                // Remove off-screen pipes
                if (pipe.x + PIPE_WIDTH < 0) {
                    pipes.splice(i, 1);
                    continue;
                }

                // Collision detection
                if (bird.x + bird.width / 2 > pipe.x && bird.x - bird.width / 2 < pipe.x + PIPE_WIDTH) {
                    if (bird.y - bird.height / 2 < pipe.topHeight || bird.y + bird.height / 2 > pipe.bottomY) {
                        gameOver();
                        return;
                    }
                }

                // Score
                if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
                    pipe.passed = true;
                    score++;
                    scoreDisplay.innerText = score;

                    if (score >= WIN_SCORE) {
                        winGame();
                        return;
                    }
                }
            }
        }

        function drawGame() {
            // Sky gradient (day theme like Flappy Bird)
            const skyGradient = ctx.createLinearGradient(0, 0, 0, ground.y);
            skyGradient.addColorStop(0, '#4ec0ca');
            skyGradient.addColorStop(1, '#bee4c2');
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, canvas.width, ground.y);

            // Clouds
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            drawCloud(50, 60, 40);
            drawCloud(180, 40, 30);
            drawCloud(280, 80, 35);

            // Pipes (green like Flappy Bird)
            pipes.forEach(pipe => {
                // Top pipe
                drawPipe(pipe.x, 0, PIPE_WIDTH, pipe.topHeight, true);
                // Bottom pipe
                drawPipe(pipe.x, pipe.bottomY, PIPE_WIDTH, ground.y - pipe.bottomY, false);
            });

            // Ground
            ctx.fillStyle = '#ded895';
            ctx.fillRect(0, ground.y, canvas.width, ground.height);
            ctx.fillStyle = '#5a8f3e';
            ctx.fillRect(0, ground.y, canvas.width, 10);

            // Bird
            drawBird();
        }

        function drawCloud(x, y, size) {
            ctx.beginPath();
            ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
            ctx.arc(x + size * 0.4, y - size * 0.2, size * 0.4, 0, Math.PI * 2);
            ctx.arc(x + size * 0.8, y, size * 0.5, 0, Math.PI * 2);
            ctx.arc(x + size * 0.4, y + size * 0.2, size * 0.35, 0, Math.PI * 2);
            ctx.fill();
        }

        function drawPipe(x, y, width, height, isTop) {
            // Main pipe body
            const pipeGradient = ctx.createLinearGradient(x, 0, x + width, 0);
            pipeGradient.addColorStop(0, '#5a8f3e');
            pipeGradient.addColorStop(0.3, '#73bf2e');
            pipeGradient.addColorStop(0.7, '#73bf2e');
            pipeGradient.addColorStop(1, '#5a8f3e');
            ctx.fillStyle = pipeGradient;
            ctx.fillRect(x, y, width, height);

            // Pipe cap
            const capHeight = 26;
            const capWidth = width + 10;
            const capX = x - 5;
            const capY = isTop ? y + height - capHeight : y;

            ctx.fillStyle = pipeGradient;
            ctx.fillRect(capX, capY, capWidth, capHeight);

            // Pipe border
            ctx.strokeStyle = '#3d5c28';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);
            ctx.strokeRect(capX, capY, capWidth, capHeight);
        }

        function drawBird() {
            ctx.save();
            ctx.translate(bird.x, bird.y);
            ctx.rotate(bird.rotation * Math.PI / 180);

            // Body
            ctx.fillStyle = '#f7dc6f';
            ctx.beginPath();
            ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#d68910';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Wing
            ctx.fillStyle = '#f0b429';
            ctx.beginPath();
            ctx.ellipse(-5, 5, 10, 6, -0.3, 0, Math.PI * 2);
            ctx.fill();

            // Eye
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(8, -4, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(10, -4, 3, 0, Math.PI * 2);
            ctx.fill();

            // Beak
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.moveTo(15, 0);
            ctx.lineTo(22, 3);
            ctx.lineTo(15, 6);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        function gameOver() {
            isGameRunning = false;
            gameState = 'gameover';
            cancelAnimationFrame(animationFrameId);
            finalScoreDisplay.innerText = score;
            gameoverOverlay.style.display = 'flex';
        }

        function winGame() {
            isGameRunning = false;
            gameState = 'gameover';
            cancelAnimationFrame(animationFrameId);

            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 28px "Press Start 2P", cursive';
            ctx.textAlign = 'center';
            ctx.fillText('🎉 YOU WIN! 🎉', canvas.width / 2, canvas.height / 2 - 20);
            ctx.font = '16px "Press Start 2P", cursive';
            ctx.fillStyle = '#fff';
            ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);

            setTimeout(() => levelManager.completeLevel('level-3'), 1500);
        }

        this.cleanup = () => stopGame();
    },
    cleanup: () => { }
};
