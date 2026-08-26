/**
 * LATE NIGHT TAPE REEL - ROMANTIC PROPOSAL SPA CONTROLLER
 * Scene 2 Isolation & Multi-Scene Physics Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // STATE MANAGEMENT & DOM ELEMENTS
  // ==========================================================================
  let currentScene = 1;
  let audioPlaying = false;
  let hudSeconds = 0;
  let hudInterval = null;

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
  // AUDIO CONTROLLER
  // ==========================================================================
  function toggleAudio(forcePlay = null) {
    const shouldPlay = forcePlay !== null ? forcePlay : bgMusic.paused;

    if (shouldPlay) {
      bgMusic.play().then(() => {
        audioPlaying = true;
        soundToggleBtn.classList.add('playing');
        soundToggleBtn.querySelector('.sound-text').textContent = 'Sound: ON';
      }).catch(err => {
        console.log('Audio playback waiting for user action:', err);
      });
    } else {
      bgMusic.pause();
      audioPlaying = false;
      soundToggleBtn.classList.remove('playing');
      soundToggleBtn.querySelector('.sound-text').textContent = 'Sound: OFF';
    }
  }

  soundToggleBtn.addEventListener('click', () => toggleAudio());

  // ==========================================================================
  // SCENE NAVIGATION SYSTEM WITH LIGHT LEAK TRANSITION
  // ==========================================================================
  function goToScene(targetScene) {
    if (targetScene < 1 || targetScene > 6 || targetScene === currentScene) return;

    // Trigger signature Light-Leak transition animation
    lightLeakOverlay.classList.remove('active-sweep');
    void lightLeakOverlay.offsetWidth; // Force reflow
    lightLeakOverlay.classList.add('active-sweep');

    // Switch active scene class after brief burn delay
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

      // Trigger scene-specific lifecycle callbacks
      if (currentScene === 4) initBuildupScene();
      if (currentScene === 6) initCelebrationScene();
    }, 250);
  }

  // Fairy Light Navigation Progress Indicator
  function updateFairyLights() {
    fairyBulbs.forEach(bulb => {
      const sceneNum = parseInt(bulb.getAttribute('data-scene'), 10);
      bulb.classList.remove('active', 'completed');

      if (sceneNum === currentScene) {
        bulb.classList.add('active');
      } else if (sceneNum < currentScene) {
        bulb.classList.add('completed');
      }
    });
  }

  // Direct bulb navigation for completed scenes
  fairyBulbs.forEach(bulb => {
    bulb.addEventListener('click', () => {
      const sceneNum = parseInt(bulb.getAttribute('data-scene'), 10);
      if (sceneNum <= currentScene || bulb.classList.contains('completed')) {
        goToScene(sceneNum);
      }
    });
  });

  // ==========================================================================
  // SCENE 1: TEASER / GATE (WAX SEAL & CASCADING LIGHTS)
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
      if (e.key === 'Enter' || e.key === ' ') openWaxSeal();
    });
  }

  if (turnPageBtn) {
    turnPageBtn.addEventListener('click', () => goToScene(2));
  }

  // ==========================================================================
  // SCENE 2: MEMORY LANE (PHYSICS-BASED POLAROID SWIPE ENGINE)
  // ==========================================================================
  let currentPolaroidIndex = 0;
  const polaroids = document.querySelectorAll('.polaroid-card');
  const carouselStage = document.getElementById('carouselStage');
  const carouselTrack = document.getElementById('carouselTrack');
  const carouselDotsContainer = document.getElementById('carouselDots');
  const toQuestionsBtn = document.getElementById('toQuestionsBtn');

  // Build diegetic indicator dots
  if (carouselDotsContainer) {
    carouselDotsContainer.innerHTML = '';
    polaroids.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => setPolaroidIndex(idx));
      carouselDotsContainer.appendChild(dot);
    });
  }

  const carouselDots = document.querySelectorAll('.carousel-dot');

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

    // If visitor reaches the final memory card (card 10, tkthao.gif), reveal soft transition trigger
    if (currentPolaroidIndex === polaroids.length - 1 && toQuestionsBtn) {
      toQuestionsBtn.classList.add('show-trigger');
    }
  }

  // Pointer & Physics Drag Implementation
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

      // Apply rotation physics to current active card
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

    window.addEventListener('pointercancel', () => {
      if (isDragging) {
        isDragging = false;
        setPolaroidIndex(currentPolaroidIndex);
      }
    });
  }

  if (toQuestionsBtn) {
    toQuestionsBtn.addEventListener('click', () => goToScene(3));
  }

  // Keyboard left/right arrow listener
  document.addEventListener('keydown', e => {
    if (currentScene === 2) {
      if (e.key === 'ArrowRight') setPolaroidIndex(currentPolaroidIndex + 1);
      if (e.key === 'ArrowLeft') setPolaroidIndex(currentPolaroidIndex - 1);
    }
  });

  // ==========================================================================
  // SCENE 3: THE QUESTIONS
  // ==========================================================================
  let currentQuestionIndex = 0;
  const questionCards = document.querySelectorAll('.question-card');
  const qProgressText = document.getElementById('qProgressText');

  questionCards.forEach(card => {
    const options = card.querySelectorAll('.option-btn');
    options.forEach(btn => {
      btn.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('selected-answer'));
        btn.classList.add('selected-answer');

        setTimeout(() => {
          advanceQuestion();
        }, 400);
      });
    });
  });

  function advanceQuestion() {
    if (currentQuestionIndex < questionCards.length - 1) {
      const activeCard = questionCards[currentQuestionIndex];
      activeCard.classList.add('exiting');
      activeCard.classList.remove('active');

      currentQuestionIndex++;
      const nextCard = questionCards[currentQuestionIndex];
      nextCard.classList.add('active');

      qProgressText.textContent = `Question ${currentQuestionIndex + 1} of ${questionCards.length}`;
    } else {
      goToScene(4);
    }
  }

  // ==========================================================================
  // SCENE 4: THE BUILD-UP
  // ==========================================================================
  let buildupTimer = null;
  const skipBuildupBtn = document.getElementById('skipBuildupBtn');

  function initBuildupScene() {
    const line1 = document.getElementById('buildupLine1');
    const line2 = document.getElementById('buildupLine2');
    const line3 = document.getElementById('buildupLine3');
    const countdownNum = document.getElementById('countdownNum');

    line1.classList.remove('show');
    line2.classList.remove('show');
    line3.classList.remove('show');

    let count = 3;
    countdownNum.textContent = count;

    setTimeout(() => line1.classList.add('show'), 300);
    setTimeout(() => line2.classList.add('show'), 1200);
    setTimeout(() => line3.classList.add('show'), 2100);

    if (buildupTimer) clearInterval(buildupTimer);

    buildupTimer = setInterval(() => {
      count--;
      if (count > 0) {
        countdownNum.textContent = count;
      } else {
        clearInterval(buildupTimer);
        goToScene(5);
      }
    }, 1200);
  }

  if (skipBuildupBtn) {
    skipBuildupBtn.addEventListener('click', () => {
      if (buildupTimer) clearInterval(buildupTimer);
      goToScene(5);
    });
  }

  // ==========================================================================
  // SCENE 5: THE ASK & PLAYFUL DODGING "NO" BUTTON
  // ==========================================================================
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const askButtonsStage = document.getElementById('askButtonsStage');
  const stickyNotesContainer = document.getElementById('stickyNotesContainer');

  let dodgeCount = 0;
  let yesScale = 1;
  const stickyMessages = [
    "Are you sure? 🥺",
    "Wait, misclick? 🙈",
    "Think about the boba! 🧋",
    "Re-calculating... ⚡",
    "Nice try! 😉",
    "Look how big the YES button is! ❤️",
    "You know you want to say yes! ✨",
    "Destiny says YES! 💫"
  ];

  function dodgeNoButton(e) {
    if (e) e.preventDefault();

    dodgeCount++;
    const stageRect = askButtonsStage.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();

    const maxX = stageRect.width - noRect.width;
    const maxY = stageRect.height - noRect.height;

    const randomX = Math.floor(Math.random() * (maxX - 20)) + 10;
    const randomY = Math.floor(Math.random() * (maxY - 20)) + 10;

    noBtn.style.left = `${randomX}px`;
    noBtn.style.top = `${randomY}px`;

    yesScale += 0.12;
    yesBtn.style.transform = `scale(${yesScale})`;
    yesBtn.style.boxShadow = `0 ${10 * yesScale}px ${25 * yesScale}px rgba(16, 185, 129, 0.6)`;

    spawnStickyNote(stickyMessages[dodgeCount % stickyMessages.length]);
  }

  function spawnStickyNote(msg) {
    const note = document.createElement('div');
    note.className = 'sticky-note';
    note.textContent = msg;

    const rot = Math.floor(Math.random() * 20) - 10;
    const topPos = Math.floor(Math.random() * 60) + 10;
    const leftPos = Math.floor(Math.random() * 70) + 15;

    note.style.top = `${topPos}%`;
    note.style.left = `${leftPos}%`;
    note.style.transform = `rotate(${rot}deg)`;

    stickyNotesContainer.appendChild(note);

    if (stickyNotesContainer.children.length > 5) {
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
  // SCENE 6: CELEBRATION & CONFETTI CANVAS ENGINE
  // ==========================================================================
  const confettiCanvas = document.getElementById('confettiCanvas');
  const ctx = confettiCanvas.getContext('2d');
  let confettiParticles = [];
  let confettiAnimId = null;

  function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function initCelebrationScene() {
    toggleAudio(true);
    createConfetti();
    animateConfetti();
  }

  function createConfetti() {
    confettiParticles = [];
    const colors = ['#FFB703', '#F4A261', '#10B981', '#E0E1DD', '#F43F5E'];
    const particleCount = 90;

    for (let i = 0; i < particleCount; i++) {
      confettiParticles.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height - confettiCanvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 3 + 2,
        speedX: Math.random() * 2 - 1,
        rotation: Math.random() * 360,
        rotSpeed: Math.random() * 4 - 2,
        isHeart: Math.random() > 0.6
      });
    }
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiParticles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;

      if (p.y > confettiCanvas.height) {
        p.y = -10;
        p.x = Math.random() * confettiCanvas.width;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.isHeart) {
        ctx.beginPath();
        ctx.arc(-p.size / 2, 0, p.size / 2, 0, Math.PI, true);
        ctx.arc(p.size / 2, 0, p.size / 2, 0, Math.PI, true);
        ctx.lineTo(0, p.size);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
      }

      ctx.restore();
    });

    if (currentScene === 6) {
      confettiAnimId = requestAnimationFrame(animateConfetti);
    }
  }

  const addToCalBtn = document.getElementById('addToCalBtn');
  const replayBtn = document.getElementById('replayBtn');

  if (addToCalBtn) {
    addToCalBtn.addEventListener('click', () => {
      alert("✨ Date ticket saved! Check your calendar for our special night out! ❤️");
    });
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
      currentQuestionIndex = 0;
      yesScale = 1;
      if (yesBtn) yesBtn.style.transform = 'scale(1)';
      if (noBtn) {
        noBtn.style.left = 'auto';
        noBtn.style.top = 'auto';
      }
      if (stickyNotesContainer) stickyNotesContainer.innerHTML = '';
      goToScene(1);
    });
  }
});
