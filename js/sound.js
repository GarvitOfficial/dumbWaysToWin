// Sound Manager - Web Audio API based (no external files needed)
class SoundManager {
    constructor() {
        this.audioCtx = null;
        this.enabled = true;
        this.bgmEnabled = true;
        this.bgmGain = null;
        this.bgmOsc = null;

        // Try to load preference
        const savedSound = localStorage.getItem('silly_sound');
        if (savedSound === 'off') this.enabled = false;

        const savedBgm = localStorage.getItem('silly_bgm');
        if (savedBgm === 'off') this.bgmEnabled = false;
    }

    init() {
        if (this.audioCtx) return;
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
            this.enabled = false;
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('silly_sound', this.enabled ? 'on' : 'off');
        return this.enabled;
    }

    toggleBgm() {
        this.bgmEnabled = !this.bgmEnabled;
        localStorage.setItem('silly_bgm', this.bgmEnabled ? 'on' : 'off');
        if (!this.bgmEnabled) this.stopBgm();
        return this.bgmEnabled;
    }

    // Click/tap sound
    click() {
        if (!this.enabled) return;
        this.init();
        this.playTone(800, 0.05, 'square', 0.15);
    }

    // Button hover
    hover() {
        if (!this.enabled) return;
        this.init();
        this.playTone(400, 0.02, 'sine', 0.1);
    }

    // Level complete fanfare
    win() {
        if (!this.enabled) return;
        this.init();
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.15, 'square', 0.2), i * 100);
        });
    }

    // Level fail
    fail() {
        if (!this.enabled) return;
        this.init();
        this.playTone(200, 0.3, 'sawtooth', 0.2);
        setTimeout(() => this.playTone(150, 0.4, 'sawtooth', 0.15), 200);
    }

    // Collect/score
    collect() {
        if (!this.enabled) return;
        this.init();
        this.playTone(880, 0.05, 'sine', 0.15);
        setTimeout(() => this.playTone(1100, 0.05, 'sine', 0.1), 50);
    }

    // Jump
    jump() {
        if (!this.enabled) return;
        this.init();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.frequency.setValueAtTime(300, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
    }

    // Generic tone player
    playTone(freq, duration, type = 'sine', volume = 0.1) {
        if (!this.audioCtx) return;
        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.frequency.value = freq;
            osc.type = type;
            gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
            osc.start();
            osc.stop(this.audioCtx.currentTime + duration);
        } catch (e) { }
    }

    // Simple 8-bit style background music
    startBgm() {
        if (!this.bgmEnabled || !this.enabled) return;
        this.init();
        if (!this.audioCtx) return;

        // Simple arpeggio loop
        const melody = [262, 330, 392, 523, 392, 330]; // C4, E4, G4, C5, G4, E4
        let noteIndex = 0;

        this.bgmGain = this.audioCtx.createGain();
        this.bgmGain.gain.value = 0.05; // Very quiet
        this.bgmGain.connect(this.audioCtx.destination);

        const playNote = () => {
            if (!this.bgmEnabled) return;

            const osc = this.audioCtx.createOscillator();
            const noteGain = this.audioCtx.createGain();
            osc.connect(noteGain);
            noteGain.connect(this.bgmGain);

            osc.frequency.value = melody[noteIndex];
            osc.type = 'square';
            noteGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
            noteGain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);

            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.2);

            noteIndex = (noteIndex + 1) % melody.length;
        };

        this.bgmInterval = setInterval(playNote, 250);
    }

    stopBgm() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }
}

// Export singleton
export const sound = new SoundManager();

// Auto-attach click sounds to buttons
document.addEventListener('click', (e) => {
    if (e.target.matches('button, .beveled-btn, .level-btn')) {
        sound.click();
    }
});

document.addEventListener('mouseenter', (e) => {
    if (e.target.matches && e.target.matches('button, .beveled-btn, .level-btn')) {
        sound.hover();
    }
}, true);
