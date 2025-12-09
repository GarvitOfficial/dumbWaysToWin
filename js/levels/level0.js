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
                <div id="l0-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); color: #fff; font-size: 1.5rem; text-align: center;">
                    ALLOW CAMERA
                </div>
            </div>

            <div style="margin-top: 10px;">
                <p id="l0-prompt" style="font-size: 1rem; color: var(--neon-blue);">INITIALIZING...</p>
                <div class="sentiment-meter">
                    <div id="l0-bar" class="meter-fill" style="width: 0%; transition: width 0.1s linear;"></div>
                </div>
                <p id="l0-progress" style="font-size: 0.7rem; color: var(--neon-yellow);">PROGRESS: 0%</p>
            </div>
            
            <p id="l0-msg" class="feedback-text"></p>
            
            <div style="display: flex; gap: 15px; margin-top: 10px;">
                <button class="beveled-btn small" id="l0-back-btn">BACK</button>
                <button class="beveled-btn small" id="l0-skip-btn" style="background: var(--neon-orange);">NO CAMERA? SKIP</button>
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
        const skipBtn = document.getElementById('l0-skip-btn');

        let emotionTarget = 'happy';
        let motionScore = 0;
        let lastFrameData = null;
        let stream = null;
        let frameInterval;
        let successCount = 0;
        const WIN_THRESHOLD = 15; // Reduced from 20 - easier to win

        // Back button
        backBtn.onclick = () => {
            cleanup();
            levelManager.loadMenu();
        };

        // Skip button for users without camera
        skipBtn.onclick = () => {
            cleanup();
            msg.innerText = "SKIPPING... (CAMERA SHY?)";
            msg.style.color = "var(--neon-orange)";
            setTimeout(() => {
                levelManager.completeLevel('level-0');
            }, 500);
        };

        // EMOTION TARGETS - weighted towards easier ones
        const EMOTIONS = ['happy', 'happy', 'sad']; // More happy, no angry (hardest)
        emotionTarget = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];

        updatePrompt();

        function updatePrompt() {
            if (emotionTarget === 'happy') {
                promptEl.innerText = "BE HAPPY! (WAVE YOUR HAND!)";
                promptEl.style.color = "var(--neon-green)";
            } else if (emotionTarget === 'sad') {
                promptEl.innerText = "BE SAD... (STAY STILL!)";
                promptEl.style.color = "var(--neon-blue)";
            } else if (emotionTarget === 'angry') {
                promptEl.innerText = "BE ANGRY! (SHAKE CAMERA!)";
                promptEl.style.color = "red";
            }
        }

        function cleanup() {
            clearInterval(frameInterval);
            if (stream) stream.getTracks().forEach(t => t.stop());
        }

        // Camera Setup
        navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
            .then(s => {
                stream = s;
                video.srcObject = stream;
                overlay.style.display = 'none';
                skipBtn.style.display = 'none'; // Hide skip if camera works
                startProcessing();
            })
            .catch(err => {
                overlay.innerText = "NO CAMERA ACCESS";
                overlay.style.fontSize = "1rem";
                msg.innerText = "Use SKIP button to continue!";
                msg.style.color = "var(--neon-orange)";
            });

        function startProcessing() {
            frameInterval = setInterval(() => {
                ctx.drawImage(video, 0, 0, 320, 240);

                const imageData = ctx.getImageData(0, 0, 320, 240);
                const data = imageData.data;

                // Motion Detection
                let score = 0;
                if (lastFrameData) {
                    for (let i = 0; i < data.length; i += 4 * 10) {
                        const diff = Math.abs(data[i] - lastFrameData[i]) +
                            Math.abs(data[i + 1] - lastFrameData[i + 1]) +
                            Math.abs(data[i + 2] - lastFrameData[i + 2]);
                        if (diff > 40) score++; // Lower threshold (was 50)
                    }
                }
                lastFrameData = data;

                // Normalize Score - more sensitive
                motionScore = Math.min((score / 300) * 100, 100); // Was 500

                updateGameLogic();

            }, 100);
        }

        function updateGameLogic() {
            bar.style.width = `${motionScore}%`;

            let passed = false;

            if (emotionTarget === 'happy') {
                // Happy = Medium-High Motion (easier range)
                if (motionScore > 15 && motionScore < 90) passed = true;
                msg.innerText = motionScore > 15 ? "GOOD VIBES! KEEP GOING!" : "WAVE YOUR HAND!";
            } else if (emotionTarget === 'sad') {
                // Sad = Low Motion (easier threshold)
                if (motionScore < 10) passed = true;
                msg.innerText = motionScore < 10 ? "SADNESS DETECTED..." : "STOP MOVING!";
            } else if (emotionTarget === 'angry') {
                // Angry = High Motion
                if (motionScore > 60) passed = true;
                msg.innerText = motionScore > 60 ? "RAGE MODE!" : "SHAKE MORE!";
            }

            if (passed) {
                successCount += 2; // Faster progress
                bar.style.background = "var(--neon-green)";
                bar.style.boxShadow = "0 0 10px var(--neon-green)";
            } else {
                successCount = Math.max(0, successCount - 1); // Slower decay (was -2)
                bar.style.background = "";
                bar.style.boxShadow = "";
            }

            // Show progress
            const progressPercent = Math.min(Math.floor((successCount / WIN_THRESHOLD) * 100), 100);
            progressEl.innerText = `PROGRESS: ${progressPercent}%`;

            if (successCount > 5) {
                promptEl.style.textShadow = `0 0 ${successCount}px white`;
            }

            if (successCount >= WIN_THRESHOLD) {
                passLevel();
            }
        }

        function passLevel() {
            cleanup();

            msg.innerText = "ACCESS GRANTED!";
            msg.style.color = "#39ff14";
            promptEl.innerText = "✓ VERIFIED HUMAN";
            progressEl.innerText = "PROGRESS: 100%";

            setTimeout(() => {
                levelManager.completeLevel('level-0');
            }, 1000);
        }

        this.cleanup = cleanup;
    },
    cleanup: () => { }
};
