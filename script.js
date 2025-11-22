// Initialize Lenis for smooth scrolling (if needed later, currently using custom smoothScroll)
// const lenis = new Lenis({ ... });

// グローバル変数を宣言（初期値はnull）
let container;
let sections;
let backgroundLayer;
let spotlightOverlay;
let scrollIndicator;
let hamburgerMenu;
let closeMenuButton;
let navLinks;
let body;
let cursorDot;
let cursorRing;

// --- 設定 ---
const ease = 0.075;
const TRANSITION_START_POINT = 0.8;

const sectionBgColors = [
    "#111111", // Intro (黒)
    "#1a1a2e", // Concept (ダークブルー)
    "#1a2a1a", // Works (ダークグリーン)
    "#FFFFFF", // Service (白)
    "#FFFFFF", // Gallery (白 - 変更: Serviceからの遷移をスキップ)
    "#111111"  // About & Contact (黒)
];

const sectionTextColors = [
    "#FFFFFF", // Intro (白)
    "#FFFFFF", // Concept
    "#FFFFFF", // Works
    "#000000", // Service (黒)
    "#000000", // Gallery (黒 - 背景白に合わせて変更)
    "#FFFFFF"  // About & Contact (白)
];

// --- 変数 ---
let targetScroll = 0;
let currentScroll = 0;
let maxScroll = 0; // 初期化時に計算

let mouseX = 0;
let mouseY = 0;
let ringX = 0;
let ringY = 0;
const ringEase = 0.1;

// Helper to check if mobile
function checkMobile() {
    return window.innerWidth <= 768;
}

function cursorAnimation() {
    if (checkMobile() || !cursorDot || !cursorRing) return; // Disable on mobile or if elements missing

    // ドットは即時追従
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';

    // リングは遅れて追従
    ringX += (mouseX - ringX) * ringEase;
    ringY += (mouseY - ringY) * ringEase;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';

    requestAnimationFrame(cursorAnimation);
}

// hoverable要素にイベントリスナーを設定する関数
function setupHoverables() {
    if (checkMobile()) return;
    const hoverables = document.querySelectorAll('a'); // 動的に生成されたaタグも含む
    hoverables.forEach(el => {
        // 既存のリスナーが重複しないように一度削除してから追加
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
    });
}

function handleMouseEnter() {
    document.body.classList.add('is-hovering');
}

function handleMouseLeave() {
    document.body.classList.remove('is-hovering');
}

