const phases = [...document.querySelectorAll('.phase')];
const ticks = [...document.querySelectorAll('.tick')];
const labels = ['POWER ON', 'FIRMWARE CHECK', 'BOOTLOADER', 'KERNEL LOAD', 'OS READY'];
const timelineFill = document.querySelector('#timeline-fill');
const phaseCount = document.querySelector('#phase-count');
const stepLabel = document.querySelector('#step-label');
const elapsedLabel = document.querySelector('#elapsed');
const skipButton = document.querySelector('#skip-button');
const pauseButton = document.querySelector('#pause-button');
const replayButton = document.querySelector('#replay-button');
const startHint = document.querySelector('#start-hint');
const memoryPercent = document.querySelector('#memory-percent');
const kernelMessage = document.querySelector('#kernel-message');
const memoryBlocks = [...document.querySelectorAll('.memory-block')];
const screen = document.querySelector('#screen');
let currentPhase = 0;
let elapsedMs = 0;
let elapsedStartedAt = 0;
let elapsedTimer = null;
let phaseTimer = null;
let phaseDueAt = 0;
let remainingPhaseTime = 0;
let memoryTimer = null;
let memoryMessageTimer = null;
let memoryIndex = 0;
let memoryMessageIndex = 0;
let started = false;
let paused = false;

function showPhase(index) {
  currentPhase = index;
  phases.forEach((phase, i) => phase.classList.toggle('active', i === index));
  ticks.forEach((tick, i) => tick.classList.toggle('on', i <= index));
  timelineFill.style.width = `${index * 25}%`;
  phaseCount.textContent = `STARTUP PHASE 0${index + 1} / 05`;
  stepLabel.textContent = labels[index];
  if (index === 3) animateMemory();
  if (index === 4) complete();
}

function animateMemory() {
  const messages = ['Loading kernel into memory', 'Preparing system services', 'Transferring control to the kernel'];
  memoryTimer = setInterval(() => {
    if (memoryIndex >= memoryBlocks.length) {
      clearInterval(memoryTimer);
      memoryTimer = null;
      return;
    }
    memoryBlocks[memoryIndex].classList.add('filled');
    memoryPercent.textContent = `${Math.round(((memoryIndex + 1) / memoryBlocks.length) * 100)}%`;
    memoryIndex += 1;
  }, 260);
  memoryMessageTimer = setInterval(() => {
    memoryMessageIndex = (memoryMessageIndex + 1) % messages.length;
    kernelMessage.textContent = messages[memoryMessageIndex];
  }, 1800);
}

function updateElapsed() {
  const elapsed = elapsedMs + (elapsedStartedAt ? Date.now() - elapsedStartedAt : 0);
  const seconds = Math.floor(elapsed / 1000);
  elapsedLabel.textContent = `00:${String(seconds).padStart(2, '0')}`;
}

function startElapsedTimer() {
  elapsedStartedAt = Date.now();
  elapsedTimer = setInterval(updateElapsed, 250);
}

function schedulePhase(delay) {
  remainingPhaseTime = delay;
  phaseDueAt = Date.now() + delay;
  phaseTimer = setTimeout(() => {
    phaseTimer = null;
    remainingPhaseTime = 0;
    if (currentPhase === 1) {
      showPhase(2);
      schedulePhase(3500);
    } else if (currentPhase === 2) {
      showPhase(3);
      schedulePhase(4400);
    } else if (currentPhase === 3) {
      showPhase(4);
    }
  }, delay);
}

function pause() {
  if (!started || currentPhase === 4) return;
  paused = !paused;
  screen.classList.toggle('paused', paused);
  pauseButton.textContent = paused ? '▶ RESUME' : 'Ⅱ PAUSE';
  pauseButton.setAttribute('aria-pressed', String(paused));

  if (paused) {
    remainingPhaseTime = Math.max(0, phaseDueAt - Date.now());
    clearTimeout(phaseTimer);
    phaseTimer = null;
    phaseDueAt = 0;
    clearInterval(memoryTimer);
    clearInterval(memoryMessageTimer);
    memoryTimer = null;
    memoryMessageTimer = null;
    clearInterval(elapsedTimer);
    elapsedTimer = null;
    elapsedMs += Date.now() - elapsedStartedAt;
    elapsedStartedAt = 0;
  } else {
    schedulePhase(remainingPhaseTime);
    if (currentPhase === 3 && memoryIndex < memoryBlocks.length) animateMemory();
    startElapsedTimer();
  }
}

function clearSimulationTimers() {
  clearTimeout(phaseTimer);
  clearInterval(elapsedTimer);
  clearInterval(memoryTimer);
  clearInterval(memoryMessageTimer);
  phaseTimer = null;
  elapsedTimer = null;
  memoryTimer = null;
  memoryMessageTimer = null;
}

function complete() {
  clearSimulationTimers();
  if (!paused && elapsedStartedAt) elapsedMs += Date.now() - elapsedStartedAt;
  elapsedStartedAt = 0;
  updateElapsed();
  paused = false;
  screen.classList.remove('paused');
  timelineFill.style.width = '100%';
  phaseCount.textContent = 'STARTUP COMPLETE';
  pauseButton.hidden = true;
  skipButton.hidden = true;
  replayButton.hidden = false;
}

function start() {
  if (started) return;
  started = true;
  elapsedMs = 0;
  startHint.style.display = 'none';
  pauseButton.hidden = false;
  startElapsedTimer();
  showPhase(1);
  schedulePhase(4400);
}

function skip() {
  if (!started) start();
  clearSimulationTimers();
  paused = false;
  screen.classList.remove('paused');
  showPhase(4);
}

function restart() {
  clearSimulationTimers();
  phaseDueAt = 0;
  remainingPhaseTime = 0;
  memoryIndex = 0;
  memoryMessageIndex = 0;
  memoryBlocks.forEach((block, index) => block.classList.toggle('filled', index < 2));
  memoryPercent.textContent = '0%';
  kernelMessage.textContent = 'Loading kernel into memory';
  started = false;
  paused = false;
  elapsedMs = 0;
  elapsedStartedAt = 0;
  elapsedLabel.textContent = '00:00';
  screen.classList.remove('paused');
  startHint.style.display = '';
  pauseButton.hidden = true;
  pauseButton.textContent = 'Ⅱ PAUSE';
  pauseButton.setAttribute('aria-pressed', 'false');
  skipButton.hidden = false;
  replayButton.hidden = true;
  showPhase(0);
}

screen.addEventListener('click', event => {
  if (!event.target.closest('button') && currentPhase === 0) start();
});
document.addEventListener('keydown', event => {
  if ((event.key === 'Enter' || event.key === ' ') && currentPhase === 0) { event.preventDefault(); start(); }
  if (event.key === 'Escape' && started && currentPhase < 4) pause();
});
pauseButton.addEventListener('click', pause);
skipButton.addEventListener('click', skip);
replayButton.addEventListener('click', restart);
