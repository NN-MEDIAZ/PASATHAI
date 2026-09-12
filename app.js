/**
 * Thai Consonant Learning & Interactive Poster App
 * รองรับ:
 * 1. ระบบเสียงเด็กสดใส (Cute Child Voice Engine)
 * 2. ออกเสียงพยัญชนะไทยทั้ง ๔๔ ตัวถูกต้องตามสัทศาสตร์ 100%
 * 3. หมวดหมู่อักษรสูง กลาง ต่ำ (ไตรยางศ์) ออกเสียงถูกต้อง ชัดเจน
 * 4. เกมทายพยัญชนะ (Quiz Mode) เมื่อตอบถูกเปลี่ยนข้อให้อัตโนมัติ พร้อมระบบเสียงตรงเป๊ะ
 * 5. แถบแท็บปุ่มขยายใหญ่ กดง่าย สวยงาม
 */

class ThaiAlphabetApp {
  constructor() {
    this.currentConsonant = null;
    this.currentMode = 'explore'; // 'explore' | 'quiz' | 'karaoke'
    this.currentFilter = 'all';   // 'all' | 'mid' | 'high' | 'low'
    
    // Quiz state
    this.quizTarget = null;
    this.previousQuizTargetId = null;
    this.score = 0;
    this.streak = 0;
    this.isProcessingQuizAnswer = false;
    this.quizAdvanceTimer = null;

    // Karaoke state
    this.isKaraokeRunning = false;
    this.karaokeIndex = 0;
    this.karaokeTimer = null;

    // Toast Timer
    this.toastTimer = null;

    // Elements
    this.posterFrame = document.getElementById('posterFrame');
    this.hotspotLayer = document.getElementById('hotspotLayer');
    this.modalBackdrop = document.getElementById('modalBackdrop');
    this.settingsBackdrop = document.getElementById('settingsBackdrop');
    this.gameHudBar = document.getElementById('gameHudBar');
    this.quickToast = document.getElementById('quickToast');
    this.toastText = document.getElementById('toastText');
    this.toastIcon = document.getElementById('toastIcon');
    
    this.fxCanvas = document.getElementById('fxCanvas');
    this.fxCtx = this.fxCanvas.getContext('2d');
    this.particles = [];

    this.initCanvas();
    this.initHotspots();
    this.initEventListeners();
    this.renderCanvasLoop();
  }

