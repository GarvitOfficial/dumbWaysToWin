export default {
    id: 'level-5',
    title: 'Don\'t Click',
    description: 'Do NOT click the button.',
    html: `
        <div class="game-container beveled-panel">
            <h3 style="color: var(--neon-pink)">Level 5: Reverse Psychology</h3>
            <p>Whatever you do... <span style="color: red; font-size: 1.2rem;">DO NOT CLICK!</span></p>
            
            <div class="canvas-wrapper beveled-inset" style="height: 300px; position: relative; background: #111; overflow: hidden;" id="l5-area">
                <button id="l5-trap-btn" class="beveled-btn" style="position: absolute; top: 40%; left: 35%;">CLICK ME!</button>
                <div id="l5-timer" style="position: absolute; top: 10px; right: 10px; color: var(--neon-pink); font-size: 1.5rem; text-shadow: 0 0 10px var(--neon-pink);">5.00</div>
            </div>
            
            <p id="l5-msg" style="font-size: 1rem; color: var(--neon-yellow); text-shadow: 0 0 10px var(--neon-yellow); min-height: 30px; margin-top: 15px;">👁️ I'M WATCHING YOU... 👁️</p>
            
            <button class="beveled-btn small" id="l5-back-btn">Back</button>
        </div>
    `,
    init: (levelManager) => {
        const btn = document.getElementById('l5-trap-btn');
        const area = document.getElementById('l5-area');
        const msg = document.getElementById('l5-msg');
        const timerEl = document.getElementById('l5-timer');
        const backBtn = document.getElementById('l5-back-btn');

        let timeLeft = 5.00;
        let interval;
        let won = false;

        // Watching messages that rotate
        const watchingMsgs = [
            "👁️ I'M WATCHING YOU... 👁️",
            "🔍 DON'T EVEN THINK ABOUT IT...",
            "⚠️ I SEE YOUR CURSOR...",
            "👀 RESIST THE URGE...",
            "🎯 STAY STRONG...",
            "⏳ JUST WAIT..."
        ];
        let msgIndex = 0;

        backBtn.onclick = () => {
            clearInterval(interval);
            levelManager.loadMenu();
        };

        // Trap Logic: Move button if they try to hover
        btn.onmouseover = () => {
            if (won) return;
            const x = Math.random() * (area.clientWidth - 100);
            const y = Math.random() * (area.clientHeight - 50);
            btn.style.left = `${x}px`;
            btn.style.top = `${y}px`;
            msg.innerText = "😏 NICE TRY! CAN'T CATCH ME!";
            msg.style.color = "var(--neon-blue)";
        };

        btn.onclick = () => {
            clearInterval(interval);
            msg.innerText = "💀 I TOLD YOU NOT TO CLICK! FAIL!";
            msg.style.color = "red";
            msg.style.textShadow = "0 0 10px red";
            btn.style.display = 'none';

            // Show retry option
            setTimeout(() => {
                btn.style.display = 'block';
                btn.innerText = '🔄 RETRY';
                btn.style.left = '35%';
                btn.style.top = '40%';
                btn.onclick = () => {
                    location.reload(); // Simple reset
                };
            }, 1500);
        };

        // Timer with rotating messages
        interval = setInterval(() => {
            timeLeft -= 0.01;
            timerEl.innerText = timeLeft.toFixed(2);

            // Rotate watching message every 0.8 seconds
            if (Math.floor(timeLeft * 100) % 80 === 0) {
                msgIndex = (msgIndex + 1) % watchingMsgs.length;
                msg.innerText = watchingMsgs[msgIndex];
                msg.style.color = "var(--neon-yellow)";
            }

            // Urgency as time runs low
            if (timeLeft < 2) {
                timerEl.style.color = "var(--neon-green)";
                timerEl.style.animation = "blink 0.3s steps(2) infinite";
            }

            if (timeLeft <= 0) {
                clearInterval(interval);
                won = true;
                timerEl.innerText = "0.00";
                timerEl.style.animation = "";
                msg.innerText = "🎉 YOU WON! (BY DOING NOTHING!)";
                msg.style.color = "#39ff14";
                msg.style.textShadow = "0 0 20px #39ff14";
                btn.style.display = 'none';
                setTimeout(() => levelManager.completeLevel('level-5'), 1500);
            }
        }, 10);
    },
    cleanup: () => { }
};
