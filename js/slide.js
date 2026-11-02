/**
 * 학술제 HTML 슬라이드덱 - Warm Editorial & Minimal Motion Engine (with Anime.js)
 */

class AcademicSlideDeck {
  constructor() {
    this.slides = document.querySelectorAll('.slide');
    this.totalSlides = this.slides.length;
    this.currentIndex = 0;
    this.progressBar = document.getElementById('progress-bar');
    this.deckContainer = document.getElementById('presentation-deck');
    this.helpModal = document.getElementById('help-modal');

    this.init();
  }

  init() {
    // 1. URL 해시 기반 슬라이드 위치 복원
    const hashMatch = window.location.hash.match(/#slide-(\d+)/);
    if (hashMatch) {
      const targetIndex = parseInt(hashMatch[1], 10) - 1;
      if (targetIndex >= 0 && targetIndex < this.totalSlides) {
        this.currentIndex = targetIndex;
      }
    }

    // 2. 이벤트 바인딩
    this.bindEvents();

    // 3. 반응형 16:9 스케일 계산
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    // 4. 초기 슬라이드 활성화 & 모션 구동
    this.updateSlide(true);
  }

  bindEvents() {
    // 키보드 조작
    window.addEventListener('keydown', (e) => {
      if (this.helpModal && this.helpModal.classList.contains('visible')) {
        if (e.key === 'Escape' || e.key === 'h' || e.key === 'H') {
          this.toggleHelp(false);
          return;
        }
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ': // Space
        case 'PageDown':
          e.preventDefault();
          this.next();
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
        case 'Backspace':
        case 'PageUp':
          e.preventDefault();
          this.prev();
          break;

        case 'Home':
          e.preventDefault();
          this.goTo(0);
          break;

        case 'End':
          e.preventDefault();
          this.goTo(this.totalSlides - 1);
          break;

        case 'f':
        case 'F':
          this.toggleFullscreen();
          break;

        case 'h':
        case 'H':
        case '?':
          this.toggleHelp();
          break;
      }
    });

    // 화면 컨트롤 버튼
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const btnHelp = document.getElementById('btn-help');

    if (btnNext) btnNext.addEventListener('click', () => this.next());
    if (btnPrev) btnPrev.addEventListener('click', () => this.prev());
    if (btnFullscreen) btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
    if (btnHelp) btnHelp.addEventListener('click', () => this.toggleHelp());

    if (this.helpModal) {
      this.helpModal.addEventListener('click', (e) => {
        if (e.target === this.helpModal) this.toggleHelp(false);
      });
    }

    // 레퍼런스 인용 뱃지 클릭 이벤트
    document.querySelectorAll('.ref-badge').forEach((badge) => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        const refId = e.currentTarget.getAttribute('data-ref');
        const activeSlide = this.slides[this.currentIndex];
        const targetFootnote = activeSlide.querySelector(`.footnote-item[data-ref="${refId}"]`);
        if (targetFootnote) {
          if (window.anime) {
            anime({
              targets: targetFootnote,
              backgroundColor: ['#ffedd5', 'transparent'],
              scale: [1.08, 1],
              duration: 1200,
              easing: 'easeOutQuad'
            });
          }
        }
      });
    });
  }

  handleResize() {
    if (!this.deckContainer) return;
    const baseWidth = 1280;
    const baseHeight = 720;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const scale = Math.min(
      (windowWidth - 30) / baseWidth,
      (windowHeight - 30) / baseHeight,
      1.25
    );

    this.deckContainer.style.transform = `scale(${scale})`;
    this.deckContainer.style.transformOrigin = 'center center';
  }

  next() {
    if (this.currentIndex < this.totalSlides - 1) {
      this.currentIndex++;
      this.updateSlide();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateSlide();
    }
  }

  goTo(index) {
    if (index >= 0 && index < this.totalSlides) {
      this.currentIndex = index;
      this.updateSlide();
    }
  }

  updateSlide(immediate = false) {
    this.slides.forEach((slide, idx) => {
      const isActive = idx === this.currentIndex;
      slide.classList.toggle('active', isActive);
    });

    // 상단 진행바
    const progressRatio = (this.currentIndex / (this.totalSlides - 1 || 1)) * 100;
    if (this.progressBar) {
      this.progressBar.style.width = `${progressRatio}%`;
    }

    // 슬라이드 번호 갱신
    const currentSlide = this.slides[this.currentIndex];
    const pageNumElem = currentSlide.querySelector('.slide-number');
    if (pageNumElem) {
      pageNumElem.textContent = `${this.currentIndex + 1} / ${this.totalSlides}`;
    }

    // URL 해시 동기화
    window.location.hash = `slide-${this.currentIndex + 1}`;

    // Anime.js 모션그래픽 실행
    this.playSlideMotions(currentSlide);
  }

  /**
   * 슬라이드 내의 모션 요소들 실행 (Anime.js)
   */
  playSlideMotions(slideElem) {
    if (!window.anime) return;

    // 1. 카드 & 그리드 Stagger 업 애니메이션
    const cards = slideElem.querySelectorAll('.card, .stagger-item');
    if (cards.length > 0) {
      anime({
        targets: cards,
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(70, { start: 100 }),
        duration: 650,
        easing: 'easeOutCubic'
      });
    }

    // 2. 가로 막대 차트 (Bar Graph) 모션
    const barFills = slideElem.querySelectorAll('.sns-bar-fill');
    if (barFills.length > 0) {
      barFills.forEach((bar) => {
        const targetWidth = bar.getAttribute('data-target-width') || '0%';
        anime({
          targets: bar,
          width: ['0%', targetWidth],
          duration: 900,
          delay: 200,
          easing: 'easeOutQuart'
        });
      });
    }

    // 3. Forest Plot (에러바 & 포인트) 모션
    const errorBars = slideElem.querySelectorAll('.forest-error-bar');
    if (errorBars.length > 0) {
      anime({
        targets: errorBars,
        scaleX: [0, 1],
        duration: 800,
        delay: anime.stagger(90, { start: 250 }),
        easing: 'easeOutBack'
      });
    }

    const forestPoints = slideElem.querySelectorAll('.forest-point');
    if (forestPoints.length > 0) {
      anime({
        targets: forestPoints,
        scale: [0, 1],
        duration: 600,
        delay: anime.stagger(90, { start: 380 }),
        easing: 'easeOutBack'
      });
    }

    // 4. 숫자 카운트업 (Number Count-up)
    const countMetrics = slideElem.querySelectorAll('[data-count-to]');
    countMetrics.forEach((elem) => {
      const targetVal = parseFloat(elem.getAttribute('data-count-to'));
      const decimals = parseInt(elem.getAttribute('data-decimals') || '0', 10);
      const prefix = elem.getAttribute('data-prefix') || '';
      const suffix = elem.getAttribute('data-suffix') || '';

      const counterObj = { val: 0 };
      anime({
        targets: counterObj,
        val: targetVal,
        round: decimals === 0 ? 1 : 10 ** decimals,
        duration: 1100,
        delay: 200,
        easing: 'easeOutExpo',
        update: () => {
          elem.textContent = `${prefix}${counterObj.val.toFixed(decimals)}${suffix}`;
        }
      });
    });

    // 5. CropArea0001 스타일 원형/반원 도넛 차트 스트로크 모션
    const donutPaths = slideElem.querySelectorAll('.donut-progress');
    donutPaths.forEach((donut) => {
      const percent = parseFloat(donut.getAttribute('data-percent') || '0');
      const circumference = 314; // 2 * PI * 50
      const targetOffset = circumference - (circumference * percent / 100);
      anime({
        targets: donut,
        strokeDashoffset: [circumference, targetOffset],
        duration: 1200,
        delay: 300,
        easing: 'easeOutExpo'
      });
    });

    // 6. SVG 라인 드로잉 모션 (이중차분 DID 그래프 등)
    const svgLines = slideElem.querySelectorAll('.motion-svg-line');
    if (svgLines.length > 0) {
      svgLines.forEach((line) => {
        const lineLength = line.getTotalLength ? line.getTotalLength() : 500;
        line.style.strokeDasharray = lineLength;
        line.style.strokeDashoffset = lineLength;
        anime({
          targets: line,
          strokeDashoffset: [lineLength, 0],
          duration: 1200,
          delay: 350,
          easing: 'easeInOutCubic'
        });
      });
    }

    const svgDots = slideElem.querySelectorAll('.motion-svg-dot');
    if (svgDots.length > 0) {
      anime({
        targets: svgDots,
        scale: [0, 1],
        duration: 500,
        delay: anime.stagger(100, { start: 800 }),
        easing: 'easeOutBack'
      });
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.log(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  toggleHelp(forceState) {
    if (!this.helpModal) return;
    if (forceState !== undefined) {
      this.helpModal.classList.toggle('visible', forceState);
    } else {
      this.helpModal.classList.toggle('visible');
    }
  }
}

// 브라우저 로드 완료 시 인스턴스 실행
document.addEventListener('DOMContentLoaded', () => {
  window.slideDeck = new AcademicSlideDeck();
});
