const icon = (name) => `<i data-lucide="${name}"></i>`;
const replaceIcons = () => window.lucide?.createIcons({ attrs: { 'stroke-width': 2 } });
replaceIcons();

const header = document.querySelector('#siteHeader');
window.addEventListener('scroll', () => header.classList.toggle('is-scrolled', window.scrollY > 40), { passive: true });

const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
menuToggle.addEventListener('click', () => {
  const isOpen = !mobileMenu.hidden;
  mobileMenu.hidden = isOpen;
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.innerHTML = icon(isOpen ? 'menu' : 'x');
  replaceIcons();
});
mobileMenu.querySelectorAll('a, button').forEach((entry) => entry.addEventListener('click', () => { mobileMenu.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.innerHTML = icon('menu'); replaceIcons(); }));

const modal = document.querySelector('[data-audit-modal]');
const closeAudit = () => { modal.hidden = true; document.body.classList.remove('modal-open'); };
document.querySelectorAll('[data-open-audit]').forEach((button) => button.addEventListener('click', () => { modal.hidden = false; document.body.classList.add('modal-open'); }));
document.querySelectorAll('[data-close-audit]').forEach((button) => button.addEventListener('click', closeAudit));
modal.addEventListener('click', (event) => { if (event.target === modal) closeAudit(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeAudit(); });
document.querySelectorAll('[data-tab]').forEach((tab) => tab.addEventListener('click', () => { document.querySelectorAll('[data-tab]').forEach((item) => item.classList.toggle('active', item === tab)); document.querySelectorAll('[data-panel]').forEach((panel) => { panel.hidden = panel.dataset.panel !== tab.dataset.tab; }); }));

const form = document.querySelector('[data-contact-form]');
const formContent = document.querySelector('[data-form-content]');
const formSuccess = document.querySelector('[data-form-success]');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const submit = form.querySelector('button');
  submit.disabled = true;
  submit.textContent = 'Opening WhatsApp...';
  setTimeout(() => {
    const name = data.get('name');
    const email = data.get('email');
    const website = data.get('website');
    const service = data.get('service');
    const message = data.get('message');

    let body = `Hello Abhiram,\n\nI would like to make an enquiry through your SEO portfolio.\n\nName: ${name}\nEmail: ${email}`;
    if (website) {
      body += `\nWebsite/URL: ${website}`;
    }
    body += `\nService: ${service}\n\nMessage:\n${message}\n\nThank you.`;

    const whatsappUrl = `https://wa.me/918848677810?text=${encodeURIComponent(body)}`;
    window.open(whatsappUrl, '_blank');

    formContent.hidden = true;
    formSuccess.hidden = false;
  }, 600);
});
document.querySelector('[data-reset-form]').addEventListener('click', () => { form.reset(); formContent.hidden = false; formSuccess.hidden = true; const submit = form.querySelector('button'); submit.disabled = false; submit.innerHTML = `Submit Inquiry ${icon('send')}`; replaceIcons(); });
const backToTopBtn = document.querySelector('[data-back-to-top]');
if (backToTopBtn) {
  const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotionQuery.matches ? 'auto' : 'smooth'
    });
  });
  window.addEventListener('scroll', () => {
    backToTopBtn.classList.toggle('is-visible', window.scrollY > 400);
  }, { passive: true });
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) window.addEventListener('scroll', () => { const progress = Math.min(window.scrollY / 800, 1); document.querySelector('[data-parallax-image]').style.transform = `translateY(${progress * 5}%)`; document.querySelector('[data-parallax-content]').style.transform = `translateY(${progress * 16}px)`; }, { passive: true });

const whySequence = document.querySelector('[data-why-sequence]');
if (whySequence) {
  const whyStage = whySequence.querySelector('[data-why-stage]');
  const whyPairs = [...whySequence.querySelectorAll('[data-why-pair]')];
  const whyCurrent = whySequence.querySelector('[data-why-current]');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let whyEnhanced = false;
  let whyFrame = 0;

  const updateWhySequence = () => {
    whyFrame = 0;
    if (!whyEnhanced) return;
    const track = whySequence.getBoundingClientRect();
    const travel = Math.max(1, whySequence.offsetHeight - whyStage.offsetHeight);
    const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.15 - track.top) / travel));
    const activeIndex = Math.min(whyPairs.length - 1, Math.floor(progress * whyPairs.length));
    whyPairs.forEach((pair, index) => {
      pair.classList.toggle('is-active', index === activeIndex);
      pair.classList.toggle('is-past', index === activeIndex - 1);
      if (index === activeIndex) pair.removeAttribute('aria-hidden');
      else pair.setAttribute('aria-hidden', 'true');
    });
    whyCurrent.textContent = String(activeIndex + 1).padStart(2, '0');
  };

  const scheduleWhyUpdate = () => {
    if (!whyFrame) whyFrame = requestAnimationFrame(updateWhySequence);
  };

  const resetWhySequence = () => {
    window.removeEventListener('scroll', scheduleWhyUpdate);
    window.removeEventListener('resize', scheduleWhyUpdate);
    if (whyFrame) cancelAnimationFrame(whyFrame);
    whyFrame = 0;
    whySequence.classList.remove('is-enhanced');
    whyPairs.forEach((pair) => {
      pair.classList.remove('is-active', 'is-past', 'is-visible');
      pair.removeAttribute('aria-hidden');
    });
    whyCurrent.textContent = '01';
  };

  const configureWhySequence = () => {
    const shouldEnhance = !reducedMotionQuery.matches;
    if (shouldEnhance === whyEnhanced) {
      if (shouldEnhance) scheduleWhyUpdate();
      return;
    }
    resetWhySequence();
    whyEnhanced = shouldEnhance;
    if (shouldEnhance) {
      whySequence.classList.add('is-enhanced');
      window.addEventListener('scroll', scheduleWhyUpdate, { passive: true });
      window.addEventListener('resize', scheduleWhyUpdate);
      scheduleWhyUpdate();
    }
  };

  reducedMotionQuery.addEventListener('change', configureWhySequence);
  configureWhySequence();
}

