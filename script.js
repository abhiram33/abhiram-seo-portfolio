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
  let servicesStickyTop = 0;
  let servicesTravel = 1;

  // Natural smoothstep easing (Hermite interpolation) for fluid organic gliding
  const easeProgress = (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return t * t * (3 - 2 * t);
  };

  const measureServicesTrack = () => {
    const comp = window.getComputedStyle(servicesStage);
    const parsedTop = parseFloat(comp.top);
    servicesStickyTop = Number.isFinite(parsedTop) ? parsedTop : (window.innerHeight * 0.14);
    servicesTravel = Math.max(1, servicesScroll.offsetHeight - servicesStage.offsetHeight);
    const available = servicesWindow.clientWidth - servicesTrack.offsetWidth;
    servicesMaxShift = Math.max(0, available);
  };

  const updateServicesTrack = () => {
    servicesFrame = 0;
    if (!servicesEnhanced) return;
    const bounds = servicesScroll.getBoundingClientRect();
    const scrolled = servicesStickyTop - bounds.top;
    const rawProgress = Math.min(1, Math.max(0, scrolled / servicesTravel));
    const eased = easeProgress(rawProgress);
    const shift = (servicesMaxShift * eased).toFixed(2);
    servicesTrack.style.setProperty('--services-shift', `${shift}px`);
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

const seoServiceSelect = document.getElementById('seo-service-select');
const whatsappEnquiryBtn = document.getElementById('whatsapp-enquiry-btn');
const seoSelectError = document.getElementById('seo-select-error');

if (seoServiceSelect && whatsappEnquiryBtn) {
  seoServiceSelect.addEventListener('change', () => {
    if (seoServiceSelect.value) {
      seoServiceSelect.classList.remove('has-error');
      if (seoSelectError) {
        seoSelectError.hidden = true;
      }
    }
  });

  whatsappEnquiryBtn.addEventListener('click', (event) => {
    event.preventDefault();

    const selectedService = seoServiceSelect.value ? seoServiceSelect.value.trim() : '';

    if (!selectedService) {
      seoServiceSelect.classList.remove('has-error');
      // trigger reflow to re-run shake animation if clicked multiple times
      void seoServiceSelect.offsetWidth;
      seoServiceSelect.classList.add('has-error');

      if (seoSelectError) {
        seoSelectError.hidden = false;
      }
      seoServiceSelect.focus();
      return;
    }

    const message = `Hello Abhiram,\n\nI would like to enquire about your SEO services.\n\nService required: ${selectedService}\n\nI found your portfolio and would like to discuss my requirements.\n\nThank you.`;
    const whatsappUrl = `https://wa.me/918848677810?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  });
}

// SEO Process continuous scroll-linked parallax animation
(() => {
  const processSection = document.getElementById('process');
  const processGrid = document.querySelector('.process-grid');
  if (!processSection || !processGrid) return;

  const leftCards = processGrid.querySelectorAll('[data-scroll-direction="left"]');
  const rightCards = processGrid.querySelectorAll('[data-scroll-direction="right"]');
  if (!leftCards.length || !rightCards.length) return;

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isIntersecting = false;
  let rafId = 0;
  let lastTxLeft = null;
  let lastTxRight = null;

  let sectionTop = 0;
  let sectionHeight = 0;
  let viewportHeight = window.innerHeight;
  let maxDistance = 0;

  const getResponsiveDistance = () => {
    if (reducedMotionQuery.matches) return 0;
    const w = window.innerWidth;
    if (w >= 1440) return 120;
    if (w >= 1200) return 100;
    if (w >= 1024) return 80;
    if (w >= 768) return 60;
    if (w >= 640) return 40;
    if (w >= 440) return 18;
    return 0;
  };

  const measure = () => {
    const rect = processSection.getBoundingClientRect();
    sectionTop = rect.top + window.scrollY;
    sectionHeight = rect.height;
    viewportHeight = window.innerHeight;
    maxDistance = getResponsiveDistance();
  };

  const updateOffsets = () => {
    rafId = 0;

    if (reducedMotionQuery.matches || maxDistance === 0) {
      if (lastTxLeft !== 0 || lastTxRight !== 0) {
        processGrid.style.setProperty('--process-tx-left', '0px');
        processGrid.style.setProperty('--process-tx-right', '0px');
        lastTxLeft = 0;
        lastTxRight = 0;
      }
      return;
    }

    const rangeStart = sectionTop - viewportHeight * 0.9;
    const rangeEnd = sectionTop + sectionHeight - viewportHeight * 0.1;
    const rangeSpan = Math.max(1, rangeEnd - rangeStart);

    const progress = Math.max(0, Math.min(1, (window.scrollY - rangeStart) / rangeSpan));

    // First row continuously translates LEFT: 0px -> -maxDistance
    const txLeft = Number((-progress * maxDistance).toFixed(2));
    // Second row continuously translates RIGHT: 0px -> +maxDistance
    const txRight = Number((progress * maxDistance).toFixed(2));

    if (txLeft !== lastTxLeft) {
      processGrid.style.setProperty('--process-tx-left', `${txLeft}px`);
      lastTxLeft = txLeft;
    }
    if (txRight !== lastTxRight) {
      processGrid.style.setProperty('--process-tx-right', `${txRight}px`);
      lastTxRight = txRight;
    }
  };

  const onScroll = () => {
    if (!rafId && isIntersecting && !reducedMotionQuery.matches) {
      rafId = requestAnimationFrame(updateOffsets);
    }
  };

  const onResize = () => {
    measure();
    updateOffsets();
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      isIntersecting = entry.isIntersecting;
      if (isIntersecting) {
        measure();
        updateOffsets();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });
      } else {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      }
    },
    { rootMargin: '120px 0px 120px 0px', threshold: 0 }
  );

  measure();
  updateOffsets();
  observer.observe(processSection);

  reducedMotionQuery.addEventListener('change', () => {
    measure();
    updateOffsets();
  });
})();

// ==========================================================================
// INTERACTIVE SEO SOLAR SYSTEM CONTROLLER
// ==========================================================================
(() => {
  const solarSection = document.querySelector('[data-seo-solar-system]');
  if (!solarSection) return;

  const solarStage = solarSection.querySelector('[data-solar-stage]');
  const pauseToggleBtn = solarSection.querySelector('[data-solar-pause-toggle], [data-solar-toggle]');
  const planetButtons = [...solarSection.querySelectorAll('.solar-planet-btn')];
  const orbitTracks = [...solarSection.querySelectorAll('.orbit-track')];
  const chipButtons = [...solarSection.querySelectorAll('.solar-chip')];
  
  const infoPanel = solarSection.querySelector('#solarInfoPanel');
  const badgeEl = solarSection.querySelector('#solarPlanetBadge');
  const badgeTextEl = solarSection.querySelector('#solarBadgeText');
  const titleEl = solarSection.querySelector('#solarServiceTitle');
  const descEl = solarSection.querySelector('#solarServiceDesc');
  const focusGridEl = solarSection.querySelector('#solarFocusGrid');
  const inquireCtaEl = solarSection.querySelector('#solarInquireCta');

  const PLANET_DATA = {
    'on-page': {
      index: 0,
      name: 'On-Page SEO',
      colorName: 'Electric Blue',
      colorHex: '#3b82f6',
      badgeText: 'Planet 01 · Electric Blue',
      description: 'Optimize page titles, meta descriptions, headings, internal links, and content structure to help search engines understand your pages.',
      focusAreas: [
        'Keyword optimization',
        'Meta titles and descriptions',
        'Heading structure',
        'Internal linking',
        'On-page content optimization'
      ],
      contactOption: 'On-Page SEO'
    },
    'off-page': {
      index: 1,
      name: 'Off-Page SEO',
      colorName: 'Purple',
      colorHex: '#a855f7',
      badgeText: 'Planet 02 · Purple',
      description: 'Build website authority through relevant backlinks, digital PR, brand mentions, and trustworthy external signals.',
      focusAreas: [
        'Backlink building',
        'Website authority',
        'Digital PR',
        'Brand mentions',
        'Link acquisition'
      ],
      contactOption: 'Off-Page SEO & Link Building'
    },
    'technical': {
      index: 2,
      name: 'Technical SEO',
      colorName: 'Cyan',
      colorHex: '#06b6d4',
      badgeText: 'Planet 03 · Cyan',
      description: 'Improve crawling, indexing, website architecture, structured data, site speed, mobile usability, and Core Web Vitals.',
      focusAreas: [
        'Crawling',
        'Indexing',
        'Core Web Vitals',
        'Website performance',
        'Structured data',
        'Technical audits'
      ],
      contactOption: 'Technical SEO Audit'
    },
    'local': {
      index: 3,
      name: 'Local SEO',
      colorName: 'Green',
      colorHex: '#10b981',
      badgeText: 'Planet 04 · Green',
      description: 'Improve local search visibility through business profile optimization, local landing pages, reviews, and consistent business information.',
      focusAreas: [
        'Local search rankings',
        'Google Business Profile optimization',
        'Local citations',
        'Reviews',
        'Local landing pages'
      ],
      contactOption: 'Local SEO'
    },
    'content': {
      index: 4,
      name: 'Content SEO',
      colorName: 'Orange',
      colorHex: '#f97316',
      badgeText: 'Planet 05 · Orange',
      description: 'Create useful, search-intent-focused content that answers audience questions and builds topical authority.',
      focusAreas: [
        'Content strategy',
        'Search intent',
        'Topical authority',
        'Content optimization',
        'Organic growth'
      ],
      contactOption: 'SEO Content Optimization'
    },
    'keyword-research': {
      index: 5,
      name: 'Keyword Research',
      colorName: 'Silver-Blue',
      colorHex: '#94a3b8',
      badgeText: 'Planet 06 · Silver-Blue',
      description: 'Discover relevant search terms by analyzing search intent, competition, keyword opportunities, and audience needs.',
      focusAreas: [
        'Keyword discovery',
        'Search demand',
        'Search intent analysis',
        'Competitor keyword analysis',
        'Keyword opportunities'
      ],
      contactOption: 'Keyword Research'
    }
  };

  const selectPlanet = (planetId) => {
    if (!PLANET_DATA[planetId]) return;
    const data = PLANET_DATA[planetId];

    // Update active planet buttons
    planetButtons.forEach((btn) => {
      const match = btn.dataset.planetId === planetId;
      btn.classList.toggle('is-active', match);
      btn.setAttribute('aria-pressed', String(match));
    });

    // Update orbit track active classes
    orbitTracks.forEach((track, idx) => {
      track.classList.toggle('is-active', idx === data.index);
    });

    // Update chips
    chipButtons.forEach((chip) => {
      const match = chip.dataset.chipId === planetId;
      chip.classList.toggle('is-active', match);
      chip.setAttribute('aria-selected', String(match));
    });

    // Animate info panel update
    if (infoPanel) {
      infoPanel.classList.add('is-updating');
      setTimeout(() => {
        if (badgeTextEl) badgeTextEl.textContent = data.badgeText;
        if (badgeEl) {
          const orb = badgeEl.querySelector('.badge-orb');
          if (orb) {
            orb.style.backgroundColor = data.colorHex;
            orb.style.boxShadow = `0 0 8px ${data.colorHex}`;
          }
        }
        if (titleEl) titleEl.textContent = data.name;
        if (descEl) descEl.textContent = data.description;
        
        if (focusGridEl) {
          focusGridEl.innerHTML = data.focusAreas
            .map((item) => `<li><span class="focus-marker" style="background:${data.colorHex};box-shadow:0 0 8px ${data.colorHex};"></span><span>${item}</span></li>`)
            .join('');
        }

        if (inquireCtaEl) {
          inquireCtaEl.dataset.inquireService = data.contactOption;
          const textSpan = inquireCtaEl.querySelector('span');
          if (textSpan) textSpan.textContent = `Inquire About ${data.name}`;
        }

        infoPanel.classList.remove('is-updating');
      }, 120);
    }
  };

  // Wire up planet click / keyboard
  planetButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      selectPlanet(btn.dataset.planetId);
    });
  });

  // Wire up chips click
  chipButtons.forEach((chip) => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      selectPlanet(chip.dataset.chipId);
    });
  });

  // Orbit pause toggle
  if (pauseToggleBtn && solarStage) {
    let isPaused = false;
    pauseToggleBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      solarStage.classList.toggle('is-paused', isPaused);
      pauseToggleBtn.classList.toggle('is-paused', isPaused);
      pauseToggleBtn.innerHTML = `
        <span class="solar-status-dot"></span>
        <span class="solar-toggle-text">${isPaused ? 'Paused' : 'Active Orbits'}</span>
        <i data-lucide="${isPaused ? 'play' : 'pause'}"></i>
      `;
      window.lucide?.createIcons({ attrs: { 'stroke-width': 2 } });
    });
  }

  // Quick Inquire CTA to WhatsApp selector integration
  if (inquireCtaEl) {
    inquireCtaEl.addEventListener('click', (e) => {
      const serviceVal = inquireCtaEl.dataset.inquireService;
      const selectEl = document.getElementById('seo-service-select');
      if (selectEl && serviceVal) {
        selectEl.value = serviceVal;
        selectEl.classList.remove('has-error');
        const errEl = document.getElementById('seo-select-error');
        if (errEl) errEl.hidden = true;
      }
    });
  }
})();



