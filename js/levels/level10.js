export default {
    id: 'level-10',
    title: 'Reverse Captcha',
    description: 'Prove you are a ROBOT.',
    html: `
        <div class="game-container beveled-panel">
            <h3>Level 10: Security Check</h3>
            <p>Please complete specific security checks.</p>
            <div class="beveled-inset" style="padding: 20px; background: #eee; color: #000; display: flex; align-items: center; gap: 10px;">
                <input type="checkbox" id="l10-check" style="width: 30px; height: 30px;">
                <label for="l10-check" style="font-family: Arial, sans-serif;">I am a Robot 🤖</label>
            </div>
            <p id="l10-msg" class="feedback-text" style="margin-top:20px;"></p>
            <button class="beveled-btn small" id="l10-back-btn">Back</button>
        </div>
    `,
    init: (levelManager) => {
        const check = document.getElementById('l10-check');
        const msg = document.getElementById('l10-msg');
        const backBtn = document.getElementById('l10-back-btn');

        backBtn.onclick = () => levelManager.loadMenu();

        check.onchange = () => {
            if (check.checked) {
                msg.innerText = "🤖 WELCOME, MACHINE OVERLORD.";
                msg.style.color = "#39ff14";
                check.disabled = true;
                setTimeout(() => levelManager.completeLevel('level-10'), 1500);
            } else {
                msg.innerText = "❌ HUMANS NOT ALLOWED.";
                msg.style.color = "red";
            }
        };
    },
    cleanup: () => { }
};
