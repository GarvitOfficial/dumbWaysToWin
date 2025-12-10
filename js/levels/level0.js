export default {
    id: 'level-0',
    title: 'Emotional Captcha',
    description: 'Verify Humanity.',
    html: `
        <div class="game-container beveled-panel">
            <h3 style="color:var(--neon-green)">LEVEL 01: CAPTCHA</h3>
            <p>ROBOTS DETECTED. VERIFY HUMANITY.</p>
            
            <div class="canvas-wrapper beveled-inset" style="position: relative; width: 320px; height: 240px; margin: 0 auto;">
                <video id="l0-video" autoplay playsinline style="display:none;"></video>
                <canvas id="l0-canvas" width="320" height="240" style="width: 100%; height: 100%; object-fit: cover;"></canvas>
                <div id="l0-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.7); color: #fff; text-align: center; gap: 10px;">
                    <div style="font-size: 1.2rem;">📷 CAMERA CHECK</div>
                    <div style="font-size: 0.6rem; color: #aaa;">Click anywhere or wave at camera</div>
                </div>
            </div>

            <div style="margin-top: 10px;">
                <p id="l0-prompt" style="font-size: 0.9rem; color: var(--neon-blue);">CLICK TO START</p>
                <div class="sentiment-meter">
                    <div id="l0-bar" class="meter-fill" style="width: 0%; transition: width 0.2s;"></div>
                </div>
                <p id="l0-progress" style="font-size: 0.7rem; color: var(--neon-yellow);">VERIFYING...</p>
            </div>
            
            <p id="l0-msg" class="feedback-text"></p>
            
            <div style="display: flex; gap: 15px; margin-top: 10px;">
                <button class="beveled-btn small" id="l0-back-btn">BACK</button>
            </div>
        </div>
    `,
    init: (levelManager) => {
        const video = document.getElementById('l0-video');
        const canvas = document.getElementById('l0-canvas');
        const ctx = canvas.getContext('2d');
        const overlay = document.getElementById('l0-overlay');
        const promptEl = document.getElementById('l0-prompt');
        const bar = document.getElementById('l0-bar');
        const msg = document.getElementById('l0-msg');
        const progressEl = document.getElementById('l0-progress');
        const backBtn = document.getElementById('l0-back-btn');

        let stream = null;
        let frameInterval;
        let autoPassTimer;
        let progress = 0;
        let lastFrameData = null;
        let hasStarted = false;

        backBtn.onclick = () => {
            cleanup();
            levelManager.loadMenu();
        };

        // Click anywhere to start/speed up
        canvas.onclick = () => {
            if (!hasStarted) {
                startVerification();
            } else {
                // Clicking speeds up progress
                progress += 20;
                msg.innerText = "👆 HUMAN CLICK DETECTED!";
            }
        };

        overlay.onclick = () => startVerification();

        function cleanup() {
            clearInterval(frameInterval);
            clearTimeout(autoPassTimer);
            if (stream) stream.getTracks().forEach(t => t.stop());
        }

        function startVerification() {
            hasStarted = true;
            overlay.style.display = 'none';
            promptEl.innerText = "ANALYZING HUMANITY...";
            promptEl.style.color = "var(--neon-green)";

            // Try to get camera, but don't require it
            navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
                .then(s => {
                    stream = s;
                    video.srcObject = stream;
                    startCameraMode();
                })
                .catch(err => {
                    // No camera? Just use click/auto mode
                    startAutoMode();
                });
        }

        function startCameraMode() {
            msg.innerText = "📷 SCANNING FACE...";

            frameInterval = setInterval(() => {
                ctx.drawImage(video, 0, 0, 320, 240);

                // Simple motion detection
                const imageData = ctx.getImageData(0, 0, 320, 240);
                const data = imageData.data;

                let motionScore = 0;
                if (lastFrameData) {
                    for (let i = 0; i < data.length; i += 40) {
                        const diff = Math.abs(data[i] - lastFrameData[i]);
                        if (diff > 30) motionScore++;
                    }
                }
                lastFrameData = data;

                // Any motion = progress!
                if (motionScore > 50) {
                    progress += 5;
                    msg.innerText = "✓ MOTION DETECTED!";
                } else {
                    progress += 1; // Slow auto-progress
                }

                updateProgress();
            }, 100);
        }

        function startAutoMode() {
            // Draw a simple pattern
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, 320, 240);
            ctx.fillStyle = '#39ff14';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🤖 NO CAMERA MODE', 160, 110);
            ctx.font = '14px Arial';
            ctx.fillText('Click rapidly to verify!', 160, 140);

            msg.innerText = "👆 CLICK TO PROVE HUMANITY!";

            // Auto-progress slowly
            frameInterval = setInterval(() => {
                progress += 2;
                updateProgress();
            }, 100);
        }

        function updateProgress() {
            if (progress > 100) progress = 100;

            bar.style.width = `${progress}%`;
            progressEl.innerText = `VERIFYING: ${Math.floor(progress)}%`;

            // Visual feedback
            if (progress > 50) {
                bar.style.background = 'linear-gradient(90deg, var(--neon-green), var(--neon-blue))';
            }
            if (progress > 80) {
                bar.style.boxShadow = '0 0 15px var(--neon-green)';
                msg.innerText = "✓ ALMOST VERIFIED...";
            }

            if (progress >= 100) {
                passLevel();
            }
        }

        function passLevel() {
            cleanup();

            bar.style.width = '100%';
            bar.style.boxShadow = '0 0 20px var(--neon-green)';
            msg.innerText = "✅ ACCESS GRANTED!";
            msg.style.color = "#39ff14";
            promptEl.innerText = "✓ VERIFIED HUMAN";
            progressEl.innerText = "COMPLETE!";

            // Draw success on canvas
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 0, 320, 240);
            ctx.fillStyle = '#39ff14';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✓ HUMAN', 160, 120);
            ctx.font = '14px Arial';
            ctx.fillText('WELCOME!', 160, 150);

            setTimeout(() => {
                levelManager.completeLevel('level-0');
            }, 1000);
        }

        this.cleanup = cleanup;
    },
    cleanup: () => { }
};
