export default {
    id: 'level-9',
    title: 'ASCII Artist',
    description: 'Type a smiley face :)',
    html: `
        <div class="game-container beveled-panel">
            <h3>Level 9: Modern Art</h3>
            <p>Draw me a smile using text.</p>
            <input type="text" id="l9-input" class="beveled-input" style="height: 60px; font-size: 2rem; text-align: center;" maxlength="2">
            <p id="l9-msg" class="feedback-text"></p>
            <button class="beveled-btn small" id="l9-back-btn">Back</button>
        </div>
    `,
    init: (levelManager) => {
        const input = document.getElementById('l9-input');
        const msg = document.getElementById('l9-msg');
        const backBtn = document.getElementById('l9-back-btn');

        backBtn.onclick = () => levelManager.loadMenu();

        input.oninput = () => {
            if (input.value === ':)' || input.value === ':-)' || input.value === '😊') {
                msg.innerText = "🎨 MASTERPIECE!";
                msg.style.color = "#39ff14";
                input.disabled = true;
                setTimeout(() => levelManager.completeLevel('level-9'), 1500);
            } else {
                msg.innerText = "";
            }
        };
    },
    cleanup: () => { }
};
