/* ============================================================
   STUDIO WORKS — interactions
   Lenis (smooth scroll) + GSAP ScrollTrigger
   ============================================================ */
(() => {
    'use strict';

    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

    /* ---------- Failsafe: CDN が落ちても閲覧できるように ---------- */
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        document.documentElement.classList.remove('js');
        document.body.classList.add('loaded');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* ---------- Lenis smooth scroll ---------- */
    let lenis = null;
    if (!prefersReduced && typeof Lenis !== 'undefined') {
        lenis = new Lenis({ duration: 1.15, smoothWheel: true });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    const stopScroll = () => { if (lenis) lenis.stop(); document.documentElement.style.overflow = lenis ? '' : 'hidden'; };
    const startScroll = () => { if (lenis) lenis.start(); document.documentElement.style.overflow = ''; };

    const scrollToTarget = (target) => {
        if (lenis) {
            lenis.scrollTo(target, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
        } else {
            const el = typeof target === 'string' ? $(target) : target;
            if (typeof target === 'number') window.scrollTo(0, target);
            else if (el) el.scrollIntoView();
        }
    };

    /* ---------- Text splitting ---------- */
    // スクリーンリーダーには sr-only の原文を読ませ、視覚用の分割文字は aria-hidden にする
    function splitChars(el) {
        const text = el.textContent;
        const chars = [];
        el.textContent = '';

        const sr = document.createElement('span');
        sr.className = 'sr-only';
        sr.textContent = text.trim();

        const wrap = document.createElement('span');
        wrap.className = 'split-chars';
        wrap.setAttribute('aria-hidden', 'true');

        for (const ch of text) {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = ch === ' ' ? ' ' : ch;
            wrap.appendChild(span);
            chars.push(span);
        }
        el.appendChild(sr);
        el.appendChild(wrap);
        el.classList.add('is-ready');
        return chars;
    }

    /* ---------- Preloader ---------- */
    const preloader = $('.preloader');
    const heroSplits = $$('.hero .split');
    const heroChars = [];
    heroSplits.forEach((el) => heroChars.push(...splitChars(el)));
    if (!prefersReduced) gsap.set(heroChars, { yPercent: 120 });

    function heroIntro() {
        if (prefersReduced) return;
        const tl = gsap.timeline();
        tl.to(heroChars, {
            yPercent: 0,
            duration: 1.2,
            ease: 'power4.out',
            stagger: 0.04
        })
            .from('.hero__eyebrow', { y: 24, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, '-=0.9')
            .from('.hero__field', { y: 24, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, '-=0.7')
            .from('.hero__lead', { y: 24, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, '-=0.65')
            .from('.hero__stats li', { y: 24, autoAlpha: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 }, '-=0.6')
            .from('.scroll-cue', { autoAlpha: 0, duration: 0.8 }, '-=0.4');

        // Stat count-up
        $$('[data-count]').forEach((el) => {
            const target = parseInt(el.textContent, 10);
            if (Number.isNaN(target)) return;
            const obj = { v: 0 };
            gsap.to(obj, {
                v: target,
                duration: 1.6,
                ease: 'power2.out',
                delay: 0.5,
                onUpdate: () => { el.textContent = Math.round(obj.v); }
            });
        });
    }

    function initPreloader() {
        if (!preloader) return;
        if (prefersReduced) {
            document.body.classList.add('loaded');
            return;
        }

        const countEl = $('#pre-count');
        const barEl = $('#pre-bar');
        const words = $('.preloader__words');

        let counterDone = false;
        let windowLoaded = document.readyState === 'complete';
        let finished = false;

        const counter = { v: 0 };
        gsap.to(counter, {
            v: 100,
            duration: 1.7,
            ease: 'power2.inOut',
            onUpdate: () => {
                const n = Math.round(counter.v);
                if (countEl) countEl.textContent = String(n).padStart(3, '0');
                if (barEl) barEl.style.width = n + '%';
            },
            onComplete: () => { counterDone = true; maybeFinish(); }
        });

        if (words) {
            // 3つの文言を同じ位置でクロスフェード（カクつく段階移動をやめる）
            const items = $$('li', words);
            items.forEach((li, i) => {
                if (i === 0) return;
                const at = 0.55 * i;
                gsap.to(items[i - 1], { autoAlpha: 0, duration: 0.3, ease: 'power2.inOut', delay: at });
                gsap.to(li, { autoAlpha: 1, duration: 0.3, ease: 'power2.inOut', delay: at + 0.08 });
            });
        }

        window.addEventListener('load', () => { windowLoaded = true; maybeFinish(); });
        // 何かが詰まっても 4.5 秒で必ず開ける
        setTimeout(() => { windowLoaded = true; counterDone = true; maybeFinish(); }, 4500);

        function maybeFinish() {
            if (finished || !counterDone || !windowLoaded) return;
            finished = true;
            gsap.timeline()
                .to(preloader, {
                    yPercent: -100,
                    duration: 0.9,
                    ease: 'expo.inOut',
                    onComplete: () => {
                        document.body.classList.add('loaded');
                        preloader.setAttribute('hidden', '');
                    }
                })
                .add(heroIntro, '-=0.25');
        }
    }

    /* ---------- Custom cursor ---------- */
    function initCursor() {
        if (isTouch || prefersReduced) return;
        const cursor = $('.cursor');
        if (!cursor) return;
        document.body.classList.add('has-cursor');

        const labelEl = $('.cursor__label');
        const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3.out' });
        const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3.out' });

        window.addEventListener('mousemove', (e) => {
            xTo(e.clientX);
            yTo(e.clientY);
        }, { passive: true });

        // Hover states (delegated so dynamic elements work too)
        document.addEventListener('mouseover', (e) => {
            const labelled = e.target.closest('[data-cursor]');
            if (labelled) {
                if (labelEl) labelEl.textContent = labelled.dataset.cursor;
                document.body.classList.add('cursor-label');
                return;
            }
            if (e.target.closest('a, button, [data-svc]')) {
                document.body.classList.add('cursor-hover');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('[data-cursor]')) document.body.classList.remove('cursor-label');
            if (e.target.closest('a, button, [data-svc]')) document.body.classList.remove('cursor-hover');
        });
    }

    /* ---------- Magnetic elements ---------- */
    function initMagnetic() {
        if (isTouch || prefersReduced) return;
        $$('[data-magnetic]').forEach((el) => {
            const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
            const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
                yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
            });
        });
    }

    /* ---------- Text scramble on hover ---------- */
    function initScramble() {
        if (isTouch || prefersReduced) return;
        const CHARS = '#/\\_—+=<>*';
        $$('[data-scramble]').forEach((el) => {
            const original = el.textContent;
            let frame = null;
            el.addEventListener('mouseenter', () => {
                if (frame) cancelAnimationFrame(frame);
                let i = 0;
                const total = original.length;
                const tick = () => {
                    i += 0.34;
                    const fixed = Math.floor(i);
                    let out = original.slice(0, fixed);
                    for (let j = fixed; j < total; j++) {
                        out += original[j] === ' ' ? ' ' : CHARS[(Math.random() * CHARS.length) | 0];
                    }
                    el.textContent = out;
                    if (fixed < total) frame = requestAnimationFrame(tick);
                    else el.textContent = original;
                };
                frame = requestAnimationFrame(tick);
            });
        });
    }

    /* ---------- Menu ---------- */
    function initMenu() {
        const btn = $('.menu-btn');
        const menu = $('#menu');
        if (!btn || !menu) return;

        const setOpen = (open) => {
            document.body.classList.toggle('is-menu-open', open);
            btn.setAttribute('aria-expanded', String(open));
            btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
            menu.setAttribute('aria-hidden', String(!open));
            if (open) stopScroll(); else startScroll();
        };

        btn.addEventListener('click', () => setOpen(!document.body.classList.contains('is-menu-open')));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.body.classList.contains('is-menu-open')) setOpen(false);
        });
        $$('.menu a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    }

    /* ---------- Smooth anchor navigation ---------- */
    function initAnchors() {
        $$('[data-scroll-to]').forEach((a) => {
            a.addEventListener('click', (e) => {
                const hash = a.getAttribute('href');
                if (!hash || !hash.startsWith('#')) return;
                e.preventDefault();
                const target = $(hash);
                if (!target) return;
                // メニュー内のリンクはメニューが閉じるのを待ってからスクロール
                setTimeout(() => scrollToTarget(target), a.closest('.menu') ? 350 : 0);
            });
        });
        const topBtn = $('#back-to-top');
        if (topBtn) topBtn.addEventListener('click', () => scrollToTarget(0));
    }

    /* ---------- Hero role rotator ---------- */
    function initRoleRotator() {
        const el = $('#hero-role');
        if (!el || prefersReduced) return;
        const roles = ['WEB PRODUCTION', 'WEB DEVELOPMENT', 'AI INTEGRATION'];
        let i = 0;
        setInterval(() => {
            gsap.to(el, {
                yPercent: -60,
                autoAlpha: 0,
                duration: 0.35,
                ease: 'power2.in',
                onComplete: () => {
                    i = (i + 1) % roles.length;
                    el.textContent = roles[i];
                    gsap.fromTo(el, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.35, ease: 'power2.out' });
                }
            });
        }, 2800);
    }

    /* ---------- Marquee ---------- */
    function initMarquee() {
        const track = $('#marquee-track');
        if (!track || prefersReduced) return;
        // 左から右へゆっくり流れ、スクロールに合わせて加速する
        const tween = gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, repeat: -1, duration: 46, ease: 'none' });
        ScrollTrigger.create({
            start: 0,
            end: 'max',
            onUpdate: (self) => {
                const v = Math.min(Math.abs(self.getVelocity()) / 1500, 2.5);
                gsap.to(tween, { timeScale: 1 + v, duration: 0.35, overwrite: true });
            }
        });
    }

    /* ---------- Generic section title reveals ---------- */
    function initSectionTitles() {
        $$('.section .split, .works__pin .split').forEach((el) => {
            const chars = splitChars(el);
            if (prefersReduced) return;
            gsap.set(chars, { yPercent: 120 });
            gsap.to(chars, {
                yPercent: 0,
                duration: 1.1,
                ease: 'power4.out',
                stagger: 0.03,
                scrollTrigger: {
                    trigger: el.closest('.section') || el,
                    start: 'top 78%',
                    once: true
                }
            });
        });
    }

    /* ---------- Concept: char-by-char scrub ---------- */
    function initScrubText() {
        $$('[data-scrub-text]').forEach((el) => {
            const chars = splitChars(el);
            if (prefersReduced) return;
            gsap.set(chars, { opacity: 0.14 });
            gsap.to(chars, {
                opacity: 1,
                ease: 'none',
                stagger: 0.05,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 82%',
                    end: 'bottom 42%',
                    scrub: 0.6
                }
            });
        });
    }

    /* ---------- Works ---------- */
    async function initWorks() {
        const track = $('#works-track');
        if (!track) return;

        // モバイルは横スワイプなのでヒント文言を差し替え
        const hint = $('.works__hint');
        if (hint && window.matchMedia('(max-width: 768px)').matches) {
            hint.textContent = 'SWIPE →';
        }

        try {
            const lang = document.documentElement.lang === 'en' ? '_en' : '';
            const res = await fetch(`works${lang}.json?t=${Date.now()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const works = await res.json();

            const endCard = $('.works__end', track);
            works.forEach((work, idx) => {
                const card = document.createElement('article');
                card.className = 'work-card';
                const meta = [work.client, work.production_period, work.notes].filter(Boolean).join(' / ');
                card.innerHTML = `
                    <a href="${work.url}" target="_blank" rel="noopener noreferrer" data-cursor="VIEW ↗">
                        <div class="work-card__media">
                            <img src="${work.image}" alt="${(work.title || '').replace(/"/g, '&quot;')}"
                                 loading="${idx < 2 ? 'eager' : 'lazy'}" decoding="async"
                                 onerror="this.style.display='none'">
                        </div>
                        <div class="work-card__meta">
                            <span class="work-card__idx">${String(idx + 1).padStart(2, '0')}</span>
                            <div>
                                <h3 class="work-card__title">${work.title || ''}</h3>
                                ${meta ? `<p class="work-card__client">${meta}</p>` : ''}
                            </div>
                        </div>
                    </a>`;
                track.insertBefore(card, endCard);
            });
        } catch (err) {
            console.error('Could not load works data:', err);
        }

        /* Desktop: pinned horizontal scroll driven by vertical scroll */
        const mm = gsap.matchMedia();
        mm.add('(min-width: 769px)', () => {
            if (prefersReduced) {
                track.style.overflowX = 'auto';
                return;
            }
            const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
            const progressBar = $('#works-progress');

            const tween = gsap.to(track, {
                x: () => -distance(),
                ease: 'none',
                scrollTrigger: {
                    trigger: '#works',
                    start: 'top top',
                    end: () => '+=' + distance(),
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        if (progressBar) progressBar.style.transform = `scaleX(${self.progress})`;
                    }
                }
            });

            // カード内の画像を横方向にパララックス
            $$('.work-card__media img', track).forEach((img) => {
                gsap.fromTo(img, { xPercent: -5 }, {
                    xPercent: 5,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: img.closest('.work-card'),
                        containerAnimation: tween,
                        start: 'left right',
                        end: 'right left',
                        scrub: true
                    }
                });
            });

            return () => { gsap.set(track, { clearProps: 'x' }); };
        });

        ScrollTrigger.refresh();
    }

    /* ---------- Service rows reveal ---------- */
    function initService() {
        if (prefersReduced) return;
        const rows = $$('.svc__row');
        if (rows.length) {
            gsap.from(rows, {
                y: 48,
                autoAlpha: 0,
                duration: 0.9,
                ease: 'power3.out',
                stagger: 0.1,
                scrollTrigger: { trigger: '.svc__list', start: 'top 78%', once: true }
            });
        }
        const subs = $$('.svc-sub__grid li');
        if (subs.length) {
            gsap.from(subs, {
                y: 36,
                autoAlpha: 0,
                duration: 0.8,
                ease: 'power3.out',
                stagger: 0.07,
                scrollTrigger: { trigger: '.svc-sub', start: 'top 82%', once: true }
            });
        }
    }

    /* ---------- Reason reveal ---------- */
    function initReason() {
        if (prefersReduced) return;
        $$('.reason__item').forEach((item) => {
            gsap.from(item, {
                y: 60,
                autoAlpha: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: { trigger: item, start: 'top 80%', once: true }
            });
            const num = $('.reason__num', item);
            if (num) {
                gsap.fromTo(num, { y: 40 }, {
                    y: -40,
                    ease: 'none',
                    scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: 1 }
                });
            }
        });
    }

    /* ---------- News ---------- */
    async function initNews() {
        const list = $('#news-list');
        if (!list) return;
        try {
            const lang = document.documentElement.lang === 'en' ? '_en' : '';
            const res = await fetch(`news${lang}.json?t=${Date.now()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const items = await res.json();

            // 新しい順に表示
            items.sort((a, b) => (a.date < b.date ? 1 : -1));

            items.forEach((item) => {
                const li = document.createElement('li');
                li.className = 'news__item';
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.innerHTML = `
                    <span class="news__date">${item.date}</span>
                    <span class="news__cat">${item.category || 'INFO'}</span>
                    <span class="news__ttl">${item.title}</span>
                    <span class="news__arw" aria-hidden="true">→</span>`;
                btn.addEventListener('click', () => openModal(item));
                li.appendChild(btn);
                list.appendChild(li);
            });

            if (!prefersReduced) {
                gsap.from($$('.news__item'), {
                    y: 28,
                    autoAlpha: 0,
                    duration: 0.7,
                    ease: 'power3.out',
                    stagger: 0.07,
                    scrollTrigger: { trigger: '#news', start: 'top 75%', once: true }
                });
            }
        } catch (err) {
            console.error('Could not load news data:', err);
        }
    }

    /* ---------- News modal ---------- */
    const modal = $('#news-modal');
    let modalOpener = null;

    function openModal(item) {
        if (!modal) return;
        modalOpener = document.activeElement;
        $('#modal-date').textContent = item.date;
        $('#modal-title').textContent = item.title;
        $('#modal-body').innerHTML = item.content || '';
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        stopScroll();
        const close = $('.modal__close', modal);
        if (close) close.focus();
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        startScroll();
        if (modalOpener && typeof modalOpener.focus === 'function') {
            modalOpener.focus();
            modalOpener = null;
        }
    }

    function initModal() {
        if (!modal) return;
        $$('[data-modal-close]', modal).forEach((el) => el.addEventListener('click', closeModal));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
        });
    }

    /* ---------- Misc ---------- */
    function initMisc() {
        const year = $('#copy-year');
        if (year) year.textContent = String(new Date().getFullYear());

        // スクロールでヒントを消す
        if (!prefersReduced) {
            gsap.to('.scroll-cue', {
                autoAlpha: 0,
                scrollTrigger: { start: 80, end: 240, scrub: true }
            });
        }

        // フォント読み込み後にレイアウト再計測
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => ScrollTrigger.refresh());
        }
    }

    /* ---------- Boot ---------- */
    // 1つの機能が失敗しても他が道連れにならないように分離して起動する
    const safe = (fn) => { try { fn(); } catch (err) { console.error('[init]', err); } };

    const boot = () => {
        safe(initPreloader);
        safe(initCursor);
        safe(initMagnetic);
        safe(initScramble);
        safe(initMenu);
        safe(initAnchors);
        safe(initRoleRotator);
        safe(initMarquee);
        safe(initSectionTitles);
        safe(initScrubText);
        safe(initWorks);
        safe(initService);
        safe(initReason);
        safe(initNews);
        safe(initModal);
        safe(initMisc);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