// --- 色変換のヘルパー関数 ---
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function rgbToCss(rgb) {
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

function lerpColor(color1, color2, amount) {
    const r = Math.round(color1.r + (color2.r - color1.r) * amount);
    const g = Math.round(color1.g + (color2.g - color1.g) * amount);
    const b = Math.round(color1.b + (color2.b - color1.b) * amount);
    return { r, g, b };
}

// --- メインの処理 ---
function smoothScroll() {
    if (checkMobile() || !container) return; // Disable custom smooth scroll on mobile

    currentScroll += (targetScroll - currentScroll) * ease;
    container.style.transform = `translateX(-${currentScroll}px)`;

    const sectionIndex = Math.round(currentScroll / window.innerWidth);
    const progressInSection = (currentScroll % window.innerWidth) / window.innerWidth;

    // --- Color Transition ---
    let blendedBgColor, blendedTextColor;
    const currentFloorIndex = Math.floor(currentScroll / window.innerWidth);
    const currentProgress = (currentScroll % window.innerWidth) / window.innerWidth;

    if (currentProgress >= TRANSITION_START_POINT) {
        const transitionProgress = (currentProgress - TRANSITION_START_POINT) / (1 - TRANSITION_START_POINT);
        const bg1 = hexToRgb(sectionBgColors[currentFloorIndex]);
        const bg2 = hexToRgb(sectionBgColors[Math.min(currentFloorIndex + 1, sectionBgColors.length - 1)]);
        blendedBgColor = lerpColor(bg1, bg2, transitionProgress);
        const text1 = hexToRgb(sectionTextColors[currentFloorIndex]);
        const text2 = hexToRgb(sectionTextColors[Math.min(currentFloorIndex + 1, sectionTextColors.length - 1)]);
        blendedTextColor = lerpColor(text1, text2, transitionProgress);
    } else {
        blendedBgColor = hexToRgb(sectionBgColors[currentFloorIndex]);
        blendedTextColor = hexToRgb(sectionTextColors[currentFloorIndex]);
    }

    const root = document.documentElement;
    root.style.setProperty('--bg-color', rgbToCss(blendedBgColor));
    root.style.setProperty('--primary-text-color', rgbToCss(blendedTextColor));
    root.style.setProperty('--secondary-text-color', `rgba(${blendedTextColor.r}, ${blendedTextColor.g}, ${blendedTextColor.b}, 0.7)`);
    root.style.setProperty('--card-bg-color', `rgba(${blendedTextColor.r}, ${blendedTextColor.g}, ${blendedTextColor.b}, 0.05)`);
    root.style.setProperty('--card-border-color', `rgba(${blendedTextColor.r}, ${blendedTextColor.g}, ${blendedTextColor.b}, 0.1)`);
    if (backgroundLayer) backgroundLayer.style.backgroundColor = rgbToCss(blendedBgColor);

    // --- Blur Transition ---
    const BLUR_START_POINT = 0.5;
    const MAX_BLUR = 20; // in pixels

    if (sections) {
        sections.forEach((section, index) => {
            let blurAmount = 0;
            if (index === currentFloorIndex && currentProgress > BLUR_START_POINT) {
                // Current section blurring out
                const blurProgress = (currentProgress - BLUR_START_POINT) / (1 - BLUR_START_POINT);
                blurAmount = blurProgress * MAX_BLUR;
            } else if (index === currentFloorIndex + 1 && currentProgress > BLUR_START_POINT) {
                // Next section blurring in
                const blurProgress = (currentProgress - BLUR_START_POINT) / (1 - BLUR_START_POINT);
                blurAmount = (1 - blurProgress) * MAX_BLUR;
            } else if (index !== currentFloorIndex) {
                // Ensure other sections are not blurred, or fully blurred if they are the next one
                blurAmount = (index === currentFloorIndex + 1) ? MAX_BLUR : 0;
            }
            section.style.filter = `blur(${blurAmount}px)`;
        });
    }

    // --- Scroll Indicator Logic for works/service sections ---
    if (sections && sections[sectionIndex]) {
        if (sections[sectionIndex].id === 'works') {
            scrollIndicator.classList.add('is-works-section');
            spotlightOverlay.classList.add('is-works-section-active');
        } else {
            scrollIndicator.classList.remove('is-works-section');
            spotlightOverlay.classList.remove('is-works-section-active');
        }

        // --- Scroll Indicator for Last Section ---
        const scrollText = scrollIndicator.querySelector('.scroll-text');
        const isLastSection = sectionIndex === sections.length - 1;
        scrollIndicator.classList.toggle('is-back-to-top', isLastSection);
        if (isLastSection) {
            scrollText.textContent = 'BACK TO TOP';
        } else {
            scrollText.textContent = 'SCROLL';
        }
    }

    requestAnimationFrame(smoothScroll);
}

function setupMenu() {
    if (!hamburgerMenu) return;

    hamburgerMenu.addEventListener('click', () => {
        body.classList.toggle('is-menu-open');
    });

    closeMenuButton.addEventListener('click', () => {
        body.classList.remove('is-menu-open');
    });

    navLinks.forEach((link, index) => {
        link.style.setProperty('--i', index);
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');

            // 内部アンカーリンクの場合のみpreventDefault()を実行
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                body.classList.remove('is-menu-open');

                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    if (checkMobile()) {
                        // Mobile: Native scroll
                        const targetOffset = targetSection.offsetTop;
                        window.scrollTo({ top: targetOffset, behavior: 'smooth' });
                    } else {
                        // PC: Custom horizontal scroll
                        const sectionIndex = Array.from(sections).indexOf(targetSection);
                        setTimeout(() => {
                            targetScroll = window.innerWidth * sectionIndex;
                        }, 400);
                    }
                }
            } else {
                // 外部/絶対パスのリンクの場合、デフォルトの動作を許可
                body.classList.remove('is-menu-open'); // メニューは閉じる
            }
        });
    });
}

// --- Works Slider from JSON ---

