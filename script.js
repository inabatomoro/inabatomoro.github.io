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
    "#FFFFFF", // Gallery (白)
    "#555555", // News (濃いグレー)
    "#111111"  // About & Contact (黒)
];

const sectionTextColors = [
    "#FFFFFF", // Intro (白)
    "#FFFFFF", // Concept
    "#FFFFFF", // Works
    "#000000", // Service (黒)
    "#000000", // Gallery (黒)
    "#FFFFFF", // News (白)
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

    // スクロール位置が負の値にならないように制限
    if (targetScroll < 0) targetScroll = 0;
    if (currentScroll < 0) currentScroll = 0;

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
                        if (sectionIndex === 0) {
                            // TOPに戻る場合はリセット関数を使用
                            resetScrollPosition();
                        } else {
                            setTimeout(() => {
                                targetScroll = window.innerWidth * sectionIndex;
                            }, 400);
                        }
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
        <div class="slide-card">
            <div class="slide-front">
                <a href="${work.url}" target="_blank" rel="noopener noreferrer">
                    <img src="${work.image}" alt="${work.title}" onerror="this.style.display='none'">
                    <div class="slide-info">
                        ${titleHTML}
                        ${descriptionHTML}
                        ${metaLineHTML}
                        ${notesHTML}
                    </div>
                </a>
            </div>
        </div>
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
        // Determine language and file path
        const lang = document.documentElement.lang === 'en' ? '_en' : '';
        const jsonFile = `works${lang}.json`;

        // キャッシュ対策のためにタイムスタンプを付与
        const response = await fetch(`${jsonFile}?t=` + new Date().getTime());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let worksData = await response.json();

        // データを倍にする（重複して表示）
        worksData = [...worksData, ...worksData];

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

    // ローディング完了を待ってからアニメーションを開始
    const startAnimation = () => {
        // アニメーション開始時にh1を表示
        introTitle.classList.add('animation-started');

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
            delay: 0.5 // ローディング完了後、さらに0.5秒待つ（1秒早く）
        });

        // サブタイトルのアニメーションは削除（タイピングアニメーションで処理するため）
    };

    // ローディング完了を待つ
    if (document.body.classList.contains('loaded')) {
        // 既にローディング完了している場合
        setTimeout(startAnimation, 500);
    } else {
        // ローディング完了を待つ
        const checkLoaded = setInterval(() => {
            if (document.body.classList.contains('loaded')) {
                clearInterval(checkLoaded);
                setTimeout(startAnimation, 500);
            }
        }, 100);
    }
}

// --- Loading Screen Animation ---
function initLoadingScreen() {
    // 既に読み込まれている場合は即座に表示
    if (document.readyState === 'complete') {
        setTimeout(() => {
            document.body.classList.add('loaded');
            // ローディング後にスクロール位置をリセット
            resetScrollPosition();
        }, 500);
    } else {
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.body.classList.add('loaded');
                // ローディング後にスクロール位置をリセット
                resetScrollPosition();
            }, 1500); // ローディングアニメーションの表示時間
        });
    }
}

// --- Reset Scroll Position ---
function resetScrollPosition() {
    if (checkMobile()) {
        // モバイルの場合は通常のスクロールをリセット
        window.scrollTo(0, 0);
        return;
    }

    if (!container) return;

    // スクロール位置を0にリセット
    targetScroll = 0;
    currentScroll = 0;
    container.style.transform = 'translateX(0)';

    // ウィンドウのスクロール位置もリセット
    window.scrollTo(0, 0);

    // URLのハッシュを削除（ページリロード時の位置ずれを防ぐ）
    if (window.location.hash) {
        history.replaceState(null, null, ' ');
    }
}

