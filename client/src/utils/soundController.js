// src/utils/soundController.js

// Создаём аудио-элементы один раз (кешируем)
const successAudio = new Audio('http://localhost:3000/sounds/success.mp3');
const failAudio = new Audio('http://localhost:3000/sounds/fail.mp3');
const padAudio = new Audio('http://localhost:3000/sounds/pat.mp3');

// Убедимся, что звуки не накладываются при быстрых вызовах
const playSound = (audio) => {
  try {
    // Сбросим текущее воспроизведение и начнём с начала
    audio.currentTime = 0;
    audio.play()
  } catch (e) {
    console.log('Error playing sound:', e);
    audio.pause();
   }
};

export const playSuccessSound = () => playSound(successAudio);
export const playFailSound = () => playSound(failAudio);
export const playPadSound = () => playSound(padAudio);

// Главная функция: проигрывает звук по типу, если разрешено
export const playSoundByType = (type, isEnabled = false) => {
  if (!isEnabled) return;

  switch (type) {
    case 'success':
      playSuccessSound();
      break;
    case 'fail':
      playFailSound();
      break;
    case 'pad':
      playPadSound();
      break;
    default:
      console.warn('Unknown sound type:', type);
  }
};/**
 * 🔊 Пиздатый генератор аудио-эффектов на Web Audio API
 * Три эмоции: успех 🎉, провал 💥, пат 🌀
 */

export const playBeep = (
  frequency = 800,
  duration = 450,
  type = 'sine',
  ctx = null
) => {
  // Повторное использование контекста для избежания блокировки
  const audioCtx = ctx || new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  
  // Плавное затухание
  gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration / 1000);

  return audioCtx; // возвращаем контекст для возможного переиспользования
};

// 🎉 УСПЕХ: восходящая мелодия с лёгким {t('soundController_2')} финалом
export const playSuccessBeep = () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const notes = [
    { freq: 523, dur: 150, type: 'sine' },   // C5
    { freq: 659, dur: 150, type: 'sine' },   // E5
    { freq: 784, dur: 200, type: 'triangle' } // G5 — ярче
  ];

  let time = ctx.currentTime;
  notes.forEach(note => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = note.type;
    osc.frequency.value = note.freq;
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + note.dur / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + note.dur / 1000);
    time += note.dur / 1000;
  });
};

// 💼💥 ЭФФЕКТ ПРОВАЛА:
export const playFailBeep = () => {
  // Создаём контекст (если ещё не создан)
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  const startTime = ctx.currentTime;
  const totalDuration = 2.2; // секунды — да, это больно долго

  // --- Основной осциллятор: тяжёлая, трагическая мелодия ---
  const mainOsc = ctx.createOscillator();
  const mainGain = ctx.createGain();
  
  mainOsc.type = 'sine'; // чистый, без треска — только боль
  mainOsc.frequency.setValueAtTime(160, startTime); // низкий, как кредитный рейтинг
  
  // Медленное падение частоты — деньги утекают сквозь пальцы
  mainOsc.frequency.exponentialRampToValueAtTime(40, startTime + totalDuration);

  // Громкость: сначала резкий удар, потом затухание в безнадёжность
  mainGain.gain.setValueAtTime(0.25, startTime);
  mainGain.gain.exponentialRampToValueAtTime(0.001, startTime + totalDuration);

  mainOsc.connect(mainGain);
  mainGain.connect(ctx.destination);

  // --- Дополнительный {t('soundController_1')}: высокая нота, которая быстро гаснет — как последняя надежда ---
  const hopeOsc = ctx.createOscillator();
  const hopeGain = ctx.createGain();
  
  hopeOsc.type = 'triangle';
  hopeOsc.frequency.setValueAtTime(660, startTime + 0.3); // E5 — яркая, но недолгая
  hopeGain.gain.setValueAtTime(0.08, startTime + 0.3);
  hopeGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3 + 0.6); // гаснет за 600 мс

  hopeOsc.connect(hopeGain);
  hopeGain.connect(ctx.destination);

  // Запуск
  mainOsc.start(startTime);
  mainOsc.stop(startTime + totalDuration);

  hopeOsc.start(startTime + 0.3);
  hopeOsc.stop(startTime + 0.3 + 0.6);

};

// 🌀 ПАТ (ничья / загадка / магия)
export const playPatBeep = () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const mainFreq = 330; // E4
  const duration = 1.2; // сек

  // Основной осциллятор
  const mainOsc = ctx.createOscillator();
  mainOsc.type = 'sine';
  mainOsc.frequency.value = mainFreq;

  // LFO для вибрации (низкочастотная модуляция)
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 6; // 6 Гц вибрация
  lfoGain.gain.value = 8; // глубина модуляции ±8 Гц

  lfo.connect(lfoGain);
  lfoGain.connect(mainOsc.frequency);

  // Общий гейн с затуханием
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  mainOsc.connect(gain).connect(ctx.destination);

  lfo.start();
  mainOsc.start();
  lfo.stop(ctx.currentTime + duration);
  mainOsc.stop(ctx.currentTime + duration);
};