// 作品データからslide要素を生成する関数
function createWorksSlide(work) {
    const slide = document.createElement('div');
    slide.classList.add('slide');

    // 各情報が存在する場合にのみHTMLを生成
    const titleHTML = `<h3>${work.title}</h3>`;

    const descriptionHTML = work.description
        ? `<p class="description">${work.description}</p>`
        : '';

    // 横並びにするメタ情報を生成
    const periodHTML = work.production_period
        ? `<span class="meta-item period"><strong>Period:</strong> ${work.production_period}</span>`
        : '';
    const clientHTML = work.client
        ? `<span class="meta-item client"><strong>Client:</strong> ${work.client}</span>`
        : '';
    const designHTML = work.design
        ? `<span class="meta-item design"><strong>Design:</strong> ${work.design}</span>`
        : '';

    // メタ情報を一つの行にまとめる
    const metaItems = [periodHTML, clientHTML, designHTML].filter(Boolean); // 空の要素を除外
    const metaLineHTML = metaItems.length > 0
        ? `<div class="meta-line">${metaItems.join('')}</div>`
        : '';

    const notesHTML = work.notes
        ? `<p class="notes">${work.notes}</p>`
        : '';

    slide.innerHTML = `
        <a href="${work.url}" target="_blank" rel="noopener noreferrer">
            <img src="${work.image}" alt="${work.title}" onerror="this.style.display='none'">
            <div class="slide-info">
                ${titleHTML}
                ${descriptionHTML}
                ${metaLineHTML}
                ${notesHTML}
            </div>
        </a>
    `;
    return slide;
}

