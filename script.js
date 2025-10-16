const container = document.querySelector('.container');
const navLinks = document.querySelectorAll('nav a');
const sections = document.querySelectorAll('.section');
const backgroundLayer = document.querySelector('.background-layer');

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

    const sectionIndex = Math.floor(currentScroll / window.innerWidth);
    const progressInSection = (currentScroll % window.innerWidth) / window.innerWidth;

    let blendedBgColor, blendedTextColor;

    if (progressInSection >= TRANSITION_START_POINT) {
        const transitionProgress = (progressInSection - TRANSITION_START_POINT) / (1 - TRANSITION_START_POINT);
        const bg1 = hexToRgb(sectionBgColors[sectionIndex]);
        const bg2 = hexToRgb(sectionBgColors[Math.min(sectionIndex + 1, sectionBgColors.length - 1)]);
        blendedBgColor = lerpColor(bg1, bg2, transitionProgress);
        const text1 = hexToRgb(sectionTextColors[sectionIndex]);
        const text2 = hexToRgb(sectionTextColors[Math.min(sectionIndex + 1, sectionTextColors.length - 1)]);
        blendedTextColor = lerpColor(text1, text2, transitionProgress);
    } else {
        blendedBgColor = hexToRgb(sectionBgColors[sectionIndex]);
        blendedTextColor = hexToRgb(sectionTextColors[sectionIndex]);
    }

    // CSS変数を更新
    const root = document.documentElement;
    root.style.setProperty('--bg-color', rgbToCss(blendedBgColor));
    root.style.setProperty('--primary-text-color', rgbToCss(blendedTextColor));
    root.style.setProperty('--secondary-text-color', `rgba(${blendedTextColor.r}, ${blendedTextColor.g}, ${blendedTextColor.b}, 0.7)`);
    root.style.setProperty('--card-bg-color', `rgba(${blendedTextColor.r}, ${blendedTextColor.g}, ${blendedTextColor.b}, 0.05)`);
    root.style.setProperty('--card-border-color', `rgba(${blendedTextColor.r}, ${blendedTextColor.g}, ${blendedTextColor.b}, 0.1)`);
    backgroundLayer.style.backgroundColor = rgbToCss(blendedBgColor);

    requestAnimationFrame(smoothScroll);
}

// --- イベントリスナーなど ---
document.addEventListener('wheel', (event) => {
    const sectionIndex = Math.floor(currentScroll / window.innerWidth);
    const activeSection = sections[sectionIndex];

    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        if (activeSection && activeSection.id === 'works') {
            event.preventDefault();
            targetScroll += event.deltaX;
            targetScroll = Math.max(0, targetScroll);
            targetScroll = Math.min(maxScroll, targetScroll);
        }
        return;
    }

    if (activeSection && activeSection.id === 'works') {
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

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            const sectionIndex = Array.from(sections).indexOf(targetSection);
            targetScroll = window.innerWidth * sectionIndex;
        }
    });
});

// --- 開始 ---
smoothScroll();