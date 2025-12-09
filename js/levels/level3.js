export default {
    id: 'level-3',
    title: 'Scream to Fly',
    description: 'Yell at your screen to fly! 🎤',
    html: `
        <div class="game-container beveled-panel" style="gap: 0.5rem;">
            <h3 style="margin: 0;">Level 3: Scream to Fly 🐦</h3>
            <p style="font-size: 0.6rem; margin: 0;">YELL to jump! Pass 1 pipe to win!</p>
            <div class="canvas-wrapper beveled-inset" style="margin: 0;">
                <canvas id="l3-canvas" width="320" height="280"></canvas>
            </div>
            <div style="width: 100%; padding: 8px; background: #222; border: 2px solid #555;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <label style="font-size: 0.5rem; color: #aaa; white-space: nowrap;">🔊 SENSITIVITY</label>
                    <input type="range" id="l3-sensitivity" min="20" max="80" value="45" style="flex: 1;">
                </div>
                <div id="l3-vol-meter" style="width: 0%; height: 6px; background: lime; margin-top: 5px; transition: width 0.1s; border-radius: 3px;"></div>
            </div>
            <p id="l3-status" class="feedback-text" style="margin: 0; font-size: 0.6rem;">Waiting for mic...</p>
            <div style="display: flex; gap: 10px;">
                <button class="beveled-btn primary" id="l3-start-btn" style="padding: 10px;">🎤 START</button>
                <button class="beveled-btn small" id="l3-back-btn">Back</button>
            </div>
        </div>
    `,
    init: (levelManager) => {
        let audioContext, analyser, microphone, dataArray;
        let isGameRunning = false;
        let animationFrameId;

        // Game Physics - EASY MODE
        const GRAVITY = 0.15;  // Very slow fall
        const SPEED = 1.5;     // Slow pipes
        const WIN_SCORE = 1;   // Just pass 1 pipe to win!

        // Jump Control - More stable
        let lastJumpTime = 0;
        const JUMP_COOLDOWN = 600; // Longer cooldown = more stable
        let volumeHistory = [];
        const SMOOTH_SAMPLES = 5;

        let bird = { x: 50, y: 200, velocity: 0, radius: 12, jump: -7, isJumping: false };
        let pipes = [];
        let frames = 0;
        let l3Score = 0;

        const backBtn = document.getElementById('l3-back-btn');
        const startBtn = document.getElementById('l3-start-btn');
        const canvas = document.getElementById('l3-canvas');
        const statusElement = document.getElementById('l3-status');

        // Initial UI State
        initUI();

        backBtn.onclick = () => {
            stopGame();
            levelManager.loadMenu();
        };

        startBtn.onclick = () => initAudio();

        function initUI() {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#1a1a2e";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#FFF";
            ctx.font = "bold 18px Arial";
            ctx.textAlign = "center";
            ctx.fillText("🎤 Press Start & SCREAM!", canvas.width / 2, 120);
            ctx.font = "14px Arial";
            ctx.fillText("Pass 1 pipe to win!", canvas.width / 2, 150);
            statusElement.innerText = "Waiting for mic...";
        }

        function winGame() {
            isGameRunning = false;
            cancelAnimationFrame(animationFrameId);
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = "rgba(0,0,0,0.85)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#39ff14";
            ctx.font = "bold 28px Arial";
            ctx.textAlign = "center";
            ctx.fillText("🎉 LOUD VICTORY! 🎉", canvas.width / 2, 120);
            ctx.font = "18px Arial";
            ctx.fillText(`Score: ${l3Score}`, canvas.width / 2, 155);
            setTimeout(() => levelManager.completeLevel('level-3'), 1500);
        }

        async function initAudio() {
            statusElement.innerText = "Requesting mic access...";

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                microphone = audioContext.createMediaStreamSource(stream);

                microphone.connect(analyser);
                analyser.fftSize = 256;
                const bufferLength = analyser.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);

                statusElement.innerText = "🎤 Mic Active! SCREAM NOW!";
                statusElement.style.color = "#39ff14";
                startGame();

            } catch (err) {
                console.error(err);
                statusElement.innerText = "❌ Mic Denied! Can't play :(";
                statusElement.style.color = "red";
            }
        }

        function startGame() {
            if (isGameRunning) return;
            bird = { x: 50, y: 140, velocity: 0, radius: 10, jump: -4.5, isJumping: false }; // Gentler jump
            pipes = [];
            frames = 0;
            l3Score = 0;
            volumeHistory = [];
            lastJumpTime = 0;
            isGameRunning = true;
            startBtn.classList.add('hidden');
            draw();
        }

        function stopGame() {
            isGameRunning = false;
            cancelAnimationFrame(animationFrameId);
            if (audioContext && audioContext.state !== 'closed') {
                audioContext.close();
            }
            startBtn.classList.remove('hidden');
        }

        function getSmoothedVolume() {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            let currentAvg = sum / dataArray.length;

            // Add to history
            volumeHistory.push(currentAvg);
            if (volumeHistory.length > SMOOTH_SAMPLES) {
                volumeHistory.shift();
            }

            // Return smoothed average
            return volumeHistory.reduce((a, b) => a + b, 0) / volumeHistory.length;
        }

        function draw() {
            if (!isGameRunning) return;

            const ctx = canvas.getContext('2d');
            updateGame(canvas);

            // Background - night sky gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, "#1a1a2e");
            gradient.addColorStop(1, "#16213e");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Bird with glow effect
            ctx.shadowColor = "#ff6b6b";
            ctx.shadowBlur = 15;
            ctx.fillStyle = "#ff6b6b";
            ctx.beginPath();
            ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Bird eye
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(bird.x + 4, bird.y - 3, 3, 0, Math.PI * 2);
            ctx.fill();

            // Pipes with neon glow
            ctx.shadowColor = "#39ff14";
            ctx.shadowBlur = 10;
            ctx.fillStyle = "#39ff14";
            pipes.forEach(pipe => {
                ctx.fillRect(pipe.x, 0, pipe.w, pipe.top);
                ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.w, pipe.bottom);
            });
            ctx.shadowBlur = 0;

            // Score
            ctx.fillStyle = "#FFF";
            ctx.font = "bold 24px Arial";
            ctx.textAlign = "left";
            ctx.fillText(`🎯 ${l3Score}/${WIN_SCORE}`, 10, 35);

            // Audio Check with smoothing
            const smoothedVolume = getSmoothedVolume();

            // Sensitivity Control
            const sensitivity = parseInt(document.getElementById('l3-sensitivity').value);
            const THRESHOLD = sensitivity;

            // Visual Vol Meter with better scaling
            const volPercent = Math.min((smoothedVolume / 80) * 100, 100);
            const volMeter = document.getElementById('l3-vol-meter');
            volMeter.style.width = volPercent + '%';

            const now = Date.now();
            const canJump = (now - lastJumpTime) > JUMP_COOLDOWN;

            if (smoothedVolume > THRESHOLD) {
                volMeter.style.background = canJump ? '#ff0000' : '#ff6600';
            } else {
                volMeter.style.background = 'linear-gradient(90deg, #39ff14, #00ff88)';
            }

            // Jump trigger with cooldown
            if (smoothedVolume > THRESHOLD && canJump) {
                bird.velocity = bird.jump;
                lastJumpTime = now;
            }

            animationFrameId = requestAnimationFrame(draw);
        }

        function updateGame(canvas) {
            frames++;
            bird.velocity += GRAVITY;
            bird.y += bird.velocity;

            // Ceiling/Floor collision
            if (bird.y + bird.radius >= canvas.height || bird.y - bird.radius <= 0) {
                gameOver();
                return;
            }

            // Spawn pipes - less frequent
            if (frames % 150 === 0) {
                let gap = 130; // Big gap = easy!
                let minHeight = 20;
                let maxTop = canvas.height - gap - minHeight;
                let topHeight = Math.floor(Math.random() * (maxTop - minHeight + 1) + minHeight);

                pipes.push({
                    x: canvas.width,
                    w: 45,
                    top: topHeight,
                    bottom: canvas.height - gap - topHeight,
                    passed: false
                });
            }

            for (let i = 0; i < pipes.length; i++) {
                let p = pipes[i];
                p.x -= SPEED;
                if (p.x + p.w < 0) {
                    pipes.shift();
                    i--;
                    continue;
                }
                if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + p.w) {
                    if (bird.y - bird.radius < p.top || bird.y + bird.radius > canvas.height - p.bottom) {
                        gameOver();
                    }
                }
                if (p.x + p.w < bird.x && !p.passed) {
                    l3Score++;
                    p.passed = true;

                    // Check win condition
                    if (l3Score >= WIN_SCORE) {
                        winGame();
                    }
                }
            }
        }

        function gameOver() {
            isGameRunning = false;
            const status = document.getElementById('l3-status');
            status.innerText = `💀 Game Over! Score: ${l3Score}/${WIN_SCORE}`;
            status.style.color = "#ff6b6b";
            startBtn.classList.remove('hidden');
            startBtn.innerText = "🔄 Try Again!";
            cancelAnimationFrame(animationFrameId);
        }

        // Export cleanup if we need to force stop from outside
        this.cleanup = () => stopGame();
    },
    cleanup: () => {
        // Logic handled in internal helper, but exposed here if context is lost
    }
};