// Worksセクションのスライダーを初期化する関数
async function initWorksSlider() {
    const sliderContainer = document.querySelector('.triple-slider-container');
    if (!sliderContainer) return;

    // Clear container first (for resize handling)
    sliderContainer.innerHTML = '';

    try {
        const response = await fetch('works.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const worksData = await response.json();

        if (!worksData || worksData.length === 0) {
            console.warn('No works data found or data is empty.');
            return;
        }

        if (checkMobile()) {
            // --- Mobile Layout (Single Horizontal Slider) ---
            const mobileSlider = document.createElement('div');
            mobileSlider.classList.add('mobile-works-slider');

            worksData.forEach(work => {
                mobileSlider.appendChild(createWorksSlide(work));
            });

            sliderContainer.appendChild(mobileSlider);

        } else {
            // --- PC Layout (Triple Slider) ---
            const slidesPerRow = 4; // 1行あたり4つのコンテンツ

            // worksDataを4つずつのチャンクに分割し、それぞれに対して行を生成
            for (let i = 0; i < worksData.length; i += slidesPerRow) {
                const chunk = worksData.slice(i, i + slidesPerRow);

                // 新しい行を作成
                const sliderRow = document.createElement('div');
                sliderRow.classList.add('slider-row');

                // 行のインデックス (0, 1, 2...) に基づいて交互にreverseクラスを適用
                const rowIndex = i / slidesPerRow;
                if (rowIndex % 2 !== 0) {
                    sliderRow.classList.add('reverse');
                }

                const sliderTrack = document.createElement('div');
                sliderTrack.classList.add('slider-track');

                // 無限ループのためにデータを2倍にする
                const combinedWorks = [...chunk, ...chunk];

                combinedWorks.forEach(work => {
                    sliderTrack.appendChild(createWorksSlide(work));
                });

                sliderRow.appendChild(sliderTrack);
                sliderContainer.appendChild(sliderRow);
            }
        }

        setupHoverables(); // スライド生成後にホバーイベントを設定

    } catch (error) {
        console.error("Could not load works data:", error);
    }
}

// --- Staggered Fade-in Animation for Service Section ---
function setupStaggeredAnimation() {
    const serviceItems = document.querySelectorAll('#service .service-content li');
    if (serviceItems.length === 0) return;

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    };

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    serviceItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 100}ms`;
        observer.observe(item);
    });
}

// --- Text Animation for Concept Section ---
function setupConceptAnimation() {
    const conceptH2 = document.querySelector('#concept h2');
    if (!conceptH2) return;

    const text = conceptH2.textContent;
    const words = text.split(' ');
    conceptH2.innerHTML = ''; // Clear original text

    words.forEach((word, index) => {
        const span = document.createElement('span');
        span.textContent = word;
        // Set delay for staggered effect
        span.style.transitionDelay = `${index * 150}ms`;
        conceptH2.appendChild(span);
        // Add space back in
        if (index < words.length - 1) {
            conceptH2.append(' ');
        }
    });

    // Observer to trigger the animation
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, { threshold: 0.5 });
    observer.observe(conceptH2);
}

// --- Intro Text Animation (Scattered to Gathered) ---
function setupIntroAnimation() {
    const introTitle = document.querySelector('#intro h1');
    const introSubtitle = document.querySelector('#intro p');

    if (!introTitle) return;

    // Split text into characters using SplitType
    // Check if SplitType is available
    if (typeof SplitType === 'undefined') {
        console.warn('SplitType is not defined. Skipping text animation.');
        return;
    }

    const splitTitle = new SplitType(introTitle, { types: 'chars' });

    // Random value generators
    const randomX = () => Math.random() * window.innerWidth - window.innerWidth / 2;
    const randomY = () => Math.random() * window.innerHeight - window.innerHeight / 2;
    const randomRotate = () => Math.random() * 360 - 180;
    const randomScale = () => Math.random() * 2 + 0.5;

    // Check if gsap is available
    if (typeof gsap === 'undefined') {
        console.warn('GSAP is not defined. Skipping text animation.');
        return;
    }

    // Animate characters from scattered positions
    gsap.from(splitTitle.chars, {
        duration: 2.5,
        opacity: 0,
        x: randomX,
        y: randomY,
        rotation: randomRotate,
        scale: randomScale,
        stagger: {
            amount: 1.5,
            from: "random"
        },
        ease: "power4.out", // Slow down at the end
        delay: 0.5
    });

    // Animate subtitle
    gsap.from(introSubtitle, {
        duration: 1.5,
        opacity: 0,
        y: 50,
        ease: "power2.out",
        delay: 3 // Wait for title animation to mostly finish
    });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize global variables
    container = document.querySelector('.container');
    sections = document.querySelectorAll('.section');
    backgroundLayer = document.querySelector('.background-layer');
    spotlightOverlay = document.querySelector('.spotlight-overlay');
    scrollIndicator = document.querySelector('.scroll-indicator');
    hamburgerMenu = document.querySelector('.hamburger-menu');
    closeMenuButton = document.querySelector('.close-menu-button');
    navLinks = document.querySelectorAll('.modal-menu nav a');
    body = document.body;
    cursorDot = document.querySelector('.cursor-dot');
    cursorRing = document.querySelector('.cursor-ring');

    if (container) {
        maxScroll = container.scrollWidth - window.innerWidth;
    } else {
        console.error("Container not found!");
    }

    // Event Listeners that rely on global variables
    window.addEventListener('mousemove', e => {
        if (checkMobile()) return;
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (spotlightOverlay) {
            spotlightOverlay.style.setProperty('--mouse-x', mouseX + 'px');
            spotlightOverlay.style.setProperty('--mouse-y', mouseY + 'px');
        }
    });

    document.addEventListener('wheel', (event) => {
        if (checkMobile() || !container) return; // Disable custom wheel scroll on mobile

        const sectionIndex = Math.floor(currentScroll / window.innerWidth);
        const activeSection = sections[sectionIndex];

        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
            if (activeSection && (activeSection.id === 'works' || activeSection.id === 'gallery')) {
                event.preventDefault();
                targetScroll += event.deltaX;
                targetScroll = Math.max(0, targetScroll);
                targetScroll = Math.min(maxScroll, targetScroll);
            }
            return;
        }

        if (activeSection && (activeSection.id === 'works' || activeSection.id === 'gallery')) {
            const el = activeSection;
            const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 1;
            const isAtTop = el.scrollTop === 0;
            const isScrollingDown = event.deltaY > 0;
            const isScrollingUp = event.deltaY < 0;

            if ((isScrollingDown && !isAtBottom) || (isScrollingUp && !isAtTop)) {
                return;
            }
        }

        event.preventDefault();
        targetScroll += event.deltaY;
        targetScroll = Math.max(0, targetScroll);
        targetScroll = Math.min(maxScroll, targetScroll);

    }, { passive: false });

    // Scroll Indicator Click
    if (scrollIndicator) {
        scrollIndicator.addEventListener('mouseenter', () => {
            if (checkMobile()) return;
            if (scrollIndicator.classList.contains('is-back-to-top')) {
                handleMouseEnter();
            }
        });
        scrollIndicator.addEventListener('mouseleave', () => {
            if (checkMobile()) return;
            handleMouseLeave();
        });
        scrollIndicator.addEventListener('click', () => {
            if (scrollIndicator.classList.contains('is-back-to-top')) {
                targetScroll = 0;
            }
        });
    }

    // Mobile Scroll Handler for Background Color and Blur
    window.addEventListener('scroll', () => {
        if (!checkMobile()) return;

        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;

        // Find current section index based on scroll position
        let currentSectionIndex = 0;
        let minDistance = Infinity;

        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const distance = Math.abs(rect.top);
            if (distance < minDistance) {
                minDistance = distance;
                currentSectionIndex = index;
            }
        });

        // Calculate progress within the current transition zone
        // Transition happens when the next section is coming into view
        const currentSection = sections[currentSectionIndex];
        const nextSection = sections[currentSectionIndex + 1];

        if (currentSection && nextSection) {
            const nextRect = nextSection.getBoundingClientRect();
            const nextTop = nextRect.top;

            // 次のセクションの上端が画面の下30% (0.7) に来たら開始し、
            // 画面の上20% (0.2) に来るまでに完了する
            const startTrigger = windowHeight * 0.7;
            const endTrigger = windowHeight * 0.2;

            let transitionProgress = 0;

            if (nextTop < startTrigger) {
                transitionProgress = (startTrigger - nextTop) / (startTrigger - endTrigger);
                transitionProgress = Math.max(0, Math.min(1, transitionProgress));

                // Aboutセクション(index 5)への遷移は即座に完了させる
                if (currentSectionIndex + 1 === 5 && transitionProgress > 0.1) {
                    transitionProgress = 1;
                }
                // Serviceセクション(index 3)への遷移も即座に完了させる（文字色を黒にするため）
                if (currentSectionIndex + 1 === 3 && transitionProgress > 0.1) {
                    transitionProgress = 1;
                }
            }

            if (transitionProgress > 0) {
                const bg1 = hexToRgb(sectionBgColors[currentSectionIndex]);
                const bg2 = hexToRgb(sectionBgColors[Math.min(currentSectionIndex + 1, sectionBgColors.length - 1)]);
                const blendedBgColor = lerpColor(bg1, bg2, transitionProgress);

                const text1 = hexToRgb(sectionTextColors[currentSectionIndex]);
                const text2 = hexToRgb(sectionTextColors[Math.min(currentSectionIndex + 1, sectionTextColors.length - 1)]);
                const blendedTextColor = lerpColor(text1, text2, transitionProgress);

                const root = document.documentElement;
                root.style.setProperty('--bg-color', rgbToCss(blendedBgColor));
                root.style.setProperty('--primary-text-color', rgbToCss(blendedTextColor));
                root.style.setProperty('--secondary-text-color', `rgba(${blendedTextColor.r}, ${blendedTextColor.g}, ${blendedTextColor.b}, 0.7)`);
                root.style.setProperty('--card-bg-color', `rgba(${blendedTextColor.r}, ${blendedTextColor.g}, ${blendedTextColor.b}, 0.05)`);
                root.style.setProperty('--card-border-color', `rgba(${blendedTextColor.r}, ${blendedTextColor.g}, ${blendedTextColor.b}, 0.1)`);
                if (backgroundLayer) backgroundLayer.style.backgroundColor = rgbToCss(blendedBgColor);
            } else {
                // Reset to current section color if not transitioning
                const bg = hexToRgb(sectionBgColors[currentSectionIndex]);
                const text = hexToRgb(sectionTextColors[currentSectionIndex]);

                const root = document.documentElement;
                root.style.setProperty('--bg-color', rgbToCss(bg));
                root.style.setProperty('--primary-text-color', rgbToCss(text));
                if (backgroundLayer) backgroundLayer.style.backgroundColor = rgbToCss(bg);
            }
        }
    });

    smoothScroll();
    cursorAnimation();
    setupStaggeredAnimation();
    setupConceptAnimation();
    setupMenu();
    initWorksSlider();
    setupIntroAnimation();
});

// Handle Resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (container) {
            maxScroll = container.scrollWidth - window.innerWidth;
        }
        initWorksSlider();
    }, 200);
});