  initCanvas() {
    const resize = () => {
      this.fxCanvas.width = window.innerWidth;
      this.fxCanvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
  }

  // สร้าง Hotspot สัมผัสบนพยัญชนะทั้ง 44 ตัวตามพิกัดโปสเตอร์ Board.png
  initHotspots() {
    this.hotspotLayer.innerHTML = '';

    const boardWidth = 1492.0;
    const boardHeight = 1054.0;
    const colLefts = [14, 148, 282, 416, 550, 684, 818, 952, 1076, 1210, 1352];
    const rowTops = [186, 396, 609, 818];
    const cardWidth = 127;
    const rowHeights = [192, 192, 191, 192];

    THAI_ALPHABET_DATA.forEach((item, index) => {
      const row = Math.floor(index / 11);
      const col = index % 11;

      const left = (colLefts[col] / boardWidth) * 100;
      const top = (rowTops[row] / boardHeight) * 100;
      const width = (cardWidth / boardWidth) * 100;
      const height = (rowHeights[row] / boardHeight) * 100;

      const tile = document.createElement('div');
      tile.className = 'hotspot-tile';
      tile.id = `hotspot-${item.id}`;
      tile.dataset.id = item.id;
      tile.dataset.group = item.group;
      tile.title = `${item.full} (${item.group}) - แตะฟังเสียง / แตะค้างดูการ์ด 3D`;

      tile.style.left = `${left}%`;
      tile.style.top = `${top}%`;
      tile.style.width = `${width}%`;
      tile.style.height = `${height}%`;

      // Mini corner badge for Trigram group
      const badge = document.createElement('span');
      badge.className = 'tile-group-badge';
      if (item.group === 'อักษรกลาง') {
        badge.innerText = 'กลาง';
        badge.style.backgroundColor = '#2563eb';
      } else if (item.group === 'อักษรสูง') {
        badge.innerText = 'สูง';
        badge.style.backgroundColor = '#10b981';
      } else if (item.group === 'อักษรต่ำเดี่ยว') {
        badge.innerText = 'ต่ำเดี่ยว';
        badge.style.backgroundColor = '#f59e0b';
      } else if (item.group === 'อักษรต่ำคู่') {
        badge.innerText = 'ต่ำคู่';
        badge.style.backgroundColor = '#ea580c';
      } else {
        badge.innerText = 'ต่ำ';
        badge.style.backgroundColor = '#f59e0b';
      }
      tile.appendChild(badge);

      // Event Handling: สัมผัสปุ๊บเสียงมาทันที 0ms (Instant Touch Response) + กดค้างเปิดการ์ด 3D
      let holdTimer = null;
      let hasTriggeredHold = false;

      const startPress = (e) => {
        hasTriggeredHold = false;
        tile.classList.add('holding');
        tile.classList.add('touched');

        const rect = tile.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : rect.left + rect.width / 2);
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : rect.top + rect.height / 2);

        this.spawnTouchParticles(clientX, clientY, item.groupColor);

        if (this.currentMode === 'quiz') {
          // โหมดเกม: ตรวจคำตอบทันที 0ms
          this.handleQuizAnswer(item, tile);
        } else {
          // โหมดเรียนรู้: เล่นเสียงทันที 0ms + แสดง Toast แจ้งเตือน
          SoundFX.playPop(540);
          SpeechEngine.speakConsonant(item);
          this.showQuickToast(item);

          // จับเวลาแตะค้าง 420ms เพื่อเปิดการ์ด 3D
          holdTimer = setTimeout(() => {
            hasTriggeredHold = true;
            tile.classList.remove('holding');
            SoundFX.playSparkle();
            this.openConsonantModal(item);
          }, 420);
        }
      };

      const endPress = () => {
        if (holdTimer) clearTimeout(holdTimer);
        tile.classList.remove('holding');
        setTimeout(() => tile.classList.remove('touched'), 200);
      };

      const cancelPress = () => {
        if (holdTimer) clearTimeout(holdTimer);
        tile.classList.remove('holding');
        tile.classList.remove('touched');
      };

      tile.addEventListener('pointerdown', startPress);
      tile.addEventListener('pointerup', endPress);
      tile.addEventListener('pointerleave', cancelPress);
      tile.addEventListener('pointercancel', cancelPress);

      this.hotspotLayer.appendChild(tile);
    });
  }

  // แสดง Toast แจ้งเตือนเมื่อแตะสั้น
  showQuickToast(item) {
    if (this.toastTimer) clearTimeout(this.toastTimer);

    let groupEmoji = '🔷';
    if (item.group === 'อักษรกลาง') groupEmoji = '🔷';
    else if (item.group === 'อักษรสูง') groupEmoji = '🟢';
    else if (item.group === 'อักษรต่ำเดี่ยว') groupEmoji = '🟡';
    else if (item.group === 'อักษรต่ำคู่') groupEmoji = '🟠';

    this.toastIcon.innerText = groupEmoji;
    this.toastText.innerHTML = `<strong>${item.full}</strong> (${item.group}) • <em>แตะค้างดูการ์ด 3D</em>`;
    this.quickToast.classList.add('show');

    this.toastTimer = setTimeout(() => {
      this.quickToast.classList.remove('show');
    }, 2000);
  }

  // แสดง Modal การ์ด 3D พร้อมรายละเอียด
  openConsonantModal(item) {
    this.currentConsonant = item;
    
    document.getElementById('modalCardImg').src = item.image;
    document.getElementById('modalCardTitle').innerText = item.full;
    document.getElementById('modalCardPhonics').innerText = `ออกเสียง "${item.phonics}" (${item.eng})`;
    
    const poemEl = document.getElementById('modalPoemText');
    if (poemEl) poemEl.innerText = `"${item.poem}"`;
    
    document.getElementById('modalClassBadge').innerText = item.group;
    document.getElementById('modalClassBadge').style.backgroundColor = item.groupColor;
    document.getElementById('modalSeqBadge').innerText = `ลำดับที่ ${item.id} / 44`;

    // คำศัพท์ตัวอย่าง ๓ คำ พร้อมเสียงอ่านชัดเจน
    const wordsContainer = document.getElementById('modalExampleWords');
    wordsContainer.innerHTML = '';
    const words = (item.examples && item.examples.length > 0) ? item.examples.slice(0, 3) : [];
    if (words.length > 0) {
      words.forEach(word => {
        const chip = document.createElement('span');
        chip.className = 'word-chip';
        chip.innerHTML = `<span class="chip-speaker-icon">🔊</span> <span>${word}</span>`;
        chip.title = `แตะฟังเสียงอ่าน "${word}"`;

        // Preload คำศัพท์นี้ล่วงหน้าเพื่อความเร็ว 0ms
        SpeechEngine.preloadWord(word, item);

        chip.addEventListener('click', (e) => {
          e.stopPropagation();

          // ลบคลาส playing จาก chip อื่นก่อนหน้า
          wordsContainer.querySelectorAll('.word-chip').forEach(c => c.classList.remove('playing'));
          chip.classList.add('playing');

          SoundFX.playPop(620);
          SpeechEngine.speakWord(word, item, () => {
            chip.classList.remove('playing');
          });

          // Timeout ป้องกันค้าง
          setTimeout(() => {
            chip.classList.remove('playing');
          }, 2000);
        });
        wordsContainer.appendChild(chip);
      });
    } else {
      const notice = document.createElement('div');
      notice.className = 'no-vocab-notice';
      notice.innerHTML = `<span>พยัญชนะนี้ปัจจุบันเลิกใช้แล้ว</span>`;
      wordsContainer.appendChild(notice);
    }

    this.modalBackdrop.classList.add('open');
  }

  closeConsonantModal() {
    this.modalBackdrop.classList.remove('open');
    SpeechEngine.stop();
  }

  navigateConsonant(direction) {
    if (!this.currentConsonant) return;
    let nextId = this.currentConsonant.id + direction;
    if (nextId < 1) nextId = 44;
    if (nextId > 44) nextId = 1;

    const nextItem = THAI_ALPHABET_DATA.find(d => d.id === nextId);
    if (nextItem) {
      this.openConsonantModal(nextItem);
      SoundFX.playPop(520);
      SpeechEngine.speakConsonant(nextItem);
    }
  }

  // === โหมดมินิเกมตามหาพยัญชนะ (Quiz Mode - Auto Next Question) ===
  startQuizMode() {
    this.currentMode = 'quiz';
    this.score = 0;
    this.streak = 0;
    this.isProcessingQuizAnswer = false;
    this.updateQuizStats();
    this.gameHudBar.classList.add('active');
    this.clearAllHighlights();
    this.nextQuizQuestion();
  }

  stopQuizMode() {
    this.currentMode = 'explore';
    this.gameHudBar.classList.remove('active');
    if (this.quizAdvanceTimer) clearTimeout(this.quizAdvanceTimer);
    this.isProcessingQuizAnswer = false;
    this.clearAllHighlights();
    SpeechEngine.stop();
  }

  nextQuizQuestion() {
    if (this.currentMode !== 'quiz') return;

    if (this.quizAdvanceTimer) clearTimeout(this.quizAdvanceTimer);
    this.clearAllHighlights();
    this.isProcessingQuizAnswer = false;

    // สุ่มพยัญชนะที่ไม่ซ้ำกับข้อก่อนหน้าทันที
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * THAI_ALPHABET_DATA.length);
    } while (THAI_ALPHABET_DATA[nextIndex].id === this.previousQuizTargetId && THAI_ALPHABET_DATA.length > 1);

    this.quizTarget = THAI_ALPHABET_DATA[nextIndex];
    this.previousQuizTargetId = this.quizTarget.id;

    // อัปเดตข้อความบนแถบ HUD
    const targetNameEl = document.getElementById('targetLetterName');
    if (targetNameEl) {
      targetNameEl.innerText = this.quizTarget.full;
      targetNameEl.classList.remove('pop-anim');
      void targetNameEl.offsetWidth; // Trigger reflow
      targetNameEl.classList.add('pop-anim');
    }

    // เล่นเสียงคำถามเสียงเด็กสดใส
    SpeechEngine.speakQuizQuestion(this.quizTarget);
  }

  handleQuizAnswer(item, tileElement) {
    if (!this.quizTarget || this.isProcessingQuizAnswer) return;

    if (item.id === this.quizTarget.id) {
      // === ตอบถูกต้อง ===
      this.isProcessingQuizAnswer = true;
      this.score += 10 + (this.streak * 2);
      this.streak += 1;
      this.updateQuizStats();

      // เอฟเฟกต์เสียงแห่งชัยชนะ + ดาว
      SoundFX.playSuccess();
      SoundFX.playStar();
      this.spawnConfetti();

      // ส่องแสงสีเขียวฉลองบนตัวอักษรที่ถูกต้อง
      tileElement.classList.add('quiz-correct-glow');

      // เล่นเสียงเด็กพูดชมยินดี
      SpeechEngine.speakQuizCorrect(item, () => {
        // เมื่อเสียงพูดจบหรือตามเวลา ให้เปลี่ยนข้อถัดไป
      });

      // หน่วงเวลาเปลี่ยนข้ออัตโนมัติอย่างสวยงาม (1.35 วินาที)
      this.quizAdvanceTimer = setTimeout(() => {
        tileElement.classList.remove('quiz-correct-glow');
        this.nextQuizQuestion();
      }, 1350);

    } else {
      // === ตอบผิด ===
      this.streak = 0;
      this.updateQuizStats();

      // เล่นเสียงเตือนแบบนุ่มนวล
      SoundFX.playWrong();

      // เขย่าตัวที่กดผิดเล็กน้อย
      tileElement.classList.add('quiz-wrong-shake');
      setTimeout(() => tileElement.classList.remove('quiz-wrong-shake'), 600);

      // เล่นเสียงเด็กพูดปลอบใจให้ลองหาใหม่
      SpeechEngine.speakQuizWrong();
    }
  }

  updateQuizStats() {
    const scoreEl = document.getElementById('quizScore');
    const streakEl = document.getElementById('quizStreak');
    if (scoreEl) scoreEl.innerText = this.score;
    if (streakEl) streakEl.innerText = `🔥 ${this.streak} ต่อเนื่อง`;
  }

  // === โหมดเล่นอัตโนมัติ ก-ฮ (Auto Karaoke Mode) ===
  toggleKaraoke() {
    if (this.isKaraokeRunning) {
      this.stopKaraoke();
    } else {
      this.startKaraoke();
    }
  }

  startKaraoke() {
    this.isKaraokeRunning = true;
    this.currentMode = 'karaoke';
    this.karaokeIndex = 0;
    const btn = document.getElementById('karaokeBtn');
    if (btn) {
      btn.classList.add('active-action');
      btn.innerHTML = '<span class="btn-icon">⏹️</span> <span class="btn-text">หยุดท่อง</span>';
    }
    this.playKaraokeStep();
  }

  stopKaraoke() {
    this.isKaraokeRunning = false;
    this.currentMode = 'explore';
    if (this.karaokeTimer) clearTimeout(this.karaokeTimer);
    const btn = document.getElementById('karaokeBtn');
    if (btn) {
      btn.classList.remove('active-action');
      btn.innerHTML = '<span class="btn-icon">🎵</span> <span class="btn-text">ท่อง ก-ฮ</span>';
    }
    this.clearAllHighlights();
    SpeechEngine.stop();
  }

  playKaraokeStep() {
    if (!this.isKaraokeRunning) return;
    if (this.karaokeIndex >= THAI_ALPHABET_DATA.length) {
      this.stopKaraoke();
      SoundFX.playSuccess();
      SpeechEngine.speak('เก่งมาก ท่องพยัญชนะไทยครบแล้ว');
      return;
    }

    const item = THAI_ALPHABET_DATA[this.karaokeIndex];
    this.clearAllHighlights();

    const tile = document.getElementById(`hotspot-${item.id}`);
    if (tile) {
      tile.classList.add('karaoke-current');
      const rect = tile.getBoundingClientRect();
      this.spawnTouchParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, item.groupColor);
    }

    SpeechEngine.speakConsonant(item, () => {
      if (this.isKaraokeRunning) {
        this.karaokeIndex++;
        this.karaokeTimer = setTimeout(() => this.playKaraokeStep(), 350);
      }
    });
  }

  clearAllHighlights() {
    document.querySelectorAll('.hotspot-tile').forEach(t => {
      t.classList.remove('highlight-active', 'karaoke-current', 'quiz-correct-glow', 'quiz-wrong-shake');
    });
  }

  // === ระบบจำแนกไตรยางศ์ (อักษรสูง กลาง ต่ำเดี่ยว ต่ำคู่) ===
  applyFilter(groupName) {
    this.currentFilter = groupName;
    
    // อัปเดตสถานะปุ่มกด
    document.querySelectorAll('.filter-chip').forEach(c => {
      c.classList.remove(
        'active-all', 
        'active-mid', 
        'active-high', 
        'active-low-single', 
        'active-low-pair', 
        'active-low'
      );
    });

    const activeChip = document.getElementById(`filter-${groupName}`);
    if (activeChip) {
      if (groupName === 'all') activeChip.classList.add('active-all');
      else if (groupName === 'mid') activeChip.classList.add('active-mid');
      else if (groupName === 'high') activeChip.classList.add('active-high');
      else if (groupName === 'low-single') activeChip.classList.add('active-low-single');
      else if (groupName === 'low-pair') activeChip.classList.add('active-low-pair');
      else if (groupName === 'low') activeChip.classList.add('active-low');
    }

    const groupMap = {
      'mid': ['อักษรกลาง'],
      'high': ['อักษรสูง'],
      'low-single': ['อักษรต่ำเดี่ยว'],
      'low-pair': ['อักษรต่ำคู่'],
      'low': ['อักษรต่ำเดี่ยว', 'อักษรต่ำคู่', 'อักษรต่ำ']
    };

    // ล้างคลาสกรอบสีก่อนหน้าทั้งหมด
    document.querySelectorAll('.hotspot-tile').forEach(tile => {
      tile.classList.remove(
        'filter-mid-active', 
        'filter-high-active', 
        'filter-low-single-active', 
        'filter-low-pair-active', 
        'filter-low-active', 
        'dimmed'
      );
    });

    if (groupName === 'all') {
      SpeechEngine.speakTrigramClass('all');
      return;
    }

    const targetGroups = groupMap[groupName] || [];

    // เพิ่มกรอบสีเรืองแสงนีออนล้อมรอบตัวอักษรที่ตรงกับหมวดหมู่อย่างชัดเจน
    document.querySelectorAll('.hotspot-tile').forEach(tile => {
      if (targetGroups.includes(tile.dataset.group)) {
        if (groupName === 'mid') tile.classList.add('filter-mid-active');
        else if (groupName === 'high') tile.classList.add('filter-high-active');
        else if (groupName === 'low-single') tile.classList.add('filter-low-single-active');
        else if (groupName === 'low-pair') tile.classList.add('filter-low-pair-active');
        else if (groupName === 'low') tile.classList.add('filter-low-active');
      } else {
        tile.classList.add('dimmed');
      }
    });

    // ออกเสียงอธิบายหมวดหมู่ไตรยางศ์อย่างถูกต้อง
    SpeechEngine.speakTrigramClass(groupName);
  }

  // === Particle Canvas Engine ===
  spawnTouchParticles(x, y, color = '#fbbf24') {
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4);
      const speed = Math.random() * 4 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: Math.random() * 6 + 3,
        color: color,
        alpha: 1,
        life: 1,
        decay: Math.random() * 0.035 + 0.025,
        shape: Math.random() > 0.5 ? 'star' : 'circle'
      });
    }
  }

  spawnConfetti() {
    const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#fbbf24'];
    for (let i = 0; i < 60; i++) {
      this.particles.push({
        x: window.innerWidth * Math.random(),
        y: -20,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 5 + 3,
        size: Math.random() * 9 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 1,
        decay: Math.random() * 0.015 + 0.008,
        shape: 'rect',
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2
      });
    }
  }

  renderCanvasLoop() {
    this.fxCtx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.life -= p.decay;
      p.alpha = Math.max(0, p.life);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.fxCtx.save();
      this.fxCtx.globalAlpha = p.alpha;
      this.fxCtx.fillStyle = p.color;

      if (p.shape === 'star') {
        this.drawStar(this.fxCtx, p.x, p.y, 5, p.size, p.size / 2);
      } else if (p.shape === 'rect') {
        this.fxCtx.translate(p.x, p.y);
        this.fxCtx.rotate(p.rot || 0);
        this.fxCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        p.rot += p.vRot || 0;
      } else {
        this.fxCtx.beginPath();
        this.fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.fxCtx.fill();
      }

      this.fxCtx.restore();
    }

    requestAnimationFrame(() => this.renderCanvasLoop());
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;
      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  initEventListeners() {
    // Mode Buttons
    const exploreBtn = document.getElementById('exploreModeBtn');
    const quizBtn = document.getElementById('quizModeBtn');

    exploreBtn.addEventListener('click', () => {
      exploreBtn.classList.add('active');
      quizBtn.classList.remove('active');
      this.stopQuizMode();
      if (this.isKaraokeRunning) this.stopKaraoke();
      SoundFX.playPop(500);
    });

    quizBtn.addEventListener('click', () => {
      quizBtn.classList.add('active');
      exploreBtn.classList.remove('active');
      if (this.isKaraokeRunning) this.stopKaraoke();
      SoundFX.playSparkle();
      this.startQuizMode();
    });

    document.getElementById('karaokeBtn').addEventListener('click', () => {
      if (this.currentMode === 'quiz') this.stopQuizMode();
      this.toggleKaraoke();
    });

    // Repeat Voice Button in Quiz
    const repeatBtn = document.getElementById('repeatQuizVoiceBtn');
    if (repeatBtn) {
      repeatBtn.addEventListener('click', () => {
        if (this.quizTarget) {
          SoundFX.playPop(520);
          SpeechEngine.speakQuizQuestion(this.quizTarget);
        }
      });
    }

    // Trigram Filter Chips
    const fAll = document.getElementById('filter-all');
    if (fAll) fAll.addEventListener('click', () => {
      SoundFX.playPop(480);
      this.applyFilter('all');
    });

    const fMid = document.getElementById('filter-mid');
    if (fMid) fMid.addEventListener('click', () => {
      SoundFX.playPop(520);
      this.applyFilter('mid');
    });

    const fHigh = document.getElementById('filter-high');
    if (fHigh) fHigh.addEventListener('click', () => {
      SoundFX.playPop(560);
      this.applyFilter('high');
    });

    const fLowSingle = document.getElementById('filter-low-single');
    if (fLowSingle) fLowSingle.addEventListener('click', () => {
      SoundFX.playPop(460);
      this.applyFilter('low-single');
    });

    const fLowPair = document.getElementById('filter-low-pair');
    if (fLowPair) fLowPair.addEventListener('click', () => {
      SoundFX.playPop(440);
      this.applyFilter('low-pair');
    });

    const fLow = document.getElementById('filter-low');
    if (fLow) fLow.addEventListener('click', () => {
      SoundFX.playPop(440);
      this.applyFilter('low');
    });

    // Modal Events
    document.getElementById('modalCloseBtn').addEventListener('click', () => this.closeConsonantModal());
    this.modalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.modalBackdrop) this.closeConsonantModal();
    });

    document.getElementById('prevCardBtn').addEventListener('click', () => this.navigateConsonant(-1));
    document.getElementById('nextCardBtn').addEventListener('click', () => this.navigateConsonant(1));
    
    // Voice Buttons in Card
    const speakMainBtn = document.getElementById('modalSpeakMainBtn');
    if (speakMainBtn) {
      speakMainBtn.addEventListener('click', () => {
        if (this.currentConsonant) {
          SoundFX.playPop(600);
          SpeechEngine.speakConsonant(this.currentConsonant);
        }
      });
    }

    const speakNameBtn = document.getElementById('modalSpeakNameBtn');
    if (speakNameBtn) {
      speakNameBtn.addEventListener('click', () => {
        if (this.currentConsonant) {
          SoundFX.playPop(580);
          SpeechEngine.speakConsonant(this.currentConsonant);
        }
      });
    }

    const speakPoemBtn = document.getElementById('modalSpeakPoemBtn');
    if (speakPoemBtn) {
      speakPoemBtn.addEventListener('click', () => {
        if (this.currentConsonant) {
          SoundFX.playSparkle();
          SpeechEngine.speakPoem(this.currentConsonant);
        }
      });
    }

    document.getElementById('modalPoemBox').addEventListener('click', () => {
      if (this.currentConsonant) {
        SoundFX.playSparkle();
        SpeechEngine.speakPoem(this.currentConsonant);
      }
    });

    document.getElementById('modalCardImgWrap').addEventListener('click', () => {
      if (this.currentConsonant) {
        SoundFX.playPop();
        SpeechEngine.speakConsonant(this.currentConsonant);
      }
    });

    window.addEventListener('keydown', (e) => {
      if (this.modalBackdrop.classList.contains('open')) {
        if (e.key === 'ArrowLeft') this.navigateConsonant(-1);
        if (e.key === 'ArrowRight') this.navigateConsonant(1);
        if (e.key === 'Escape') this.closeConsonantModal();
      }
    });

    // Settings Modal
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsCloseBtn = document.getElementById('settingsCloseBtn');

    settingsBtn.addEventListener('click', () => {
      SoundFX.playPop(500);
      this.settingsBackdrop.classList.add('open');
    });

    settingsCloseBtn.addEventListener('click', () => {
      this.settingsBackdrop.classList.remove('open');
    });

    this.settingsBackdrop.addEventListener('click', (e) => {
      if (e.target === this.settingsBackdrop) {
        this.settingsBackdrop.classList.remove('open');
      }
    });

    const speedSelect = document.getElementById('speechSpeedSelect');
    if (speedSelect) {
      speedSelect.addEventListener('change', (e) => {
        SpeechEngine.rate = parseFloat(e.target.value);
      });
    }

    const modeSelect = document.getElementById('speechModeSelect');
    if (modeSelect) {
      modeSelect.addEventListener('change', (e) => {
        SpeechEngine.setMode(e.target.value);
      });
    }

    // Bright Theme Selector
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        document.body.className = e.target.value;
        SoundFX.playSparkle();
      });
    }

    const soundFxToggle = document.getElementById('soundFxToggle');
    if (soundFxToggle) {
      soundFxToggle.addEventListener('change', (e) => {
        SoundFX.isMuted = !e.target.checked;
      });
    }

    // Fullscreen Button
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    fullscreenBtn.addEventListener('click', () => {
      SoundFX.playPop(520);
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.warn(err));
      } else {
        document.exitFullscreen();
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new ThaiAlphabetApp();

  // โหลดเสียงคำศัพท์ตัวอย่างทั้งหมดในระบบล่วงหน้า
  if (typeof THAI_ALPHABET_DATA !== 'undefined' && SpeechEngine.preloadAllVocabWords) {
    SpeechEngine.preloadAllVocabWords(THAI_ALPHABET_DATA);
  }

  const unlockAudio = () => {
    SoundFX.init();
    if (SpeechEngine.warmup) {
      SpeechEngine.warmup();
    }
    if (SpeechEngine.synth && SpeechEngine.synth.resume) {
      SpeechEngine.synth.resume();
    }
  };
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });
  window.addEventListener('click', unlockAudio, { once: true });
});
