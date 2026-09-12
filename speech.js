/**
 * Thai Audio & Speech Engine (ระบบเสียงอ่านภาษาไทยความเร็วสูง เล่นทันที 0ms ไม่มีดีเลย์)
 * เล่นเสียงพยัญชนะไทย ๔๔ ตัว, บทกลอน, โจทย์มินิเกม, คำตอบถูก/ผิด, คำอธิบายไตรยางศ์จังหวะพอดี, และคำศัพท์ตัวอย่างทั้งหมด 100%
 */
class GoogleSpeechPlayer {
  constructor() {
    this.speechMode = 'full'; // 'full' (ก ไก่) | 'poem' (กอ เอ๋ย กอ ไก่)
    this.currentAudio = null;
    this.rate = 1.0;

    // Web Speech API
    this.synth = window.speechSynthesis || null;
    this.thaiVoice = null;
    this.initWebSpeech();

    // แคช Audio Objects ในหน่วยความจำเพื่อให้เล่นได้ทันที < 1ms
    this.audioPool = {};
    this.wordAudioCache = {};

    // พจนานุกรมคำอ่านสัทศาสตร์สำหรับคำศัพท์ทั้งหมด 100% (ออกเสียงเป๊ะ ชัดเจน รวดเร็ว ถูกต้องตามหลักภาษาไทย)
    this.phoneticWordMap = {
      // คำศัพท์ตัวอย่าง ก-ฮ
      "กา": "กา",
      "กบ": "กบ",
      "กล้วย": "กล้วย",
      "ขา": "ขา",
      "ข้าว": "ข้าว",
      "เข็ม": "เข็ม",
      "ค้อน": "ค้อน",
      "ครู": "ครู",
      "เค้ก": "เค้ก",
      "ฆ้อง": "ค้อง",
      "โฆษณา": "โคดสะนา",
      "ฆาตกร": "คาดตะกอน",
      "เงาะ": "เงาะ",
      "เงิน": "เงิน",
      "งาน": "งาน",
      "จดหมาย": "จดหมาย",
      "จรวด": "จะหรวด",
      "จิงโจ้": "จิงโจ้",
      "ฉลาม": "ฉะหลาม",
      "ฉัตร": "ฉัด",
      "ฉลาก": "ฉะหลาก",
      "ช้อน": "ช้อน",
      "ชาม": "ชาม",
      "ชมพู่": "ชมพู่",
      "ซอส": "ซอส",
      "ซาลาเปา": "ซาลาเปา",
      "ซากุระ": "ซากุระ",
      "ฌาน": "ชาน",
      "ฌาปนกิจ": "ชาปะนะกิด",
      "ฌาปนสถาน": "ชาปะนะสะถาน",
      "ญาติ": "ยาด",
      "ญี่ปุ่น": "ยี่ปุ่น",
      "ญาณ": "ยาน",
      "ฎีกา": "ดีกา",
      "กฎหมาย": "กดหมาย",
      "มงกุฎ": "มงกุด",
      "ปฏิทิน": "ปะติทิน",
      "ปฏิบัติ": "ปะติบัด",
      "ปฏิเสธ": "ปะติเสด",
      "รัฐบาล": "รัดถะบาน",
      "เศรษฐี": "เสดถี",
      "อัฐิ": "อัดถิ",
      "บัณฑิต": "บันดิด",
      "ครุฑ": "ครุด",
      "มณฑล": "มนทน",
      "พัฒนา": "พัดทะนา",
      "วัฒนธรรม": "วัดทะนะทำ",
      "วุฒิ": "วุด",
      "ณรงค์": "นะรง",
      "คุณครู": "คุนครู",
      "โบราณ": "โบราน",
      "วิชาการ": "วิชากาน",
      "ดาว": "ดาว",
      "ดอกไม้": "ดอกไม้",
      "ดินสอ": "ดินสอ",
      "ต้นไม้": "ต้นไม้",
      "โต๊ะ": "โต๊ะ",
      "แตงโม": "แตงโม",
      "ถ้วย": "ถ้วย",
      "ถัง": "ถัง",
      "ถั่ว": "ถั่ว",
      "ทะเล": "ทะเล",
      "ทอง": "ทอง",
      "ทุเรียน": "ทุเรียน",
      "เธอ": "เธอ",
      "ธนู": "ทะนู",
      "ธรรมชาติ": "ทำมะชาด",
      "นก": "นก",
      "น้ำ": "น้ำ",
      "นาฬิกา": "นาลิกา",
      "บ้าน": "บ้าน",
      "บอล": "บอน",
      "บัว": "บัว",
      "เป็ด": "เป็ด",
      "ป่า": "ป่า",
      "ปากกา": "ปากกา",
      "ผ้า": "ผ้า",
      "ผัก": "ผัก",
      "ผลไม้": "ผนละไม้",
      "ฝน": "ฝน",
      "ฝรั่ง": "ฝะหรั่ง",
      "ฝัน": "ฝัน",
      "พ่อ": "พ่อ",
      "พี่": "พี่",
      "พัดลม": "พัดลม",
      "ฟ้า": "ฟ้า",
      "ฟุตบอล": "ฟุดบอน",
      "ฟองน้ำ": "ฟองน้ำ",
      "ภูเขา": "พูเขา",
      "ภาพ": "พาบ",
      "ภาษา": "พาสา",
      "แม่": "แม่",
      "แมว": "แมว",
      "มะม่วง": "มะม่วง",
      "ยา": "ยา",
      "ยิ้ม": "ยิ้ม",
      "ยางลบ": "ยางลบ",
      "รถ": "รด",
      "ร่ม": "ร่ม",
      "โรงเรียน": "โรงเรียน",
      "ลูกบอล": "ลูกบอน",
      "ลม": "ลม",
      "ลำโพง": "ลำโพง",
      "วัว": "วัว",
      "ว่าว": "ว่าว",
      "แว่นตา": "แว่นตา",
      "ศิลปะ": "สินละปะ",
      "ศุกร์": "สุก",
      "ศูนย์": "สูน",
      "กระดาษ": "กระดาด",
      "เศษ": "เสด",
      "พิษ": "พิด",
      "สิงโต": "สิงโต",
      "ส้ม": "ส้ม",
      "สมุด": "สะหมุด",
      "หอย": "หอย",
      "ห้อง": "ห้อง",
      "เห็ด": "เห็ด",
      "กีฬา": "กีลา",
      "วาฬ": "วาน",
      "องุ่น": "อะหงุ่น",
      "อาหาร": "อานหาน",
      "โอ่ง": "โอ่ง",
      "ฮิปโป": "ฮิบโป",
      "เฮลิคอปเตอร์": "เฮลิค็อบเตอร์",
      "ฮ่องกง": "ฮ่องกง",

      // เสียงตอบรับมินิเกม
      "เยี่ยมมาก": "เยี่ยมมาก",
      "ลองใหม่อีกครั้ง": "ลองใหม่อีกครั้ง"
    };

    // แผนที่คำศัพท์หลักไปยังไฟล์ MP3 ในเครื่อง (เล่นได้ทันที 0ms)
    this.primaryWordMap = {
      "ไก่": 1, "ไข่": 2, "ขวด": 3, "ควาย": 4, "คน": 5, "ระฆัง": 6, "งู": 7,
      "จาน": 8, "ฉิ่ง": 9, "ช้าง": 10, "โซ่": 11, "เฌอ": 12, "หญิง": 13,
      "ชฎา": 14, "ปฏัก": 15, "ฐาน": 16, "มณโฑ": 17, "ผู้เฒ่า": 18, "เณร": 19,
      "เด็ก": 20, "เต่า": 21, "ถุง": 22, "ทหาร": 23, "ธง": 24, "หนู": 25,
      "ใบไม้": 26, "ปลา": 27, "ผึ้ง": 28, "ฝา": 29, "พาน": 30, "ฟัน": 31,
      "สำเภา": 32, "ม้า": 33, "ยักษ์": 34, "เรือ": 35, "ลิง": 36, "แหวน": 37,
      "ศาลา": 38, "ฤๅษี": 39, "เสือ": 40, "หีบ": 41, "จุฬา": 42, "ว่าวจุฬา": 42,
      "อ่าง": 43, "นกฮูก": 44,
      "ก ไก่": 1, "ข ไข่": 2, "ฃ ขวด": 3, "ค ควาย": 4, "ฅ คน": 5, "ฆ ระฆัง": 6, "ง งู": 7,
      "จ จาน": 8, "ฉ ฉิ่ง": 9, "ช ช้าง": 10, "ซ โซ่": 11, "ฌ เฌอ": 12, "ญ หญิง": 13,
      "ฎ ชฎา": 14, "ฏ ปฏัก": 15, "ฐ ฐาน": 16, "ฑ มณโฑ": 17, "ฒ ผู้เฒ่า": 18, "ณ เณร": 19,
      "ด เด็ก": 20, "ต เต่า": 21, "ถ ถุง": 22, "ท ทหาร": 23, "ธ ธง": 24, "น หนู": 25,
      "บ ใบไม้": 26, "ป ปลา": 27, "ผ ผึ้ง": 28, "ฝ ฝา": 29, "พ พาน": 30, "ฟ ฟัน": 31,
      "ภ สำเภา": 32, "ม ม้า": 33, "ย ยักษ์": 34, "ร เรือ": 35, "ล ลิง": 36, "ว แหวน": 37,
      "ศ ศาลา": 38, "ษ ฤๅษี": 39, "ส เสือ": 40, "ห หีบ": 41, "ฬ จุฬา": 42, "อ อ่าง": 43, "ฮ นกฮูก": 44,
      "กอ ไก่": 1, "ขอ ไข่": 2, "ขอ ขวด": 3, "คอ ควาย": 4, "คอ คน": 5, "คอ ระฆัง": 6, "งอ งู": 7,
      "จอ จาน": 8, "ฉอ ฉิ่ง": 9, "ชอ ช้าง": 10, "ซอ โซ่": 11, "ชอ เฌอ": 12, "ยอ หญิง": 13,
      "ดอ ชะดา": 14, "ดอ ชฎา": 14, "ตอ ปะตัก": 15, "ตอ ปฏัก": 15, "ถอ ถาน": 16, "ถอ ฐาน": 16,
      "ทอ มนโท": 17, "ทอ มณโฑ": 17, "ทอ พู้เถ่า": 18, "ทอ ผู้เฒ่า": 18, "นอ เณร": 19,
      "ดอ เด็ก": 20, "ตอ เต่า": 21, "ถอ ถุง": 22, "ทอ ทหาร": 23, "ทอ ธง": 24, "นอ หนู": 25,
      "บอ ใบไม้": 26, "ปอ ปลา": 27, "ผอ ผึ้ง": 28, "ฝอ ฝา": 29, "พอ พาน": 30, "ฟอ ฟัน": 31,
      "พอ สำเภา": 32, "มอ ม้า": 33, "ยอ ยักษ์": 34, "รอ เรือ": 35, "ลอ ลิง": 36, "วอ แหวน": 37,
      "สอ สารับ": 38, "สอ ศาลา": 38, "สอ รือสี": 39, "สอ ฤๅษี": 39, "สอ เสือ": 40, "หอ หีบ": 41,
      "ลอ จุลา": 42, "ลอ จุฬา": 42, "ออ อ่าง": 43, "ฮอ นกฮูก": 44
    };

    // แผนที่ไฟล์เสียงหมวดหมู่อักษรไตรยางศ์ (เล่นจากไฟล์ MP3 ในเครื่องทันที 0ms)
    this.trigramAudioMap = {
      'all': 'assets/audio/trigram_all.mp3',
      'mid': 'assets/audio/trigram_mid.mp3',
      'high': 'assets/audio/trigram_high.mp3',
      'low-single': 'assets/audio/trigram_low_single.mp3',
      'low_single': 'assets/audio/trigram_low_single.mp3',
      'low-pair': 'assets/audio/trigram_low_pair.mp3',
      'low_pair': 'assets/audio/trigram_low_pair.mp3',
      'low': 'assets/audio/trigram_low.mp3'
    };

    // โหลดไฟล์เสียง MP3 ทั้งหมดล่วงหน้า
    this.preloadAllAudio();
  }

