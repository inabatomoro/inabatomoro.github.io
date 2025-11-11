const container = document.querySelector('.container');
const sections = document.querySelectorAll('.section');
const backgroundLayer = document.querySelector('.background-layer');
const spotlightOverlay = document.querySelector('.spotlight-overlay');
const scrollIndicator = document.querySelector('.scroll-indicator');
const hamburgerMenu = document.querySelector('.hamburger-menu');
const closeMenuButton = document.querySelector('.close-menu-button');
const navLinks = document.querySelectorAll('.modal-menu nav a');
const body = document.body;

// --- Custom Cursor --- 
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const hoverables = document.querySelectorAll('a');

let mouseX = 0;
let mouseY = 0;
let ringX = 0;
let ringY = 0;
const ringEase = 0.1;

function cursorAnimation() {
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

window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    spotlightOverlay.style.setProperty('--mouse-x', mouseX + 'px');
    spotlightOverlay.style.setProperty('--mouse-y', mouseY + 'px');
});

hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => {
        document.body.classList.add('is-hovering');
    });
    el.addEventListener('mouseleave', () => {
        document.body.classList.remove('is-hovering');
    });
});

// カーソルアニメーションを開始
cursorAnimation();

// --- 設定 ---
const ease = 0.075;
const TRANSITION_START_POINT = 0.8;

const sectionBgColors = [
    "#111111", // Intro (黒)
    "#1a1a2e", // Concept (ダークブルー)
    "#1a2a1a", // Works (ダークグリーン)
    "#FFFFFF", // Service (白)
    "#444444", // Gallery (中間グレー)
    "#111111"  // About & Contact (黒)
];

const sectionTextColors = [
    "#FFFFFF", // Intro (白)
    "#FFFFFF", // Concept
    "#FFFFFF", // Works
    "#000000", // Service (黒)
    "#FFFFFF", // Gallery (白)
    "#FFFFFF"  // About & Contact (白)
];

// --- 変数 ---
let targetScroll = 0;
let currentScroll = 0;
const maxScroll = container.scrollWidth - window.innerWidth;

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
    currentScroll += (targetScroll - currentScroll) * ease;
    container.style.transform = `translateX(-${currentScroll}px)`;

    const sectionIndex = Math.round(currentScroll / window.innerWidth);
    const progressInSection = (currentScroll % window.innerWidth) / window.innerWidth;

    console.log('sectionIndex:', sectionIndex);
    console.log('sectionBgColors[sectionIndex]:', sectionBgColors[sectionIndex]);

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
    backgroundLayer.style.backgroundColor = rgbToCss(blendedBgColor);

    // --- Blur Transition ---
    const BLUR_START_POINT = 0.5;
    const MAX_BLUR = 20; // in pixels

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

    // --- Scroll Indicator Logic ---
    // The class 'is-down-arrow' is now handled directly in CSS, so this logic is no longer needed.

    // --- Scroll Indicator Logic for works/service sections ---
    if (sections[sectionIndex].id === 'works') {
        scrollIndicator.classList.add('is-works-section');
    } else {
        scrollIndicator.classList.remove('is-works-section');
    }

    requestAnimationFrame(smoothScroll);
}

// --- イベントリスナー ---
window.addEventListener('mousemove', e => {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
    cursorRing.style.left = e.clientX + 'px';
    cursorRing.style.top = e.clientY + 'px';
});

hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorRing.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
        cursorRing.classList.remove('hover');
    });
});

document.addEventListener('wheel', (event) => {
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
            e.preventDefault();
            body.classList.remove('is-menu-open');
            
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const sectionIndex = Array.from(sections).indexOf(targetSection);
                // Add a delay to allow the menu to close before scrolling
                setTimeout(() => {
                    targetScroll = window.innerWidth * sectionIndex;
                }, 400);
            }
        });
    });
}

// --- 開始 ---
smoothScroll();


// --- Staggered Fade-in Animation for Service Section ---
function setupStaggeredAnimation() {
    const serviceItems = document.querySelectorAll('#service .service-content li');

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

setupStaggeredAnimation();


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

setupConceptAnimation();

document.addEventListener('DOMContentLoaded', () => {
    smoothScroll();
    cursorAnimation();
    setupStaggeredAnimation();
    setupConceptAnimation();
    setupMenu();
});