const heroWords = [...document.querySelectorAll('#hero-main .hero-staggered-heading span')];
const heroFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const heroReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroWordHandlers = new Map();

const resetHeroWordInteraction = () => {
  heroWordHandlers.forEach((handlers, word) => {
    word.removeEventListener('pointerenter', handlers.enter);
    word.removeEventListener('pointermove', handlers.move);
    word.removeEventListener('pointerleave', handlers.leave);
    word.classList.remove('is-hovered');
    word.style.removeProperty('--word-x');
    word.style.removeProperty('--word-y');
    word.style.removeProperty('--word-rotate-x');
    word.style.removeProperty('--word-rotate-y');
  });
  heroWordHandlers.clear();
};

const configureHeroWordInteraction = () => {
  resetHeroWordInteraction();
  if (!heroFinePointer.matches || heroReducedMotion.matches) return;

  heroWords.forEach((word) => {
    const enter = () => word.classList.add('is-hovered');
    const move = (event) => {
      const bounds = word.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2)));
      const y = Math.max(-1, Math.min(1, (event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2)));
      word.style.setProperty('--word-x', `${x * 3}px`);
      word.style.setProperty('--word-y', `${y * 2.5}px`);
      word.style.setProperty('--word-rotate-x', `${y * -1.1}deg`);
      word.style.setProperty('--word-rotate-y', `${x * 1.2}deg`);
    };
    const leave = () => {
      word.classList.remove('is-hovered');
      word.style.removeProperty('--word-x');
      word.style.removeProperty('--word-y');
      word.style.removeProperty('--word-rotate-x');
      word.style.removeProperty('--word-rotate-y');
    };

    heroWordHandlers.set(word, { enter, move, leave });
    word.addEventListener('pointerenter', enter);
    word.addEventListener('pointermove', move);
    word.addEventListener('pointerleave', leave);
  });
};

heroFinePointer.addEventListener('change', configureHeroWordInteraction);
heroReducedMotion.addEventListener('change', configureHeroWordInteraction);
configureHeroWordInteraction();

const servicesScroll = document.querySelector('[data-seo-services-scroll]');
if (servicesScroll) {
  const servicesStage = servicesScroll.querySelector('[data-seo-services-stage]');
  const servicesWindow = servicesScroll.querySelector('[data-seo-services-window]');
  const servicesTrack = servicesScroll.querySelector('[data-seo-services-track]');
  const servicesReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let servicesEnhanced = false;
  let servicesFrame = 0;
  let servicesMaxShift = 0;

  const measureServicesTrack = () => {
    servicesMaxShift = Math.max(0, servicesWindow.clientWidth - servicesTrack.offsetWidth);
  };

  const updateServicesTrack = () => {
    servicesFrame = 0;
    if (!servicesEnhanced) return;
    const bounds = servicesScroll.getBoundingClientRect();
    const travel = Math.max(1, servicesScroll.offsetHeight - servicesStage.offsetHeight);
    const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.15 - bounds.top) / travel));
    servicesTrack.style.setProperty('--services-shift', `${servicesMaxShift * progress}px`);
  };

  const scheduleServicesUpdate = () => {
    if (!servicesFrame) servicesFrame = requestAnimationFrame(updateServicesTrack);
  };

  const handleServicesResize = () => {
    measureServicesTrack();
    scheduleServicesUpdate();
  };

  const configureServicesScroll = () => {
    const shouldEnhance = !servicesReducedMotion.matches;
    if (shouldEnhance === servicesEnhanced) {
      if (shouldEnhance) handleServicesResize();
      return;
    }
    servicesEnhanced = shouldEnhance;
    servicesScroll.classList.toggle('is-enhanced', servicesEnhanced);
    if (servicesEnhanced) {
      measureServicesTrack();
      window.addEventListener('scroll', scheduleServicesUpdate, { passive: true });
      window.addEventListener('resize', handleServicesResize);
      scheduleServicesUpdate();
      return;
    }
    window.removeEventListener('scroll', scheduleServicesUpdate);
    window.removeEventListener('resize', handleServicesResize);
    if (servicesFrame) cancelAnimationFrame(servicesFrame);
    servicesFrame = 0;
    servicesTrack.style.removeProperty('--services-shift');
  };

  servicesReducedMotion.addEventListener('change', configureServicesScroll);
  configureServicesScroll();
}

