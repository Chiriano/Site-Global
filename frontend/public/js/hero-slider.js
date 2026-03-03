/* ═══════════════════════════════════════════════════════════════════
   Hero Slider — Alpha Ultrapress
   hero-slider.js
   Dependência: nenhuma (vanilla JS puro)
═══════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ── Configuração ───────────────────────────────────────────── */
    const CONFIG = {
        autoplayDelay:      5000,  // ms entre slides
        transitionDuration: 900,   // ms (deve coincidir com CSS)
        progressBar:        true,  // exibir barra de progresso
    };

    /* ── Elementos ──────────────────────────────────────────────── */
    const slider = document.getElementById('heroSlider');
    if (!slider) return;

    const slides   = slider.querySelectorAll('.hs-slide');
    const dots     = slider.querySelectorAll('.hs-dot');
    const prevBtn  = slider.querySelector('#hsPrev');
    const nextBtn  = slider.querySelector('#hsNext');
    const progress = slider.querySelector('.hs-progress-bar');

    const total = slides.length;
    if (total === 0) return;

    let current        = 0;
    let autoplayTimer  = null;
    let progressTimer  = null;
    let isTransitioning = false;

    /* ── Ir para um slide específico ────────────────────────────── */
    function goTo(index) {
        if (isTransitioning) return;

        const next = (index + total) % total;
        if (next === current) return;

        isTransitioning = true;

        /* Desativa slide atual */
        slides[current].classList.remove('hs-slide--active');
        slides[current].setAttribute('aria-hidden', 'true');
        dots[current].classList.remove('hs-dot--active');
        dots[current].setAttribute('aria-selected', 'false');

        /* Ativa próximo slide */
        current = next;
        slides[current].classList.add('hs-slide--active');
        slides[current].setAttribute('aria-hidden', 'false');
        dots[current].classList.add('hs-dot--active');
        dots[current].setAttribute('aria-selected', 'true');

        /* Libera transição após duração da animação CSS */
        setTimeout(() => {
            isTransitioning = false;
        }, CONFIG.transitionDuration);
    }

    /* ── Próximo / Anterior ─────────────────────────────────────── */
    function goNext() { goTo(current + 1); }
    function goPrev() { goTo(current - 1); }

    /* ── Autoplay ───────────────────────────────────────────────── */
    function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(goNext, CONFIG.autoplayDelay);
        startProgress();
    }

    function stopAutoplay() {
        clearInterval(autoplayTimer);
        clearTimeout(progressTimer);
        autoplayTimer = null;
        resetProgress();
    }

    /* ── Barra de progresso ─────────────────────────────────────── */
    function startProgress() {
        if (!CONFIG.progressBar || !progress) return;
        resetProgress();
        /* Força reflow para reiniciar a transição */
        progress.offsetWidth; // eslint-disable-line no-unused-expressions
        progress.style.transition = `width ${CONFIG.autoplayDelay}ms linear`;
        progress.style.width = '100%';
    }

    function resetProgress() {
        if (!progress) return;
        progress.style.transition = 'none';
        progress.style.width = '0%';
    }

    /* ── Eventos dos controles ──────────────────────────────────── */
    prevBtn?.addEventListener('click', () => {
        goPrev();
        startAutoplay(); /* Reinicia timer no clique manual */
    });

    nextBtn?.addEventListener('click', () => {
        goNext();
        startAutoplay();
    });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            goTo(Number(dot.dataset.index));
            startAutoplay();
        });
    });

    /* ── Pausar ao passar o mouse ────────────────────────────────── */
    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);

    /* ── Suporte a toque (swipe) ────────────────────────────────── */
    let touchStartX = 0;

    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? goNext() : goPrev();
            startAutoplay();
        }
    }, { passive: true });

    /* ── Navegação por teclado ──────────────────────────────────── */
    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft')  { goPrev(); startAutoplay(); }
        if (e.key === 'ArrowRight') { goNext(); startAutoplay(); }
    });

    /* ── Visibilidade da aba (pausa ao sair da aba) ─────────────── */
    document.addEventListener('visibilitychange', () => {
        document.hidden ? stopAutoplay() : startAutoplay();
    });

    /* ── Inicialização ──────────────────────────────────────────── */
    startAutoplay();

})();