// --- Section Entry Animation ---
function setupSectionEntryAnimation() {
    // Introセクションは最初から表示
    const introSection = document.querySelector('#intro');
    if (introSection) {
        introSection.classList.add('is-visible');
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Intro以外のセクションを監視
    sections.forEach(section => {
        if (section.id !== 'intro') {
            observer.observe(section);
        }
    });
}

// --- Particle Animation ---
function initParticleAnimation() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 50;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.2
        };
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(createParticle());
        }
    }

    function updateParticles() {
        particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        });
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            ctx.fill();
        });

        // Connect nearby particles
        particles.forEach((particle, i) => {
            particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(otherParticle.x, otherParticle.y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 100)})`;
                    ctx.stroke();
                }
            });
        });
    }

    function animate() {
        updateParticles();
        drawParticles();
        requestAnimationFrame(animate);
    }

    resizeCanvas();
    initParticles();
    animate();

    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });
}

// --- Typing Animation ---
function setupTypingAnimation() {
    const firstElement = document.querySelector('.typing-text-first');
    const secondElement = document.querySelector('.typing-text-second');

    if (!firstElement) return;

    // 既に実行されている場合はスキップ（重複実行を防ぐ）
    if (firstElement.dataset.typingInitialized === 'true') return;
    firstElement.dataset.typingInitialized = 'true';

    const typingSpeed = 100;

    // テキストを保存（初期化時に取得）
    const firstText = firstElement.textContent.trim();
    const secondText = secondElement ? secondElement.textContent.trim() : '';

    // 初期状態を確実に非表示にする
    firstElement.textContent = '';
    firstElement.style.borderRight = '2px solid #aaa';
    firstElement.classList.remove('typing-active', 'complete');

    if (secondElement) {
        secondElement.textContent = '';
        secondElement.style.borderRight = '2px solid #aaa';
        secondElement.classList.remove('typing-active', 'complete');
    }

    let firstIndex = 0;
    let isSecondTypingStarted = false; // 2つ目のタイピングが開始されたかどうかを追跡

    function typeFirst() {
        // タイピング開始時に表示
        if (firstIndex === 0) {
            firstElement.classList.add('typing-active');
        }

        if (firstIndex < firstText.length) {
            firstElement.textContent += firstText.charAt(firstIndex);
            firstIndex++;
            setTimeout(typeFirst, typingSpeed);
        } else {
            firstElement.classList.remove('typing-active');
            firstElement.classList.add('complete');

            // 1つ目が完了したら2つ目を開始（1回だけ）
            if (secondElement && secondText && !isSecondTypingStarted) {
                isSecondTypingStarted = true;
                startSecondTyping();
            }
        }
    }

    // 2つ目のテキスト（ANALYZE / DESIGN / BUILD / OPERATE）のアニメーション
    function startSecondTyping() {
        // 念のため、テキストを再度クリア
        secondElement.textContent = '';
        secondElement.style.borderRight = '2px solid #aaa';

        let secondIndex = 0;

        function typeSecond() {
            // タイピング開始時に表示
            if (secondIndex === 0) {
                secondElement.classList.add('typing-active');
            }

            if (secondIndex < secondText.length) {
                // テキストを1文字ずつ追加（現在の長さをチェックして重複を防ぐ）
                const currentText = secondElement.textContent;
                if (currentText.length === secondIndex) {
                    secondElement.textContent = secondText.substring(0, secondIndex + 1);
                }
                secondIndex++;
                setTimeout(typeSecond, typingSpeed);
            } else {
                secondElement.classList.remove('typing-active');
                secondElement.classList.add('complete');
            }
        }

        // 少し間を置いてから開始
        setTimeout(() => {
            typeSecond();
        }, 300);
    }

    // ローディング完了を待ってからタイピングを開始
    const startTyping = () => {
        // Design Works with Studioのアニメーションが終わってから開始
        // delay: 0.5秒 + duration: 2.5秒 = 約3秒後から開始
        // さらに余裕を持たせるため、4秒後に開始
        setTimeout(() => {
            typeFirst();
        }, 4000);
    };

    // ローディング完了を待つ（確実に待つため）
    const waitForLoading = () => {
        if (document.body.classList.contains('loaded')) {
            startTyping();
        } else {
            // ローディング完了を待つ
            const checkLoaded = setInterval(() => {
                if (document.body.classList.contains('loaded')) {
                    clearInterval(checkLoaded);
                    startTyping();
                }
            }, 100);

            // タイムアウト（念のため10秒後に強制開始）
            setTimeout(() => {
                clearInterval(checkLoaded);
                startTyping();
            }, 10000);
        }
    };

    // DOMContentLoaded後に少し待ってからチェック
    setTimeout(() => {
        waitForLoading();
    }, 500);
}

// --- Parallax Effect ---
function setupParallaxEffect() {
    if (checkMobile()) return;

    const parallaxElements = document.querySelectorAll('.parallax-slow');

    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        parallaxElements.forEach(element => {
            const speed = 20;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;
            element.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

// --- Ripple Effect ---
function setupRippleEffect() {
    const buttons = document.querySelectorAll('.email-button, .hamburger-menu, .close-menu-button');

    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
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
        // 初期位置を確実に0に設定
        targetScroll = 0;
        currentScroll = 0;
        container.style.transform = 'translateX(0)';
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
                resetScrollPosition();
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

                // Aboutセクション(index 6)への遷移は即座に完了させる
                if (currentSectionIndex + 1 === 6 && transitionProgress > 0.1) {
                    transitionProgress = 1;
                }

                // Gallery(4) -> News(5) への遷移
                // Galleryの背景は白、Newsは濃いグレー。
                // Galleryの終わり際で自然に変わるようにする（デフォルトでOKだが、必要なら調整）
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

                // Adjust secondary colors based on primary text color brightness
                // Simple heuristic: if text is bright, secondary is dimmer white. If text is dark, secondary is gray.
                // For simplicity, just use opacity of primary
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

    // 最初にスクロール位置をリセット
    resetScrollPosition();

    // ハッシュが付いている場合は無視してトップに戻す
    if (window.location.hash) {
        setTimeout(() => {
            resetScrollPosition();
        }, 100);
    }

    smoothScroll();
    cursorAnimation();
    setupStaggeredAnimation();
    setupConceptAnimation();
    setupMenu();
    initWorksSlider();
    setupIntroAnimation();
    loadNews(); // News読み込み
    initLoadingScreen(); // ローディングアニメーション
    setupSectionEntryAnimation(); // セクション進入アニメーション
    initParticleAnimation(); // パーティクルアニメーション
    setupTypingAnimation(); // タイピングアニメーション
    setupParallaxEffect(); // パララックス効果
    setupRippleEffect(); // リップルエフェクト

    // ページ読み込み完了後に再度リセット（念のため）
    window.addEventListener('load', () => {
        setTimeout(() => {
            resetScrollPosition();
        }, 100);
    });
});

// --- News Loading & Modal ---
async function loadNews() {
    const newsList = document.querySelector('.news-list');
    if (!newsList) return;

    try {
        // Determine language and file path
        const lang = document.documentElement.lang === 'en' ? '_en' : '';
        const jsonFile = `news${lang}.json`;

        const response = await fetch(`${jsonFile}?t=` + new Date().getTime());
        if (!response.ok) throw new Error('Failed to load news');
        const newsData = await response.json();

        newsList.innerHTML = ''; // Clear existing content

        newsData.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('news-item');
            li.innerHTML = `
                <span class="news-date">${item.date}</span>
                <a href="${item.url}" class="news-title" data-id="${item.date + item.title}">${item.title}</a>
            `;
            newsList.appendChild(li);

            // Click Event for Modal
            const link = li.querySelector('.news-title');
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(item);
            });

            // Cursor Hover Effect
            link.addEventListener('mouseover', () => {
                if (cursorRing) cursorRing.classList.add('hovered'); // Use cursorRing or cursorDot based on design
                document.body.classList.add('is-hovering'); // Re-use existing hover logic
            });
            link.addEventListener('mouseleave', () => {
                if (cursorRing) cursorRing.classList.remove('hovered');
                document.body.classList.remove('is-hovering');
            });
        });
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

// --- Modal Logic ---
function openModal(item) {
    const modal = document.getElementById('news-modal');
    if (!modal) {
        console.error('Modal element not found');
        return;
    }

    const dateEl = document.getElementById('modal-date');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    if (dateEl) dateEl.textContent = item.date;
    if (titleEl) titleEl.textContent = item.title;
    if (bodyEl) bodyEl.innerHTML = item.content || '';

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    // Close button logic (re-bind every time or check if already bound? Better to bind once globally, but here for safety)
    const closeModal = modal.querySelector('.close-modal');
    if (closeModal) {
        closeModal.onclick = () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        };
    }

    // Outside click logic
    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    };
}

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