const riveTransition = document.querySelector('[data-rive-transition]');
const riveCanvas = document.querySelector('[data-rive-character]');

if (riveTransition && riveCanvas && window.rive) {
  const riveReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const riveTouchOnly = window.matchMedia('(hover: none) and (pointer: coarse)');
  let riveCharacter;
  let riveVisible = false;
  let latestRivePointer;
  let rivePointerFrame = 0;

  const usesStaticRiveFrame = () => riveReducedMotion.matches || riveTouchOnly.matches;

  const cancelRivePointerFrame = () => {
    if (rivePointerFrame) cancelAnimationFrame(rivePointerFrame);
    rivePointerFrame = 0;
    latestRivePointer = undefined;
  };

  const sendPointerToRive = (clientX, clientY) => {
    if (!riveCharacter || usesStaticRiveFrame() || !riveVisible) return;

    const stateMachines = (riveCharacter.animator?.stateMachines || [])
      .filter((stateMachine) => (
        stateMachine.playing && riveCharacter.runtime.hasListeners(stateMachine.instance)
      ))
      .map((stateMachine) => stateMachine.instance);

    if (!stateMachines.length) return;

    const bounds = riveCanvas.getBoundingClientRect();
    const runtime = riveCharacter.runtime;
    const forwardMatrix = runtime.computeAlignment(
      riveCharacter._layout.runtimeFit(runtime),
      riveCharacter._layout.runtimeAlignment(runtime),
      { minX: 0, minY: 0, maxX: bounds.width, maxY: bounds.height },
      riveCharacter.artboard.bounds,
      riveCharacter._layout.layoutScaleFactor,
    );
    const invertedMatrix = new runtime.Mat2D();
    const canvasCoordinates = new runtime.Vec2D(
      clientX - bounds.left,
      clientY - bounds.top,
    );

    forwardMatrix.invert(invertedMatrix);
    const riveCoordinates = runtime.mapXY(invertedMatrix, canvasCoordinates);

    stateMachines.forEach((stateMachine) => {
      stateMachine.pointerMove(riveCoordinates.x(), riveCoordinates.y());
    });

    riveCoordinates.delete();
    canvasCoordinates.delete();
    invertedMatrix.delete();
    forwardMatrix.delete();
  };

  document.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch' || usesStaticRiveFrame() || !riveVisible) return;

    latestRivePointer = { clientX: event.clientX, clientY: event.clientY };
    if (rivePointerFrame) return;

    rivePointerFrame = requestAnimationFrame(() => {
      rivePointerFrame = 0;
      if (latestRivePointer) {
        sendPointerToRive(latestRivePointer.clientX, latestRivePointer.clientY);
      }
    });
  }, { passive: true });

  const updateRivePlayback = () => {
    if (!riveCharacter) return;
    if (usesStaticRiveFrame() || !riveVisible) {
      cancelRivePointerFrame();
      riveCharacter.pause();
      return;
    }
    riveCharacter.play('State Machine 1');
  };

  const initializeRiveCharacter = () => {
    if (riveCharacter) return;

    riveCharacter = new window.rive.Rive({
      src: 'assets/28334-53514-interactive-character-follow.riv',
      canvas: riveCanvas,
      artboard: 'Main artboard',
      stateMachines: 'State Machine 1',
      autoplay: !usesStaticRiveFrame(),
      isTouchScrollEnabled: true,
      shouldDisableRiveListeners: true,
      layout: new window.rive.Layout({
        fit: window.rive.Fit.Contain,
        alignment: window.rive.Alignment.Center,
      }),
      onLoad: () => {
        riveCharacter.resizeDrawingSurfaceToCanvas();
        const artboard = riveCharacter.contents?.artboards.find(
          ({ name }) => name === 'Main artboard',
        );
        const inputs = riveCharacter.stateMachineInputs('State Machine 1') || [];

        window.riveCharacterDiagnostics = {
          artboard: artboard?.name,
              stateMachine: 'State Machine 1',
          inputs: inputs.map((input) => input.name),
        };

        riveTransition.dataset.riveReady = 'true';
        updateRivePlayback();
      },
      onLoadError: (error) => console.error('Unable to load the Rive character.', error),
    });
  };

  const riveObserver = new IntersectionObserver(
    ([entry]) => {
      riveVisible = entry.isIntersecting;
      if (riveVisible) initializeRiveCharacter();
      updateRivePlayback();
    },
    { threshold: 0.15 },
  );

  riveObserver.observe(riveTransition);
  riveReducedMotion.addEventListener('change', updateRivePlayback);
  riveTouchOnly.addEventListener('change', updateRivePlayback);
}
