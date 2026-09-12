/**
 * Web Audio API Sound Synthesizer
 * สร้างเอฟเฟกต์เสียงแบบสังเคราะห์คุณภาพสูง โดยไม่ต้องใช้ไฟล์เสียงภายนอก
 */
class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // เสียงแตะสัมผัส (Cute Bubble Pop)
  playPop(freq = 480) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.8, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn('Audio playPop error:', e);
    }
  }

  // เสียงประกายดาวเวทมนตร์ (Sparkle Chime)
  playSparkle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      notes.forEach((freq, idx) => {
        const now = this.ctx.currentTime + (idx * 0.04);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.26);
      });
    } catch (e) {
      console.warn('Audio playSparkle error:', e);
    }
  }

  // เสียงตอบถูก / ชัยชนะ (Victory Fanfare)
  playSuccess() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const chords = [
        { f: 523.25, t: 0.00, d: 0.12 }, // C5
        { f: 659.25, t: 0.10, d: 0.12 }, // E5
        { f: 783.99, t: 0.20, d: 0.15 }, // G5
        { f: 1046.50, t: 0.32, d: 0.35 }  // C6
      ];

      chords.forEach(c => {
        const now = this.ctx.currentTime + c.t;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(c.f, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + c.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + c.d + 0.01);
      });
    } catch (e) {
      console.warn('Audio playSuccess error:', e);
    }
  }

  // เสียงตอบผิด / ลองใหม่ (Gentle Uh-Oh)
  playWrong() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {
      console.warn('Audio playWrong error:', e);
    }
  }

  // เสียงเหรียญ / ดาว (Star Ping)
  playStar() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch (e) {
      console.warn('Audio playStar error:', e);
    }
  }
}

const SoundFX = new SoundSynthesizer();

/**
 * Background Music (BGM) Manager
 * เล่นไฟล์ Funny BG เป็นเพลงพื้นหลัง กำหนดความดังเริ่มต้น 10% (0.10) และปรับระดับได้
 */
class BackgroundMusicManager {
  constructor(src = 'assets/Funny BG.mp3') {
    this.src = src;
    this.audio = null;
    this.defaultVolume = 0.10; // ระดับความดังเริ่มต้น 10% ตามที่กำหนด
    this.volume = this.defaultVolume;
    this.isEnabled = true;
    this.isPlaying = false;
    this.hasUserInteracted = false;
    this.listeners = [];

    // โหลดการตั้งค่าจาก localStorage (ถ้ามี)
    try {
      const savedVol = localStorage.getItem('bgm_volume');
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.volume = parsed;
        }
      }
      const savedEnabled = localStorage.getItem('bgm_enabled');
      if (savedEnabled !== null) {
        this.isEnabled = (savedEnabled === 'true');
      }
    } catch (e) {}

    this.initAudio();
  }

  initAudio() {
    if (!this.audio) {
      try {
        this.audio = new Audio();
        this.audio.src = this.src;
        this.audio.loop = true;
        this.audio.volume = this.volume;
        this.audio.preload = 'auto';

        this.audio.addEventListener('play', () => {
          this.isPlaying = true;
          this.notifyListeners();
        });
        this.audio.addEventListener('pause', () => {
          this.isPlaying = false;
          this.notifyListeners();
        });
        this.audio.addEventListener('ended', () => {
          this.isPlaying = false;
          this.notifyListeners();
        });
      } catch (e) {
        console.warn('BGM Init error:', e);
      }
    }
  }

  play() {
    this.initAudio();
    if (!this.audio) return;
    if (!this.isEnabled) return;

    this.audio.volume = this.volume;
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this.notifyListeners();
        })
        .catch((err) => {
          // รอการแตะสัมผัสหน้าจอจากผู้ใช้ตามนโยบาย Autoplay ของเบราว์เซอร์
          this.isPlaying = false;
          this.notifyListeners();
        });
    }
  }

  pause() {
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
    this.notifyListeners();
  }

  toggle() {
    if (this.isPlaying) {
      this.setEnabled(false);
    } else {
      this.setEnabled(true);
      if (this.volume <= 0.01) {
        this.setVolume(this.defaultVolume);
      }
      this.play();
    }
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    try {
      localStorage.setItem('bgm_enabled', enabled ? 'true' : 'false');
    } catch (e) {}

    if (enabled) {
      this.play();
    } else {
      this.pause();
    }
    this.notifyListeners();
  }

  setVolume(vol) {
    vol = Math.max(0, Math.min(1, parseFloat(vol) || 0));
    this.volume = vol;
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    try {
      localStorage.setItem('bgm_volume', this.volume.toString());
    } catch (e) {}

    if (this.volume <= 0.001) {
      if (this.audio && !this.audio.paused) {
        this.audio.pause();
      }
      this.isPlaying = false;
    } else {
      if (this.isEnabled) {
        if (!this.isPlaying && this.hasUserInteracted) {
          this.play();
        }
      }
    }
    this.notifyListeners();
  }

  getVolumePercent() {
    return Math.round(this.volume * 100);
  }

  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener);
    }
  }

  notifyListeners() {
    this.listeners.forEach(fn => {
      try { fn(this); } catch (e) {}
    });
  }

  // ปลดล็อกเล่นเสียงเมื่อผู้ใช้แตะสัมผัสหน้าจอครั้งแรก
  unlock() {
    if (!this.hasUserInteracted) {
      this.hasUserInteracted = true;
      if (this.isEnabled && !this.isPlaying && this.volume > 0) {
        this.play();
      }
    }
  }
}

const BGM = new BackgroundMusicManager('assets/Funny BG.mp3');

