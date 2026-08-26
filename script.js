/**
 * LATE NIGHT TAPE REEL - ROMANTIC PROPOSAL SPA CONTROLLER
 * Full Critique & Polish Pass: Accessibility, Reduced Motion, Keyboard Controls & Performance Deferral
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // STATE MANAGEMENT & DOM ELEMENTS
  // ==========================================================================
  let currentScene = 1;
  let audioPlaying = false;
  let hudSeconds = 0;
  let hudInterval = null;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // DOM Handles
  const bgMusic = document.getElementById('bgMusic');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const lightLeakOverlay = document.getElementById('lightLeakOverlay');
  const hudTimestamp = document.getElementById('hudTimestamp');
  const fairyBulbs = document.querySelectorAll('.fairy-bulb');
  const scenes = document.querySelectorAll('.scene-section');

  // ==========================================================================
  // CAMCORDER HUD TIMESTAMP TIMER
  // ==========================================================================
  function startHudClock() {
    if (hudInterval) clearInterval(hudInterval);
    hudInterval = setInterval(() => {
      hudSeconds++;
      const mins = String(Math.floor((hudSeconds % 3600) / 60)).padStart(2, '0');
      const secs = String(hudSeconds % 60).padStart(2, '0');
      hudTimestamp.textContent = `${mins}:${secs}`;
    }, 1000);
  }
  startHudClock();

  // ==========================================================================
  // AUDIO CONTROLLER WITH BROWSER AUTOPLAY FALLBACK
  // ==========================================================================
  function toggleAudio(forcePlay = null) {
    const shouldPlay = forcePlay !== null ? forcePlay : bgMusic.paused;
    const celebrationAudioText = document.getElementById('celebrationAudioText');

    if (shouldPlay) {
      bgMusic.play().then(() => {
        audioPlaying = true;
        soundToggleBtn.classList.add('playing');
        soundToggleBtn.querySelector('.sound-text').textContent = 'Sound: ON';
        if (celebrationAudioText) celebrationAudioText.textContent = "Music Playing... 🎵";
      }).catch(err => {
        console.log('Audio autoplay policy fallback active:', err);
        audioPlaying = false;
        soundToggleBtn.classList.remove('playing');
        soundToggleBtn.querySelector('.sound-text').textContent = 'Sound: OFF';
        if (celebrationAudioText) celebrationAudioText.textContent = "🔇 Tap for Sound";
      });
    } else {
      bgMusic.pause();
      audioPlaying = false;
      soundToggleBtn.classList.remove('playing');
      soundToggleBtn.querySelector('.sound-text').textContent = 'Sound: OFF';
      if (celebrationAudioText) celebrationAudioText.textContent = "🔇 Tap for Sound";
    }
  }

  soundToggleBtn.addEventListener('click', () => toggleAudio());

  const celebrationAudioControl = document.getElementById('celebrationAudioControl');
  if (celebrationAudioControl) {
    celebrationAudioControl.addEventListener('click', () => toggleAudio(true));
  }

  // ==========================================================================
  // SCENE NAVIGATION SYSTEM WITH ACCESSIBLE KEYBOARD HANDLERS
  // ==========================================================================
  function goToScene(targetScene) {
    if (targetScene < 1 || targetScene > 6 || targetScene === currentScene) return;

    if (!prefersReducedMotion) {
      lightLeakOverlay.classList.remove('active-sweep');
      void lightLeakOverlay.offsetWidth;
      lightLeakOverlay.classList.add('active-sweep');
    }

    setTimeout(() => {
      scenes.forEach(scene => {
        const sceneId = parseInt(scene.getAttribute('data-scene-id'), 10);
        if (sceneId === targetScene) {
          scene.classList.add('scene-active');
        } else {
          scene.classList.remove('scene-active');
        }
      });

      currentScene = targetScene;
      updateFairyLights();

      if (currentScene === 4) initBuildupScene();
      if (currentScene === 6) initCelebrationScene();
    }, prefersReducedMotion ? 50 : 250);
  }

  function updateFairyLights() {
    fairyBulbs.forEach(bulb => {
      const sceneNum = parseInt(bulb.getAttribute('data-scene'), 10);
      bulb.classList.remove('active', 'completed');

      if (sceneNum === currentScene) {
        bulb.classList.add('active');
        bulb.setAttribute('aria-current', 'step');
      } else if (sceneNum < currentScene) {
        bulb.classList.add('completed');
        bulb.removeAttribute('aria-current');
      } else {
        bulb.removeAttribute('aria-current');
      }
    });
  }

  fairyBulbs.forEach(bulb => {
    bulb.addEventListener('click', () => {
      const sceneNum = parseInt(bulb.getAttribute('data-scene'), 10);
      if (sceneNum <= currentScene || bulb.classList.contains('completed')) {
        goToScene(sceneNum);
      }
    });

    bulb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const sceneNum = parseInt(bulb.getAttribute('data-scene'), 10);
        if (sceneNum <= currentScene || bulb.classList.contains('completed')) {
          goToScene(sceneNum);
        }
      }
    });
  });

  // ==========================================================================
  // SCENE 1: TEASER / GATE
  // ==========================================================================
  const waxSeal = document.getElementById('waxSeal');
  const letterRevealContent = document.getElementById('letterRevealContent');
  const ambientLights = document.querySelector('.ambient-string-lights');
  const gateHintText = document.getElementById('gateHintText');
  const turnPageBtn = document.getElementById('turnPageBtn');

  function openWaxSeal() {
    toggleAudio(true);
    waxSeal.classList.add('cracked');

    if (ambientLights) {
      ambientLights.classList.add('cascade-active');
    }

    setTimeout(() => {
      waxSeal.style.display = 'none';
      letterRevealContent.classList.add('revealed');
      gateHintText.textContent = "Letter unsealed! Click 'turn the page ➔' to begin your memory tape.";
    }, 450);
  }

  if (waxSeal) {
    waxSeal.addEventListener('click', openWaxSeal);
    waxSeal.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openWaxSeal();
      }
    });
  }

  if (turnPageBtn) {
    turnPageBtn.addEventListener('click', () => goToScene(2));
  }

  // ==========================================================================
  // SCENE 2: MEMORY LANE (SPROCKET DOTS & KEYBOARD NAV)
  // ==========================================================================
  let currentPolaroidIndex = 0;
  const polaroids = document.querySelectorAll('.polaroid-card');
  const carouselStage = document.getElementById('carouselStage');
  const carouselTrack = document.getElementById('carouselTrack');
  const carouselDotsContainer = document.getElementById('carouselDots');
  const toQuestionsBtn = document.getElementById('toQuestionsBtn');

  if (carouselDotsContainer) {
    carouselDotsContainer.innerHTML = '';
    polaroids.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `film-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('role', 'tab');
      dot.setAttribute('tabindex', '0');
      dot.setAttribute('aria-label', `Memory card ${idx + 1} of ${polaroids.length}`);
      
      dot.addEventListener('click', () => setPolaroidIndex(idx));
      dot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setPolaroidIndex(idx);
        }
      });
      carouselDotsContainer.appendChild(dot);
    });
  }

  const carouselDots = document.querySelectorAll('.film-dot');

  function setPolaroidIndex(index) {
    if (index < 0) index = 0;
    if (index >= polaroids.length) index = polaroids.length - 1;

    currentPolaroidIndex = index;
    carouselTrack.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
    carouselTrack.style.transform = `translateX(-${currentPolaroidIndex * 100}%)`;

    polaroids.forEach((card, idx) => {
      card.classList.toggle('active', idx === currentPolaroidIndex);
      if (idx === currentPolaroidIndex) {
        card.style.transform = 'rotate(0deg) scale(1)';
      } else {
        const rot = idx % 2 === 0 ? -1.5 : 1.8;
        card.style.transform = `rotate(${rot}deg) scale(0.97)`;
      }
    });

    carouselDots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentPolaroidIndex);
    });

    if (currentPolaroidIndex === polaroids.length - 1 && toQuestionsBtn) {
      toQuestionsBtn.classList.add('show-trigger');
    }
  }

  if (carouselStage) {
    carouselStage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPolaroidIndex(currentPolaroidIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPolaroidIndex(currentPolaroidIndex - 1);
      }
    });
  }

  let isDragging = false;
  let startX = 0;
  let dragDeltaX = 0;

  if (carouselStage) {
    carouselStage.addEventListener('pointerdown', (e) => {
      isDragging = true;
      startX = e.clientX;
      dragDeltaX = 0;
      carouselTrack.style.transition = 'none';
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      dragDeltaX = e.clientX - startX;

      const baseOffset = -currentPolaroidIndex * carouselStage.offsetWidth;
      carouselTrack.style.transform = `translateX(${baseOffset + dragDeltaX}px)`;

      const activeCard = polaroids[currentPolaroidIndex];
      if (activeCard) {
        const rotAngle = Math.max(-12, Math.min(12, dragDeltaX * 0.06));
        activeCard.style.transform = `rotate(${rotAngle}deg) scale(0.99)`;
      }
    });

    window.addEventListener('pointerup', (e) => {
      if (!isDragging) return;
      isDragging = false;

      const swipeThreshold = 45;
      if (dragDeltaX < -swipeThreshold) {
        setPolaroidIndex(currentPolaroidIndex + 1);
      } else if (dragDeltaX > swipeThreshold) {
        setPolaroidIndex(currentPolaroidIndex - 1);
      } else {
        setPolaroidIndex(currentPolaroidIndex);
      }
    });
  }

  if (toQuestionsBtn) {
    toQuestionsBtn.addEventListener('click', () => goToScene(3));
  }

  // ==========================================================================
  // SCENE 3: THE QUESTIONS & MEMORY VAULT
  // ==========================================================================
  let currentQuestionIndex = 0;
  let savedAnswersCount = 0;
  const questionCards = document.querySelectorAll('.question-card');
  const qProgressText = document.getElementById('qProgressText');
  const savedCountText = document.getElementById('savedCountText');
  const memoryNotebookWidget = document.querySelector('.memory-notebook-widget');

  function saveAnswerToVault() {
    savedAnswersCount++;
    savedCountText.textContent = `Saved: ${savedAnswersCount}/4`;

    if (memoryNotebookWidget) {
      memoryNotebookWidget.classList.remove('vault-saved');
      void memoryNotebookWidget.offsetWidth;
      memoryNotebookWidget.classList.add('vault-saved');
    }
  }

  function advanceQuestionCard() {
    saveAnswerToVault();

    if (currentQuestionIndex < questionCards.length - 1) {
      const activeCard = questionCards[currentQuestionIndex];
      activeCard.classList.add('exiting');
      activeCard.classList.remove('active');

      currentQuestionIndex++;
      const nextCard = questionCards[currentQuestionIndex];
      nextCard.classList.add('active');

      qProgressText.textContent = `Question ${currentQuestionIndex + 1} of ${questionCards.length}`;
    } else {
      setTimeout(() => {
        goToScene(4);
      }, 500);
    }
  }

  const q1Input = document.getElementById('q1Input');
  const q1SubmitBtn = document.getElementById('q1SubmitBtn');

  function submitQ1() {
    const val = q1Input ? q1Input.value.trim() : '';
    if (!val) {
      q1Input.focus();
      q1Input.placeholder = "Please type a quick memory... ✨";
      return;
    }
    advanceQuestionCard();
  }

  if (q1SubmitBtn) q1SubmitBtn.addEventListener('click', submitQ1);
  if (q1Input) {
    q1Input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitQ1();
    });
  }

  const q2Options = document.querySelectorAll('[data-q2-option]');
  q2Options.forEach(btn => {
    btn.addEventListener('click', () => {
      q2Options.forEach(o => o.classList.remove('selected-answer'));
      btn.classList.add('selected-answer');

      setTimeout(() => {
        advanceQuestionCard();
      }, 400);
    });
  });

  const heartGaugeStage = document.getElementById('heartGaugeStage');
  const gaugeHeartHandle = document.getElementById('gaugeHeartHandle');
  const gaugeArcFill = document.getElementById('gaugeArcFill');
  const gaugeStatusText = document.getElementById('gaugeStatusText');
  const q3SubmitBtn = document.getElementById('q3SubmitBtn');

  let gaugeValue = 0.85;

  function updateHeartGauge(percent) {
    gaugeValue = Math.max(0, Math.min(1, percent));
    const handleLeft = Math.max(5, Math.min(95, gaugeValue * 100));

    if (gaugeHeartHandle) gaugeHeartHandle.style.left = `${handleLeft}%`;
    if (gaugeArcFill) gaugeArcFill.style.width = `${gaugeValue * 100}%`;

    if (heartGaugeStage) {
      heartGaugeStage.setAttribute('aria-valuenow', Math.round(gaugeValue * 100));
    }

    if (gaugeStatusText) {
      if (gaugeValue < 0.25) {
        gaugeStatusText.textContent = "Rating: Meh 🥱";
      } else if (gaugeValue < 0.5) {
        gaugeStatusText.textContent = "Rating: A little bit 🤏";
      } else if (gaugeValue < 0.75) {
        gaugeStatusText.textContent = "Rating: Quite a lot 💓";
      } else {
        gaugeStatusText.textContent = "Rating: 100% Unbearable! 🥺❤️";
      }
    }
  }

  if (heartGaugeStage) {
    heartGaugeStage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        updateHeartGauge(gaugeValue + 0.1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        updateHeartGauge(gaugeValue - 0.1);
      }
    });
  }

  let isGaugeDragging = false;

  if (heartGaugeStage) {
    heartGaugeStage.addEventListener('pointerdown', (e) => {
      isGaugeDragging = true;
      handleGaugeMove(e);
    });

    window.addEventListener('pointermove', (e) => {
      if (isGaugeDragging) handleGaugeMove(e);
    });

    window.addEventListener('pointerup', () => {
      isGaugeDragging = false;
    });
  }

  function handleGaugeMove(e) {
    if (!heartGaugeStage) return;
    const rect = heartGaugeStage.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    updateHeartGauge(percent);
  }

  if (q3SubmitBtn) {
    q3SubmitBtn.addEventListener('click', () => {
      advanceQuestionCard();
    });
  }

  const q4Input = document.getElementById('q4Input');
  const q4SubmitBtn = document.getElementById('q4SubmitBtn');

  function submitQ4() {
    const val = q4Input ? q4Input.value.trim() : '';
    if (!val) {
      q4Input.focus();
      q4Input.placeholder = "Type your dream spot... ✨";
      return;
    }
    advanceQuestionCard();
  }

  if (q4SubmitBtn) q4SubmitBtn.addEventListener('click', submitQ4);
  if (q4Input) {
    q4Input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitQ4();
    });
  }

  // ==========================================================================
  // SCENE 4: THE BUILD-UP
  // ==========================================================================
  let buildupSequenceTimer = null;

  function initBuildupScene() {
    const line1 = document.getElementById('buildupLine1');
    const line2 = document.getElementById('buildupLine2');
    const line3 = document.getElementById('buildupLine3');
    const flashbackCard = document.getElementById('flashbackCard');

    if (line1) line1.classList.remove('show');
    if (line2) line2.classList.remove('show');
    if (line3) line3.classList.remove('show');
    if (flashbackCard) flashbackCard.classList.remove('show-card');

    if (buildupSequenceTimer) clearTimeout(buildupSequenceTimer);

    setTimeout(() => { if (line1) line1.classList.add('show'); }, 400);
    setTimeout(() => { if (line2) line2.classList.add('show'); }, 1400);
    setTimeout(() => { if (flashbackCard) flashbackCard.classList.add('show-card'); }, 2400);
    setTimeout(() => { if (line3) line3.classList.add('show'); }, 3800);

    buildupSequenceTimer = setTimeout(() => {
      if (currentScene === 4) {
        goToScene(5);
      }
    }, 6000);
  }

  // ==========================================================================
  // SCENE 5: THE ASK
  // ==========================================================================
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const askButtonsStage = document.getElementById('askButtonsStage');
  const stickyNotesContainer = document.getElementById('stickyNotesContainer');

  let dodgeCount = 0;
  const maxDodges = 6;
  let yesScale = 1;

  const stickyMessages = [
    "Wait, misclick? Let me help you out... 🙈",
    "Are you sure? Think about our late-night boba runs! 🧋",
    "Nice try! But destiny has already written this frame. ✨",
    "Look how warm and glowing that YES button is getting! ❤️",
    "The 'No' button is getting dizzy... try the green one! 💫",
    "Error 404: 'No' option not found in our memory tape. 📼",
    "Even the camera is rooting for YES! 🎥",
    "Alright, I'll make the YES button impossible to miss! 😊",
    "You know you want to say yes... just tap it! 💖",
    "Resistance is futile! Our date awaits! 🎟️"
  ];

  function dodgeNoButton(e) {
    if (e) e.preventDefault();

    if (prefersReducedMotion) {
      surrenderNoButton();
      return;
    }

    dodgeCount++;

    if (dodgeCount >= maxDodges) {
      surrenderNoButton();
      return;
    }

    const stageRect = askButtonsStage.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();

    const maxX = Math.max(20, stageRect.width - noRect.width - 20);
    const maxY = Math.max(20, stageRect.height - noRect.height - 20);

    const pattern = dodgeCount % 5;
    let newX = 0;
    let newY = 0;

    if (pattern === 0) {
      newX = Math.floor(Math.random() * maxX);
      newY = Math.floor(Math.random() * maxY);
    } else if (pattern === 1) {
      newX = Math.floor(maxX * 0.85);
      newY = Math.floor(maxY * 0.15);
      noBtn.style.transform = 'scale(1.15) rotate(15deg)';
      setTimeout(() => { noBtn.style.transform = 'scale(1) rotate(0deg)'; }, 200);
    } else if (pattern === 2) {
      newX = Math.floor(maxX * 0.9);
      newY = -30;
    } else if (pattern === 3) {
      newX = 15;
      newY = 15;
    } else {
      newX = Math.floor(maxX * 0.5);
      newY = Math.floor(maxY * 0.9);
      noBtn.style.transform = 'scale(0.8) rotate(-10deg)';
      setTimeout(() => { noBtn.style.transform = 'scale(1) rotate(0deg)'; }, 200);
    }

    noBtn.style.left = `${newX}px`;
    noBtn.style.top = `${newY}px`;

    yesScale += 0.14;
    yesBtn.style.transform = `scale(${yesScale})`;
    yesBtn.classList.add('yes-super-confident');

    spawnStickyNote(stickyMessages[(dodgeCount - 1) % stickyMessages.length]);
  }

  function surrenderNoButton() {
    if (!noBtn) return;
    noBtn.classList.add('no-surrendered');
    noBtn.textContent = "Surrendered! 🏳️";
    spawnStickyNote("The 'No' button has officially retired! Only YES remains. ❤️");

    yesBtn.style.transform = `scale(${yesScale + 0.2})`;
  }

  function spawnStickyNote(msg) {
    if (!stickyNotesContainer) return;

    const note = document.createElement('div');
    note.className = 'sticky-note';
    note.textContent = msg;

    const rot = Math.floor(Math.random() * 20) - 10;
    const topPos = Math.floor(Math.random() * 50) + 10;
    const leftPos = Math.floor(Math.random() * 60) + 20;

    note.style.top = `${topPos}%`;
    note.style.left = `${leftPos}%`;
    note.style.transform = `rotate(${rot}deg)`;

    stickyNotesContainer.appendChild(note);

    if (stickyNotesContainer.children.length > 4) {
      stickyNotesContainer.removeChild(stickyNotesContainer.firstChild);
    }
  }

  if (noBtn) {
    noBtn.addEventListener('mouseenter', dodgeNoButton);
    noBtn.addEventListener('touchstart', dodgeNoButton, { passive: false });
    noBtn.addEventListener('click', dodgeNoButton);
  }

  if (yesBtn) {
    yesBtn.addEventListener('click', () => {
      goToScene(6);
    });
  }

  // ==========================================================================
  // SCENE 6: CELEBRATION (PARTICLE ENGINE & AUDIOPLAY)
  // ==========================================================================
  const confettiCanvas = document.getElementById('confettiCanvas');
  const ctx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let confettiParticles = [];
  let confettiAnimId = null;

  function resizeCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function initCelebrationScene() {
    toggleAudio(true);
    if (!prefersReducedMotion) {
      createThemedParticles();
      animateThemedParticles();
    }
  }

  function createThemedParticles() {
    confettiParticles = [];
    const colors = ['#FFB703', '#F4A261', '#10B981', '#E0E1DD', '#F43F5E'];
    const particleCount = 70;

    for (let i = 0; i < particleCount; i++) {
      confettiParticles.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height - confettiCanvas.height,
        size: Math.random() * 12 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 2.5 + 1.2,
        speedX: Math.random() * 1.8 - 0.9,
        rotation: Math.random() * 360,
        rotSpeed: Math.random() * 3 - 1.5,
        type: Math.random() > 0.6 ? 'heart' : (Math.random() > 0.5 ? 'star' : 'sparkle')
      });
    }
  }

  function animateThemedParticles() {
    if (!ctx || !confettiCanvas || currentScene !== 6) return;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiParticles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;

      if (p.y > confettiCanvas.height) {
        p.y = -15;
        p.x = Math.random() * confettiCanvas.width;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.type === 'heart') {
        ctx.beginPath();
        ctx.arc(-p.size / 2, 0, p.size / 2, 0, Math.PI, true);
        ctx.arc(p.size / 2, 0, p.size / 2, 0, Math.PI, true);
        ctx.lineTo(0, p.size);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'star') {
        ctx.font = `${Math.floor(p.size)}px sans-serif`;
        ctx.fillText('✦', 0, 0);
      } else {
        ctx.font = `${Math.floor(p.size)}px sans-serif`;
        ctx.fillText('✨', 0, 0);
      }

      ctx.restore();
    });

    if (currentScene === 6) {
      confettiAnimId = requestAnimationFrame(animateThemedParticles);
    }
  }

  const replayBtn = document.getElementById('replayBtn');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
      currentQuestionIndex = 0;
      savedAnswersCount = 0;
      dodgeCount = 0;
      yesScale = 1;

      if (savedCountText) savedCountText.textContent = 'Saved: 0/4';
      if (yesBtn) {
        yesBtn.style.transform = 'scale(1)';
        yesBtn.classList.remove('yes-super-confident');
      }
      if (noBtn) {
        noBtn.classList.remove('no-surrendered');
        noBtn.textContent = "No 🙈";
        noBtn.style.left = 'auto';
        noBtn.style.top = 'auto';
      }
      if (stickyNotesContainer) stickyNotesContainer.innerHTML = '';
      goToScene(1);
    });
  }
});