  // แปลงข้อความเป็น UTF-8 Hex String เพื่อระบุไฟล์เสียงใน assets/audio/vocab/
  getWordHex(str) {
    if (!str) return '';
    try {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(str);
      return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();
    } catch (e) {
      return '';
    }
  }

  // โหลดไฟล์เสียง MP3 ทั้งหมดเข้าหน่วยความจำล่วงหน้า
  preloadAllAudio() {
    const list = [
      'assets/audio/find.mp3',
      'assets/audio/correct.mp3',
      'assets/audio/wrong.mp3',
      'assets/audio/complete.mp3',
      'assets/audio/praise_correct.mp3',
      'assets/audio/praise_wrong.mp3',
      'assets/audio/trigram_all.mp3',
      'assets/audio/trigram_mid.mp3',
      'assets/audio/trigram_high.mp3',
      'assets/audio/trigram_low_single.mp3',
      'assets/audio/trigram_low_pair.mp3',
      'assets/audio/trigram_low.mp3'
    ];

    for (let i = 1; i <= 44; i++) {
      const idStr = String(i).padStart(2, '0');
      list.push(`assets/audio/${idStr}.mp3`);
      list.push(`assets/audio/poem_${idStr}.mp3`);
    }

    list.forEach(src => {
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = src;
        this.audioPool[src] = audio;
      } catch (e) {}
    });
  }

  // วอร์มอัพเครื่องยนต์เสียงพูดทันทีเมื่อผู้ใช้แตะหน้าจอครั้งแรก (ป้องกันอาการหน่วง & ปลดล็อก Audio บนมือถือ/เว็บออนไลน์)
  warmup() {
    if (this.synth) {
      try {
        if (this.synth.paused) this.synth.resume();
        const dummy = new SpeechSynthesisUtterance(' ');
        dummy.volume = 0.01;
        dummy.rate = 2.0;
        this.synth.speak(dummy);
      } catch (e) {}
    }

    // ปลดล็อก HTML5 Audio Autoplay Policy บน Mobile Safari / Chrome
    try {
      const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
      silentAudio.volume = 0.01;
      const p = silentAudio.play();
      if (p !== undefined) p.catch(() => {});
    } catch (e) {}
  }

  // โหลดคำศัพท์ตัวอย่างทั้งหมดล่วงหน้าใน background ทันที
  preloadAllVocabWords(alphabetData) {
    if (!alphabetData || !Array.isArray(alphabetData)) return;

    alphabetData.forEach(item => {
      if (item.examples && Array.isArray(item.examples)) {
        item.examples.forEach(w => {
          this.preloadWord(w, item);
        });
      }
    });
  }

  // เสียงหมวดหมู่อักษรสูง กลาง ต่ำเดี่ยว ต่ำคู่ (ไตรยางศ์) - เล่นจากไฟล์เสียง MP3 จริงทันที 0ms
  speakTrigramClass(groupKey, callback = null) {
    this.stop();
    const audioSrc = this.trigramAudioMap[groupKey];
    if (audioSrc) {
      this.playAudioFile(audioSrc, callback, () => {
        this.speakTrigramFallbackText(groupKey, callback);
      });
      return;
    }
    this.speakTrigramFallbackText(groupKey, callback);
  }

  speakTrigramFallbackText(groupKey, callback = null) {
    let text = '';
    if (groupKey === 'mid') {
      text = 'อักษรกลาง มี เก้า ตัว ท่องจำว่า ไก่ จิก เด็ก ตาย บน ปาก โอ่ง';
    } else if (groupKey === 'high') {
      text = 'อักษรสูง มี สิบเอ็ด ตัว ท่องจำว่า ผี ฝาก ถุง ข้าว สาร ให้ ฉัน';
    } else if (groupKey === 'low-single' || groupKey === 'low_single') {
      text = 'อักษรต่ำเดี่ยว มี สิบ ตัว ท่องจำว่า งู ใหญ่ นอน อยู่ ณ ริม วัด โม ฬี โลก';
    } else if (groupKey === 'low-pair' || groupKey === 'low_pair') {
      text = 'อักษรต่ำคู่ มี สิบสี่ ตัว ท่องจำว่า พ่อ ค้า ฟัน ทอง ซื้อ ช้าง ฮ่อ';
    } else if (groupKey === 'low') {
      text = 'อักษรต่ำ มี ยี่สิบสี่ ตัว แบ่งเป็น ต่ำเดี่ยว สิบ ตัว และ ต่ำคู่ สิบสี่ ตัว';
    } else {
      text = 'พยัญชนะไทย ทั้งหมด สี่สิบสี่ ตัว';
    }
    this.speakSentence(text, callback, 0.95);
  }

  // เล่นเสียงประโยคคำอธิบายด้วยความเร็วและจังหวะที่เป็นธรรมชาติ พอดี ไม่เร็วเกินไป และเล่นได้เสมอ 100%
  speakSentence(text, callback = null, customRate = 0.95) {
    if (!text || text.trim() === '') {
      if (callback) callback();
      return;
    }
    this.stop();

    const cleanText = text.trim();

    // 1. ลองใช้ Web Speech API ก่อนเสมอ
    if (this.synth) {
      try {
        if (this.synth.speaking || this.synth.pending) this.synth.cancel();
        if (this.synth.paused) this.synth.resume();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'th-TH';
        utterance.rate = (this.rate || 1.0) * customRate;
        const voice = this.getThaiVoice();
        if (voice) utterance.voice = voice;

        let hasStarted = false;
        let fallbackTimer = setTimeout(() => {
          if (!hasStarted) {
            console.warn('WebSpeech sentence timeout, fallback to online TTS');
            try { if (this.synth) this.synth.cancel(); } catch (e) {}
            this.fallbackToOnlineSentence(cleanText, callback, customRate);
          }
        }, 1200);

        utterance.onstart = () => {
          hasStarted = true;
          if (fallbackTimer) clearTimeout(fallbackTimer);
        };
        utterance.onend = () => {
          if (fallbackTimer) clearTimeout(fallbackTimer);
          if (callback) callback();
        };
        utterance.onerror = (e) => {
          if (fallbackTimer) clearTimeout(fallbackTimer);
          console.warn('WebSpeech sentence error:', e);
          if (!hasStarted) {
            this.fallbackToOnlineSentence(cleanText, callback, customRate);
          }
        };

        this.synth.speak(utterance);
        return;
      } catch (err) {
        console.warn('WebSpeech Sentence exception:', err);
      }
    }

    // 2. ถ้าไม่มี WebSpeech ให้เล่น Online TTS
    this.fallbackToOnlineSentence(cleanText, callback, customRate);
  }

  // เสียงประโยคออนไลน์สำรอง (ปรับความเร็วพอดี พร้อมเซิร์ฟเวอร์สำรอง)
  fallbackToOnlineSentence(cleanText, callback, customRate = 0.95) {
    const encoded = encodeURIComponent(cleanText);
    const googleUrl1 = `https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=${encoded}`;
    const googleUrl2 = `https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=gtx&q=${encoded}`;
    const respUrl = `https://texttospeech.responsivevoice.org/v1/text:synthesize?text=${encoded}&lang=th&engine=g1&key=jQZ2zcdq`;

    this.playAudioFile(googleUrl1, callback, () => {
      this.playAudioFile(googleUrl2, callback, () => {
        this.playAudioFile(respUrl, callback, null, false, customRate);
      }, false, customRate);
    }, false, customRate);
  }

  // โหลดแคชเสียงคำศัพท์รายคำ พร้อมดึงบัฟเฟอร์เข้า RAM
  preloadWord(word, consonantContext = null) {
    if (!word) return;
    const cleanWord = word.replace(/\(.*?\)/g, '').trim();
    if (!cleanWord || this.wordAudioCache[cleanWord]) return;

    if (this.primaryWordMap[cleanWord]) {
      const idStr = String(this.primaryWordMap[cleanWord]).padStart(2, '0');
      this.wordAudioCache[cleanWord] = this.audioPool[`assets/audio/${idStr}.mp3`];
      return;
    }

    const hex = this.getWordHex(cleanWord);
    if (hex) {
      const vocabSrc = `assets/audio/vocab/${hex}.mp3`;
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = vocabSrc;
        this.audioPool[vocabSrc] = audio;
        this.wordAudioCache[cleanWord] = audio;
        return;
      } catch (e) {}
    }
  }

  initWebSpeech() {
    if (!this.synth) return;
    const findVoice = () => {
      try {
        const voices = this.synth.getVoices();
        if (voices && voices.length > 0) {
          this.thaiVoice = voices.find(v => 
            (v.lang && v.lang.toLowerCase().replace('_', '-').startsWith('th')) ||
            (v.name && (v.name.includes('Thai') || v.name.includes('ภาษาไทย') || v.name.includes('Premwadee') || v.name.includes('Niwat') || v.name.includes('Achara') || v.name.includes('Kanya') || v.name.includes('Siri')))
          ) || null;
        }
      } catch (e) {}
    };

    findVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = findVoice;
    }
  }

  getThaiVoice() {
    if (!this.synth) return null;
    if (this.thaiVoice) return this.thaiVoice;
    try {
      const voices = this.synth.getVoices();
      if (voices && voices.length > 0) {
        this.thaiVoice = voices.find(v => 
          (v.lang && v.lang.toLowerCase().replace('_', '-').startsWith('th')) ||
          (v.name && (v.name.includes('Thai') || v.name.includes('ภาษาไทย') || v.name.includes('Premwadee') || v.name.includes('Niwat') || v.name.includes('Achara') || v.name.includes('Kanya') || v.name.includes('Siri')))
        ) || null;
      }
    } catch (e) {}
    return this.thaiVoice;
  }

  // เล่นเสียงพยัญชนะ (ก-ฮ) ทันที 0ms
  speakConsonant(consonantData, callback = null) {
    if (!consonantData) {
      if (callback) callback();
      return;
    }
    this.stop();

    const idStr = String(consonantData.id).padStart(2, '0');

    if (this.speechMode === 'poem') {
      const poemSrc = `assets/audio/poem_${idStr}.mp3`;
      this.playAudioFile(poemSrc, callback, () => {
        this.speakWord(consonantData.poem || consonantData.spokenPoem, consonantData, callback);
      });
      return;
    }

    // เล่นไฟล์เสียง MP3 แท้ประจำตัวอักษรทันที (0ms)
    const audioSrc = `assets/audio/${idStr}.mp3`;
    this.playAudioFile(audioSrc, callback, () => {
      const text = consonantData.spokenFull || consonantData.readText || consonantData.full;
      this.speakWord(text, consonantData, callback);
    });
  }

  // เล่นเสียงบทกลอน (กอ เอ๋ย กอ ไก่) จากไฟล์ MP3 ทันที 0ms
  speakPoem(consonantData, callback = null) {
    if (!consonantData) {
      if (callback) callback();
      return;
    }
    this.stop();

    const idStr = String(consonantData.id).padStart(2, '0');
    const audioSrc = `assets/audio/poem_${idStr}.mp3`;

    this.playAudioFile(audioSrc, callback, () => {
      const text = consonantData.spokenPoem || consonantData.poem || consonantData.full;
      this.speakWord(text, consonantData, callback);
    });
  }

  // เสียงคำถามมินิเกม: เล่นเฉพาะเสียงชื่อพยัญชนะเป้าหมายในแต่ละข้อทันที (0ms)
  speakQuizQuestion(consonantData, callback = null) {
    if (!consonantData) {
      if (callback) callback();
      return;
    }
    this.stop();

    const idStr = String(consonantData.id).padStart(2, '0');
    const consonantAudio = `assets/audio/${idStr}.mp3`;

    // เล่นเฉพาะเสียงพยัญชนะที่ต้องการให้เลือกทันที 100% (เช่น "ก ไก่", "ข ไข่", "ฅ คน")
    this.playAudioFile(consonantAudio, callback, () => {
      const text = consonantData.spokenFull || consonantData.readText || consonantData.full;
      this.speakWord(text, consonantData, callback);
    });
  }

  // เสียงตอบถูกในเกม: พูดว่า "เยี่ยมมาก"
  speakCorrect(consonantData = null, callback = null) {
    this.speakQuizCorrect(consonantData, callback);
  }

  speakQuizCorrect(consonantData = null, callback = null) {
    this.stop();
    this.playAudioFile('assets/audio/praise_correct.mp3', callback, () => {
      this.speakWord('เยี่ยมมาก', consonantData, callback);
    });
  }

  // เสียงตอบผิดในเกม: พูดว่า "ลองใหม่อีกครั้ง"
  speakWrong(callback = null) {
    this.speakQuizWrong(callback);
  }

  speakQuizWrong(callback = null) {
    this.stop();
    this.playAudioFile('assets/audio/praise_wrong.mp3', callback, () => {
      this.speakWord('ลองใหม่อีกครั้ง', null, callback);
    });
  }

  // เล่นเสียงคำอ่าน / คำศัพท์ตัวอย่างทั้งหมด 100% เล่นทันที 0ms ชัดเจน คล่องแคล่ว
  speakWord(word, consonantContext = null, callback = null) {
    if (typeof consonantContext === 'function') {
      callback = consonantContext;
      consonantContext = null;
    }

    if (!word || word.trim() === '') {
      if (callback) callback();
      return;
    }
    this.stop();

    const cleanWord = word.trim().replace(/\(.*?\)/g, '').trim();

    // 1. ตรวจสอบว่าตรงกับคำศัพท์หลักที่มีไฟล์ MP3 ในเครื่องหรือไม่ (เล่นได้ทันที 0ms)
    if (this.primaryWordMap[cleanWord]) {
      const idStr = String(this.primaryWordMap[cleanWord]).padStart(2, '0');
      this.playAudioFile(`assets/audio/${idStr}.mp3`, callback, null, true);
      return;
    }

    // 2. ตรวจสอบไฟล์เสียง MP3 เฉพาะคำศัพท์ใน assets/audio/vocab/ (เล่นได้ทันที 0ms)
    const hex = this.getWordHex(cleanWord);
    if (hex) {
      const vocabSrc = `assets/audio/vocab/${hex}.mp3`;
      this.playAudioFile(vocabSrc, callback, () => {
        this.speakWordFallback(cleanWord, consonantContext, callback);
      }, true);
      return;
    }

    this.speakWordFallback(cleanWord, consonantContext, callback);
  }

  // เล่นเสียงคำศัพท์กรณีสำรอง
  speakWordFallback(cleanWord, consonantContext, callback) {
    const textToSpeak = this.phoneticWordMap[cleanWord] || cleanWord;
    const thaiVoice = this.getThaiVoice();

    if (this.synth && thaiVoice) {
      try {
        if (this.synth.speaking || this.synth.pending) this.synth.cancel();
        if (this.synth.paused) this.synth.resume();

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'th-TH';
        utterance.rate = Math.max(1.15, (this.rate || 1.0) * 1.15);
        utterance.voice = thaiVoice;

        utterance.onend = () => { if (callback) callback(); };
        utterance.onerror = () => {
          this.playWordFromCacheOrOnline(textToSpeak, cleanWord, consonantContext, callback);
        };

        this.synth.speak(utterance);
        return;
      } catch (err) {
        console.warn('WebSpeech speakWord error:', err);
      }
    }

    this.playWordFromCacheOrOnline(textToSpeak, cleanWord, consonantContext, callback);
  }

  // เล่นเสียงคำศัพท์จาก Cache ทันที หรือสตรีม Online TTS
  playWordFromCacheOrOnline(textToSpeak, cleanWord, consonantContext, callback) {
    if (this.wordAudioCache[cleanWord]) {
      this.playAudioInstance(this.wordAudioCache[cleanWord], callback, () => {
        this.fallbackToOnlineTTS(textToSpeak, cleanWord, consonantContext, callback);
      }, true);
      return;
    }

    this.fallbackToOnlineTTS(textToSpeak, cleanWord, consonantContext, callback);
  }

  // เล่นเสียงผ่าน Online TTS คุณภาพสูง พร้อมสำรองหลายเซิร์ฟเวอร์
  fallbackToOnlineTTS(textToSpeak, cleanWord, consonantContext, callback) {
    const encoded = encodeURIComponent(textToSpeak);
    const googleUrl1 = `https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=${encoded}`;
    const googleUrl2 = `https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=gtx&q=${encoded}`;
    const respUrl = `https://texttospeech.responsivevoice.org/v1/text:synthesize?text=${encoded}&lang=th&engine=g1&key=jQZ2zcdq`;

    this.playAudioFile(googleUrl1, callback, () => {
      this.playAudioFile(googleUrl2, callback, () => {
        this.playAudioFile(respUrl, callback, () => {
          this.playFallbackWord(cleanWord, consonantContext, callback);
        }, true);
      }, true);
    }, true);
  }

  // เสียงสำรองเมื่อออฟไลน์และไม่มีเสียงสังเคราะห์: เล่นเสียงพยัญชนะประจำการ์ดทันที (0ms)
  playFallbackWord(cleanWord, consonantContext = null, callback = null) {
    if (consonantContext && consonantContext.id) {
      const idStr = String(consonantContext.id).padStart(2, '0');
      this.playAudioFile(`assets/audio/${idStr}.mp3`, callback, null, true);
    } else if (callback) {
      callback();
    }
  }

  // เล่น Audio Instance โดยตรง พร้อมปรับความเร็วกระชับตามประเภทเสียง
  playAudioInstance(audio, onEnd = null, onError = null, isWord = false, customSpeed = null) {
    try {
      this.currentAudio = audio;
      let speed = customSpeed || (isWord ? Math.max(1.15, (this.rate || 1.0) * 1.15) : (this.rate || 1.0));
      audio.playbackRate = speed;
      if (audio.preservesPitch !== undefined) audio.preservesPitch = true;
      audio.currentTime = 0;

      let called = false;
      const handleEnd = () => {
        if (!called) {
          called = true;
          if (this.currentAudio === audio) this.currentAudio = null;
          if (onEnd) onEnd();
        }
      };

      const handleError = (e) => {
        if (!called) {
          called = true;
          if (this.currentAudio === audio) this.currentAudio = null;
          if (onError) onError(e);
          else if (onEnd) onEnd();
        }
      };

      audio.onended = handleEnd;
      audio.onerror = handleError;

      const p = audio.play();
      if (p !== undefined) {
        p.catch(err => handleError(err));
      }
    } catch (err) {
      if (onError) onError(err);
      else if (onEnd) onEnd();
    }
  }

  // เล่นไฟล์เสียง MP3 แบบ Instant (ใช้ Audio Pool 0ms delay)
  playAudioFile(src, onEnd = null, onError = null, isWord = false, customSpeed = null) {
    try {
      let audio = this.audioPool[src];
      if (!audio) {
        audio = new Audio();
        audio.preload = 'auto';
        audio.src = src;
        this.audioPool[src] = audio;
      }

      this.playAudioInstance(audio, onEnd, onError, isWord, customSpeed);
    } catch (err) {
      if (onError) onError(err);
      else if (onEnd) onEnd();
    }
  }

  speak(text, options = {}) {
    const onEnd = options.onEnd || null;
    this.speakWord(text, null, onEnd);
  }

  stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
  }

  setMode(mode) {
    this.speechMode = mode;
  }
}

const SpeechEngine = new GoogleSpeechPlayer();
