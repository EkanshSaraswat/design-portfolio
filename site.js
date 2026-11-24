// ============================================================
// EKANSH SARASWAT — Shared interaction system
// GSAP + ScrollTrigger (vendored under assets/vendor/)
// Static-first: everything is readable without JS.
// ============================================================

(function () {
    const docEl = document.documentElement;
    docEl.classList.add('js');

    // ── 0. Load GSAP + ScrollTrigger, then init ─────────────
    const GSAP_SRC = 'assets/vendor/gsap.min.js';
    const ST_SRC = 'assets/vendor/ScrollTrigger.min.js';

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    let gsapReady = false;

    function init() {
        setupCursor();
        setupHeaderLegibility();
        setupPageWipe();
        setupReveals(); // GSAP-dependent
        setupMobileMenu();
        setupProgressRail();
        setupTopBtn();
        setupPageTransitions();
        setupNextPage();
        setupRipple();
        setupBooks();
        setupProjectLibrary();
        setupAboutMountain();
        setupHomeHero();
        setupWorkParticles();
        setupWorkReveals();
        setupAsciiSection();
        setupMountain(); // GSAP-dependent
        setupToolkitTabs();
        setupContactForm();
        setupContactModal();
        setupProjectModal();
        setupOptionalImages();
        setupCopyEmail();
        setupFaq();
    }

    function initStatic() {
        // Non-GSAP fallback only. Reveals stay visible (static-first) without motion.
        setupCursor();
        setupHeaderLegibility();
        setupPageWipe();
        setupMobileMenu();
        setupProgressRail();
        setupTopBtn();
        setupPageTransitions();
        setupNextPage();
        setupRipple();
        setupBooks();
        setupProjectLibrary();
        setupAboutMountain();
        setupHomeHero();
        setupWorkParticles();
        setupWorkReveals();
        setupAsciiSection();
        setupMountain(); // parallax loop skipped; layers stay in final state
        setupToolkitTabs();
        setupContactForm();
        setupContactModal();
        setupProjectModal();
        setupOptionalImages();
        setupCopyEmail();
        setupFaq();
    }

    Promise.all([loadScript(GSAP_SRC), loadScript(ST_SRC)]).then(() => {
        gsapReady = true;
        init();
    }).catch(() => {
        initStatic();
    });

    // ── 1. Magnetic cursor ──────────────────────────────────
    function setupCursor() {
        const dot = document.querySelector('.cursor-dot');
        const ring = document.querySelector('.cursor-ring');
        const label = document.querySelector('.cursor-label');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const fine = window.matchMedia('(pointer: fine)').matches;
        const narrow = window.matchMedia('(max-width: 760px)').matches;

        if (reduced || !fine || narrow || !dot || !ring || !label) return;

        let mouse = { x: innerWidth / 2, y: innerHeight / 2 };
        let ringPos = { ...mouse };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            dot.style.left = mouse.x + 'px';
            dot.style.top = mouse.y + 'px';
            dot.style.opacity = '1';
        });

        gsap.ticker.add(() => {
            ringPos.x += (mouse.x - ringPos.x) * 0.14;
            ringPos.y += (mouse.y - ringPos.y) * 0.14;
            ring.style.left = ringPos.x + 'px';
            ring.style.top = ringPos.y + 'px';
            label.style.left = (ringPos.x + 20) + 'px';
            label.style.top = (ringPos.y + 18) + 'px';
            ring.style.opacity = '1';
            label.style.opacity = '1';
        });

        document.querySelectorAll('[data-cursor]').forEach((el) => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-active');
                label.textContent = el.dataset.cursor || 'OPEN';
            });
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
        });

        const magnets = document.querySelectorAll('.magnetic');
        window.addEventListener('mousemove', (e) => {
            magnets.forEach((el) => {
                const r = el.getBoundingClientRect();
                const x = e.clientX - (r.left + r.width / 2);
                const y = e.clientY - (r.top + r.height / 2);
                const distance = Math.hypot(x, y);
                el.style.setProperty('--mx', distance < 120 ? x * 0.12 + 'px' : '0px');
                el.style.setProperty('--my', distance < 120 ? y * 0.12 + 'px' : '0px');
            });
        });
    }

    // ── 2. Header legibility — flip to black over white sections ─
    function setupHeaderLegibility() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        let ticking = false;
        const page = document.body.dataset.page;
        const isHome = page === 'home' || /\/(index(\.html)?)?$/.test(location.pathname);
        const isAbout = page === 'about';

        // The homepage stays dark from top to bottom, so its header is always
        // light. The About page is dark first, then switches to ivory sections
        // (and back to a black footer) — the header follows whatever is
        // actually underneath it.
        // `offset` / `endOffset` keep the flip clear of the soft gradient
        // edges, so the header never turns black while the area behind it
        // is still dark.
        const lightZones = isHome
            ? [{ selector: '.work-section', offset: 0, endOffset: 0 }]
            : isAbout
                ? [
                    { selector: '.about-hero', offset: 0 },
                    { selector: '.video-band-pin', offset: 0 },
                    { selector: '.about-intro', offset: 0 },
                    { selector: '.about-curiosity', offset: 0 },
                    { selector: '.about-journey', offset: 0 },
                    { selector: '.about-moment', offset: 0 },
                    { selector: '.about-closing', offset: 0 }
                ]
                : '.journal-page, .skills-subpage, .final-page'.split(', ').map((selector) => ({ selector, offset: 0 }));
        const HEADER_PROBE_Y = 32;

        function updateHeaderTheme() {
            ticking = false;

            const onLight = lightZones.some(({ selector, offset = 0, endOffset = 0 }) => {
                const el = document.querySelector(selector);
                if (!el) return false;
                const r = el.getBoundingClientRect();
                return r.top + offset <= HEADER_PROBE_Y &&
                    r.bottom - endOffset > HEADER_PROBE_Y;
            });

            header.classList.toggle('header-on-text', onLight);
        }

        function requestHeaderUpdate() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(updateHeaderTheme);
        }

        window.addEventListener('scroll', requestHeaderUpdate, { passive: true });
        window.addEventListener('resize', requestHeaderUpdate);
        window.addEventListener('load', requestHeaderUpdate);
        updateHeaderTheme();
    }

    // ── 3. Page wipe intro + scramble (home page only) ──────
    function setupPageWipe() {
        const wipe = document.querySelector('.page-wipe');
        const isHome = document.body.dataset.page === 'home' || /\/(index(\.html)?)?$/.test(location.pathname);
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (isHome) {
            if (wipe) wipe.classList.add('hide');
            return;
        }
        if (!wipe) {
            if (startScramble) startScramble();
            return;
        }

        if (reduced) {
            wipe.classList.add('hide');
            startScramble();
            return;
        }

        const splash = document.createElement('div');
        splash.className = 'intro-logo';
        splash.setAttribute('aria-hidden', 'true');
        splash.innerHTML = 'EKANSH<span>.</span>';
        wipe.appendChild(splash);

        const brand = document.querySelector('.brand');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => splash.classList.add('intro-logo--visible'));
        });

        const FLY_DELAY = 850;
        const WIPE_DUR = 680;

        setTimeout(() => {
            if (brand) {
                const brandRect = brand.getBoundingClientRect();
                const splashRect = splash.getBoundingClientRect();
                const dx = (brandRect.left + brandRect.width / 2) - (splashRect.left + splashRect.width / 2);
                const dy = (brandRect.top + brandRect.height / 2) - (splashRect.top + splashRect.height / 2);
                const splashFS = parseFloat(getComputedStyle(splash).fontSize) || 80;
                const brandFS = parseFloat(getComputedStyle(brand).fontSize) || 13;
                splash.style.setProperty('--fly-x', dx + 'px');
                splash.style.setProperty('--fly-y', dy + 'px');
                splash.style.setProperty('--fly-scale', brandFS / splashFS);
                splash.classList.add('intro-logo--fly');
            }
            wipe.classList.add('intro-wipe-out');
            setTimeout(() => {
                wipe.remove();
                startScramble();
            }, WIPE_DUR + 50);
        }, FLY_DELAY);
    }

    function startScramble() {
        const words = Array.from(document.querySelectorAll('[data-scramble]'));
        if (!words.length) return;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*@/\\<>[]{}=+';

        words.forEach((word, wordIndex) => {
            const target = word.dataset.scramble || word.textContent;
            word.textContent = '';
            const chars = Array.from(target, (character, i) => {
                const span = document.createElement('span');
                span.className = 'scramble-char';
                span.textContent = ' ';
                word.appendChild(span);
                return { character, span, revealAt: 7 + i * 2 + wordIndex * 14 };
            });
            word.setAttribute('aria-hidden', 'true');

            if (reduced || !document.hasFocus()) {
                chars.forEach(({ character, span }) => { span.textContent = character; });
                return;
            }

            let frame = 0;
            (function tick() {
                if (!document.hasFocus()) {
                    chars.forEach(({ character, span }) => { span.textContent = character; });
                    return;
                }
                frame++;
                let finished = true;
                chars.forEach(({ character, span, revealAt }) => {
                    if (frame >= revealAt) span.textContent = character;
                    else {
                        span.textContent = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
                        finished = false;
                    }
                });
                if (!finished) requestAnimationFrame(tick);
            })();
        });
    }

    // ── 4. Scroll reveals ───────────────────────────────────
    function setupReveals() {
        gsap.registerPlugin(ScrollTrigger);
        gsap.utils.toArray('.reveal').forEach((el) => {
            gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
            });
        });
    }

    // ── 5. Mobile menu ──────────────────────────────────────
    function setupMobileMenu() {
        const btn = document.querySelector('.menu-toggle');
        const menu = document.querySelector('.mobile-menu');
        if (!menu || !btn) return;

        function setMenu(open) {
            menu.classList.toggle('open', open);
            menu.setAttribute('aria-hidden', String(!open));
            menu.inert = !open;
            btn.setAttribute('aria-expanded', String(open));
            btn.textContent = open ? 'CLOSE' : 'MENU';
        }
        setMenu(false);
        btn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
        document.querySelectorAll('.mobile-link').forEach((l) => l.addEventListener('click', () => setMenu(false)));
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape' || !menu.classList.contains('open')) return;
            setMenu(false);
            btn.focus();
        });
    }

    // ── 6. Progress rail ────────────────────────────────────
    function setupProgressRail() {
        const progress = document.querySelector('.progress-line span');
        const mark = document.querySelector('.progress-mark');
        if (!progress) return;
        function update() {
            const max = document.documentElement.scrollHeight - innerHeight;
            const pct = max > 0 ? scrollY / max : 0;
            progress.style.height = (pct * 100) + '%';
            if (mark) mark.textContent = String(Math.min(99, Math.floor(pct * 100))).padStart(2, '0');
        }
        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    // ── 7. Back to top ──────────────────────────────────────
    function setupTopBtn() {
        const btn = document.getElementById('topBtn');
        if (!btn) return;
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // ── 8. Soft page transitions for local .html links ──────
    function transitionTo(href) {
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http') || href.startsWith('//')) return;
        const wipe = document.querySelector('.page-wipe');
        if (!wipe) { location.href = href; return; }
        wipe.classList.remove('hide');
        setTimeout(() => { location.href = href; }, 520);
    }

    function setupPageTransitions() {
        document.addEventListener('click', (e) => {
            const a = e.target.closest('a');
            if (a) {
                const href = a.getAttribute('href');
                if (href && href.endsWith('.html') && !href.startsWith('http') && !href.startsWith('//')) {
                    e.preventDefault();
                    transitionTo(href);
                }
            }
        });
    }

    // ── 9. Next page sentinel ───────────────────────────────
    function setupNextPage() {
        const PAGE_FLOW = {
            'index.html': { href: 'about.html', label: 'NEXT / ABOUT' },
            'about.html': { href: 'skills.html', label: 'NEXT / SKILLS' },
            'skills.html': { href: 'index.html', label: 'BACK TO TOP / HOME' }
        };

        const sentinel = document.querySelector('.page-end-sentinel');
        const note = document.querySelector('.next-note');
        if (!sentinel || !note) return;

        const file = location.pathname.split('/').pop() || '';
        const name = file.replace(/\.html$/i, '') || 'index';
        const current = name + '.html';
        const next = PAGE_FLOW[current] || PAGE_FLOW['index.html'];
        note.textContent = next.label;

        let atEnd = false;
        const narrow = window.matchMedia('(max-width: 760px)').matches;
        let mouseX = innerWidth / 2, mouseY = innerHeight / 2;

        function updateNotePosition(clientX, clientY) {
            if (narrow) return;
            const offsetX = 22, offsetY = 18;
            let x = clientX + offsetX, y = clientY + offsetY;
            const rect = note.getBoundingClientRect();
            const w = rect.width || 160, h = rect.height || 42;
            if (x + w > window.innerWidth - 14) x = Math.max(14, clientX - w - 14);
            if (y + h > window.innerHeight - 14) y = Math.max(14, clientY - h - 14);
            note.style.left = x + 'px';
            note.style.top = y + 'px';
        }

        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                atEnd = e.isIntersecting;
                document.body.classList.toggle('next-ready', atEnd);
                if (atEnd) updateNotePosition(mouseX, mouseY);
            });
        }, { threshold: 0, rootMargin: '0px 0px 150px 0px' });
        io.observe(sentinel);

        window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; if (atEnd) updateNotePosition(e.clientX, e.clientY); });

        function isInteractive(el) {
            return !!el.closest('a, button, summary, input, textarea, dialog, .faq-item, .polaroid, .top-btn');
        }

        function tryAdvance(e) {
            if (!atEnd) return;
            if (isInteractive(e.target)) return;
            const href = next.href;
            if (href) { e.preventDefault(); transitionTo(href); }
        }
        document.addEventListener('click', tryAdvance);
    }

    // ── 10. Click ripple ────────────────────────────────────
    function setupRipple() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        document.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            ripple.className = 'click-ripple';
            ripple.style.left = e.clientX + 'px';
            ripple.style.top = e.clientY + 'px';
            document.body.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
        });
    }

    // ── 11. Interactive books / dialogs ─────────────────────
    function setupBooks() {
        const triggers = Array.from(document.querySelectorAll('[data-book]'));
        if (!triggers.length) return;

        let lastTrigger = null;

        function openBook(dialog, trigger) {
            if (!dialog) return;
            lastTrigger = trigger || null;
            if (typeof dialog.showModal === 'function') dialog.showModal();
            else dialog.setAttribute('open', '');
            if (gsapReady) {
                gsap.fromTo(dialog.querySelector('.case-inner'), { opacity: 0, y: 20, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' });
            }
            const closeButton = dialog.querySelector('[data-close]');
            (closeButton || dialog).focus();
        }

        function closeBook(dialog) {
            const trigger = lastTrigger;
            if (typeof dialog.close === 'function') dialog.close();
            else dialog.removeAttribute('open');
            trigger?.focus();
        }

        triggers.forEach((trigger) => {
            trigger.addEventListener('click', () => openBook(document.getElementById('book-' + trigger.dataset.book), trigger));
        });

        document.querySelectorAll('dialog.case').forEach((dialog) => {
            dialog.querySelector('[data-close]')?.addEventListener('click', () => closeBook(dialog));
            dialog.addEventListener('click', (event) => { if (event.target === dialog) closeBook(dialog); });
            dialog.addEventListener('close', () => lastTrigger?.focus());
        });

        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            const openDialog = document.querySelector('dialog.book-dialog[open]');
            if (openDialog) closeBook(openDialog);
        });

        document.querySelectorAll('.book').forEach((book, index, books) => {
            book.addEventListener('keydown', (event) => {
                const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
                if (!step) return;
                event.preventDefault();
                books[(index + step + books.length) % books.length].focus();
            });
        });

        if (location.hash.startsWith('#book-')) {
            setTimeout(() => {
                const d = document.getElementById(location.hash.slice(1));
                if (d) openBook(d);
            }, 120);
        }
    }

    // ── 13b. Project library — physical books + open case studies ──
    function setupProjectLibrary() {
        const shelf = document.getElementById('bookShelf');
        if (!shelf) return;

        const G = typeof gsap !== 'undefined' ? gsap : null;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const books = Array.from(shelf.querySelectorAll('.book'));
        const order = ['sampada', 'escrow', 'blocklance'];
        let openDialogId = null;

        // ── Lift a book from the surface ──────────────────────
        function lift(book, up) {
            const obj = book.querySelector('.book-object');
            if (!obj) return;
            if (reduced) {
                if (G) G.set(obj, { clearProps: 'transform,box-shadow' });
                book.classList.remove('is-open');
                return;
            }
            if (up) {
                book.classList.add('is-open');
                const rect = book.getBoundingClientRect();
                const isLeft = (rect.left + rect.width / 2) < window.innerWidth / 2;
                if (G) {
                    G.to(obj, {
                        duration: 0.5, ease: 'power3.out',
                        y: -14, rotateX: 5, rotateY: isLeft ? -5 : 6,
                        boxShadow: '30px 36px 52px rgba(17,17,17,0.30), 10px 12px 0 rgba(17,17,17,0.14)',
                        zIndex: 6
                    });
                }
            } else {
                book.classList.remove('is-open');
                if (G) {
                    G.to(obj, {
                        duration: 0.5, ease: 'power3.out',
                        y: 0, rotateX: 0, rotateY: 0,
                        boxShadow: '18px 22px 34px rgba(17,17,17,0.22), 6px 8px 0 rgba(17,17,17,0.12)',
                        zIndex: ''
                    });
                }
            }
        }

        // ── Open a case-study book ────────────────────────────
        function openCase(id) {
            if (openDialogId && openDialogId !== id) closeCase(openDialogId, false);
            const d = document.getElementById('case-' + id);
            if (!d) return;
            openDialogId = null;
            d.style.opacity = '0';
            if (typeof d.showModal === 'function') d.showModal();
            else d.setAttribute('open', '');
            if (G) {
                G.set(d, { opacity: 0 });
                const wrap = d.querySelector('.book-open-wrap');
                G.set(wrap, { opacity: 0, y: 16 });
                G.to(d, { opacity: 1, duration: 0.3 });
                G.to(wrap, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
                const leaf = d.querySelector('.spread.current .leaf');
                if (leaf) G.fromTo(leaf, { rotateY: -20 }, { rotateY: 0, duration: 0.7, ease: 'power3.out' });
            } else {
                d.style.opacity = '1';
            }
            d.querySelector('[data-close]')?.focus();
            document.body.style.overflow = 'hidden';
            updateNav(d);
        }

        // ── Close a case-study book ───────────────────────────
        function closeCase(id, focusBack) {
            const d = document.getElementById('case-' + id);
            if (!d) return;
            openDialogId = null;
            if (G && typeof d.close === 'function') {
                G.to(d.querySelector('.book-open-wrap'), {
                    opacity: 0, y: 14, duration: 0.25, ease: 'power2.in',
                    onComplete: () => d.close()
                });
                G.to(d, { opacity: 0, duration: 0.25 });
            } else if (typeof d.close === 'function') {
                d.close();
            } else {
                d.removeAttribute('open');
            }
            books.forEach((b) => lift(b, false));
            document.body.style.overflow = '';
        }

        // ── Show a specific spread inside the open book ───────
        function setCurrentSpread(d, index) {
            const spreads = Array.from(d.querySelectorAll('.spread'));
            spreads.forEach((s, i) => {
                const cur = i === index;
                s.classList.toggle('current', cur);
                s.style.zIndex = cur ? '3' : '1';
                s.style.opacity = cur ? '1' : '0';
                s.style.pointerEvents = cur ? 'auto' : 'none';
            });
            updateNav(d);
        }

        // ── Turn a page (physical leaf rotation) ──────────────
        function turnSpread(d, dir) {
            const spreads = Array.from(d.querySelectorAll('.spread'));
            const cur = spreads.findIndex((s) => s.classList.contains('current'));
            const nxt = (cur + dir + spreads.length) % spreads.length;
            if (nxt === cur) return;

            const curEl = spreads[cur];
            const nxtEl = spreads[nxt];
            const leaf = curEl.querySelector('.leaf');

            nxtEl.style.zIndex = '2';
            nxtEl.style.opacity = '1';
            nxtEl.style.pointerEvents = 'auto';

            if (G && leaf && !reduced) {
                G.killTweensOf(leaf);
                const target = dir > 0 ? -108 : 108;
                G.to(leaf, {
                    rotateY: target,
                    duration: 0.5,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        curEl.classList.remove('current');
                        curEl.style.zIndex = '1';
                        curEl.style.opacity = '0';
                        curEl.style.pointerEvents = 'none';
                        nxtEl.classList.add('current');
                        nxtEl.style.zIndex = '3';
                        G.set(leaf, { rotateY: 0 });
                        updateNav(d);
                    }
                });
            } else {
                curEl.classList.remove('current');
                curEl.style.zIndex = '1';
                curEl.style.opacity = '0';
                curEl.style.pointerEvents = 'none';
                nxtEl.classList.add('current');
                nxtEl.style.zIndex = '3';
                nxtEl.style.opacity = '1';
                updateNav(d);
            }
        }

        // ── Jump to the next / previous project case study ────
        function jumpProject(dir) {
            const id = openDialogId;
            if (!id) return;
            const idx = order.indexOf(id);
            const nxt = order[(idx + dir + order.length) % order.length];
            closeCase(id, false);
            setTimeout(() => openCase(nxt), 150);
        }

        // ── Update nav indicators / disabled states ───────────
        function updateNav(d) {
            const spreads = Array.from(d.querySelectorAll('.spread'));
            const cur = spreads.findIndex((s) => s.classList.contains('current'));
            const num = d.querySelector('.nav-current');
            if (num) num.textContent = String(cur + 1).padStart(2, '0');
            const prevBtn = d.querySelector('[data-action="prev-spread"]');
            const nextBtn = d.querySelector('[data-action="next-spread"]');
            if (prevBtn) prevBtn.disabled = cur <= 0;
            if (nextBtn) nextBtn.disabled = cur >= spreads.length - 1;
        }

        // ── Book clicks open the case study ───────────────────
        books.forEach((book) => {
            book.addEventListener('click', () => {
                lift(book, true);
                setTimeout(() => openCase(book.dataset.libBook), 260);
            });
        });

        // ── Dialog controls ───────────────────────────────────
        document.querySelectorAll('dialog.case-book').forEach((d) => {
            const id = d.id.replace('case-', '');
            d.querySelector('[data-close]')?.addEventListener('click', () => closeCase(id));
            d.addEventListener('click', (event) => {
                if (event.target === d) {
                    event.stopPropagation();
                    closeCase(id);
                }
            });
            d.querySelectorAll('[data-action="prev-spread"]').forEach((b) =>
                b.addEventListener('click', () => turnSpread(d, -1))
            );
            d.querySelectorAll('[data-action="next-spread"]').forEach((b) =>
                b.addEventListener('click', () => turnSpread(d, 1))
            );
            d.querySelectorAll('[data-action="library"]').forEach((b) =>
                b.addEventListener('click', () => closeCase(id))
            );
            d.querySelectorAll('[data-jump]').forEach((b) =>
                b.addEventListener('click', (event) => {
                    event.preventDefault();
                    jumpProject(b.dataset.jump === 'next' ? 1 : -1);
                })
            );
        });

        // ── Escape closes the open book ───────────────────────
        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            const openD = document.querySelector('dialog.case-book[open]');
            if (openD) {
                event.preventDefault();
                closeCase(openD.id.replace('case-', ''));
            }
        });
    }

    // ── 14. About page — cinematic mountain reveal ──────────────
    function setupAboutMountain() {
        const stage = document.getElementById('landscapeStage');
        const layers = {
            closest: document.getElementById('layerClosest'),
            dominant: document.getElementById('layerDominant'),
            distant: document.getElementById('layerDistant'),
            mistFar: document.getElementById('mistFar'),
            mistNear: document.getElementById('mistNear')
        };
        if (!stage) return;
        const G = typeof gsap !== 'undefined' ? gsap : null;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const content = [layers.closest, layers.dominant, layers.distant].filter(Boolean);
        const mists = [layers.mistFar, layers.mistNear].filter(Boolean);

        // Initial hidden state
        content.forEach((el) => {
            if (G) G.set(el, { y: 130, opacity: 0 });
            else { el.style.transform = 'translateY(130px)'; el.style.opacity = '0'; }
        });
        mists.forEach((el) => {
            if (G) G.set(el, { opacity: 0 });
            else el.style.opacity = '0';
        });

        if (reduced || !G) {
            content.forEach((el) => { el.style.transform = 'none'; el.style.opacity = '0.95'; });
            mists.forEach((el) => { el.style.opacity = '0.4'; });
            return;
        }

        // Exact reveal sequence: closest FIRST → dominant SECOND → distant THIRD → mist LAST
        const tl = gsap.timeline({ paused: true });
        tl.to(layers.closest, { duration: 1.5, y: 0, opacity: 0.95, ease: 'power3.out' }, 0)
            .to(layers.dominant, { duration: 1.7, y: 0, opacity: 0.9, ease: 'power3.out' }, 0.4)
            .to(layers.distant, { duration: 1.7, y: 0, opacity: 0.75, ease: 'power3.out' }, 0.8)
            .to(layers.mistFar, { duration: 1.3, opacity: 0.5, ease: 'power3.out' }, 1.2)
            .to(layers.mistNear, { duration: 1.3, opacity: 0.55, ease: 'power3.out' }, 1.5);

        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting && tl.progress() < 1 && !tl.isActive()) tl.play();
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -12% 0px' });
        io.observe(stage);

        // Subtle scroll parallax (percentage-based, combines with reveal translate)
        let ticking = false;
        function parallax() {
            ticking = false;
            const rect = stage.getBoundingClientRect();
            if (rect.bottom < 20 || rect.top > window.innerHeight) return;
            const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
            const moves = [
                { el: layers.closest, amount: 18 },
                { el: layers.dominant, amount: 11 },
                { el: layers.distant, amount: 6 },
                { el: layers.mistNear, amount: 9 },
                { el: layers.mistFar, amount: 5 }
            ];
            moves.forEach(({ el, amount }) => {
                if (!el) return;
                gsap.set(el, { yPercent: (0.5 - progress) * amount });
            });
        }
        window.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
        }, { passive: true });
    }

    // ── 15. About page — scroll-scrubbed video ────────────────
    function setupAsciiSection() {
        const video = document.getElementById('asciiVideo');
        const pin = document.getElementById('videoBandPin');
        const band = document.getElementById('asciiSection');
        if (!video) return;

        const G = typeof gsap !== 'undefined' ? gsap : null;
        const hasST = typeof ScrollTrigger !== 'undefined';
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let videoReady = false;
        let targetTime = 0;
        let currentTime = 0;
        let rafScrub = null;

        function smoothScrub() {
            if (!videoReady) { rafScrub = null; return; }
            const diff = targetTime - currentTime;
            if (Math.abs(diff) > 0.015) {
                currentTime += diff * 0.22;
                try { video.currentTime = currentTime; } catch {}
                rafScrub = requestAnimationFrame(smoothScrub);
            } else {
                rafScrub = null;
            }
        }

        video.addEventListener('loadedmetadata', () => {
            videoReady = true;
            if (reduced) {
                video.loop = true;
                video.muted = true;
                video.play().catch(() => {});
                return;
            }
            video.pause();
            video.currentTime = 0;

            if (G && hasST && pin && band) {
                G.registerPlugin(ScrollTrigger);
                ScrollTrigger.create({
                    trigger: pin,
                    start: 'top top',
                    end: '+=130%',
                    pin: band,
                    scrub: true,
                    anticipatePin: 1,
                    onUpdate: (self) => {
                        if (!video.duration) return;
                        targetTime = self.progress * Math.max(0, video.duration - 0.05);
                        if (!rafScrub) rafScrub = requestAnimationFrame(smoothScrub);
                    }
                });
            }
        });
    }

    // ── 12. Mountain emergence + parallax ───────────────────
    function setupMountain() {
        const stage = document.querySelector('[data-parallax]');
        if (!stage) return;
        const layers = Array.from(stage.querySelectorAll('[data-depth]'));
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Initial low position for entry animation (when GSAP available)
        if (gsapReady) {
            layers.forEach((layer) => {
                const depth = Number(layer.dataset.depth) || 0;
                gsap.set(layer, { y: (0.5 - depth) * 140 });
            });
            gsap.to(layers, {
                y: 0,
                duration: 1.4,
                stagger: 0.18,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: stage,
                    start: 'top 85%',
                    once: true
                }
            });
        }

        if (reduced) return;

        let queued = false;
        function updateParallax() {
            queued = false;
            const rect = stage.getBoundingClientRect();
            const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
            layers.forEach((layer) => {
                const depth = Number(layer.dataset.depth) || 0;
                if (gsapReady) {
                    gsap.set(layer, { y: (progress - 0.5) * depth * 120 });
                } else {
                    layer.style.setProperty('--py', ((progress - 0.5) * depth * 120) + 'px');
                }
            });
        }
        window.addEventListener('scroll', () => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(updateParallax);
        }, { passive: true });
        updateParallax();
    }

    // ── 13. Creative Toolkit tabs ───────────────────────────
    function setupToolkitTabs() {
        const tabs = Array.from(document.querySelectorAll('[href^="#panel-"]'));
        if (!tabs.length) return;

        // Reveal animations are registered while hidden panels have no layout,
        // so explicitly show the contents of whichever panel becomes active.
        function revealPanel(panel) {
            if (!panel) return;
            panel.querySelectorAll('.reveal').forEach((el) => {
                el.classList.add('in-view');
                if (typeof gsap !== 'undefined') gsap.set(el, { opacity: 1, y: 0 });
            });
        }

        function select(target, focus = true) {
            tabs.forEach((item) => {
                const active = item === target;
                const panelId = item.getAttribute('href').slice(1);
                const panel = panelId ? document.getElementById(panelId) : null;
                if (panel) {
                    panel.hidden = !active;
                    if (active) revealPanel(panel);
                }
                item.classList.toggle('is-active', active);
                item.setAttribute('aria-selected', String(active));
                item.tabIndex = active ? 0 : -1;
            });
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
            if (focus) target.focus();
        }

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', (e) => { e.preventDefault(); select(tab); });
            tab.addEventListener('keydown', (e) => {
                let step = 0;
                if (e.key === 'ArrowRight') step = 1;
                else if (e.key === 'ArrowLeft') step = -1;
                else if (e.key === 'Home') step = -index;
                else if (e.key === 'End') step = tabs.length - 1 - index;
                else return;
                e.preventDefault();
                select(tabs[(index + step + tabs.length) % tabs.length]);
            });
        });

        select(tabs[0], false);
    }

    // ── 14. Contact form ────────────────────────────────────
    function setupContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;
        const submitButton = document.getElementById('submitContact');
        const formStatus = document.getElementById('formStatus');
        if (!submitButton || !formStatus) return;

        const isLocal = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(location.hostname);
        const endpoints = isLocal && location.port !== '5000'
            ? ['http://localhost:5000/api/contact', '/api/contact']
            : ['/api/contact'];

        async function postContact(payload) {
            let lastError = null;
            for (const endpoint of endpoints) {
                let response;
                try {
                    response = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                } catch {
                    lastError = Object.assign(new Error('The contact service is unreachable.'), { code: 'NETWORK' });
                    continue;
                }
                if (response.status === 404 || response.status === 405) {
                    lastError = Object.assign(new Error('The contact endpoint was not found.'), { code: 'NOT_FOUND' });
                    continue;
                }
                let result = null;
                try { result = await response.json(); } catch { }
                if (!response.ok) throw new Error(result?.message || `Request failed (${response.status}).`);
                return result;
            }
            throw lastError || new Error('Unable to send message. Please try again.');
        }

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();

            if (!name || !email || !message) {
                formStatus.textContent = 'Please fill in all fields.';
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
                formStatus.textContent = 'Please enter a valid email address.';
                return;
            }

            submitButton.disabled = true;
            submitButton.innerHTML = 'SENDING...';
            formStatus.textContent = '';

            try {
                await postContact({ name, email, message });
                formStatus.textContent = 'Message sent successfully!';
                form.reset();
            } catch (error) {
                console.warn('Contact form error:', error);
                if (error.code === 'NETWORK' || error.code === 'NOT_FOUND') {
                    formStatus.textContent = isLocal
                        ? 'The contact service is offline. Run "npm start" and try again.'
                        : 'The contact service is unavailable. Please email me directly.';
                } else {
                    formStatus.textContent = error.message || 'Unable to send message. Please try again.';
                }
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = 'SEND MESSAGE <span>↗</span>';
            }
        });
    }

    // ── 14b. Accessible Contact Modal ───────────────────────
    function setupContactModal() {
        const modal = document.getElementById('contactModal');
        const triggers = document.querySelectorAll('[data-open-contact]');
        if (!modal || !triggers.length) return;

        let lastTrigger = null;

        // Move cursor elements into the dialog so they render in the top layer
        const cursorEls = [...document.querySelectorAll('.cursor-dot, .cursor-ring, .cursor-label, .click-ripple')];

        function openModal(trigger) {
            lastTrigger = trigger || null;
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                mobileMenu.classList.remove('open');
                mobileMenu.setAttribute('aria-hidden', 'true');
                mobileMenu.inert = true;
            }
            if (typeof modal.showModal === 'function') modal.showModal();
            else modal.setAttribute('open', '');
            // Reparent cursors into dialog so they appear above the top-layer backdrop
            cursorEls.forEach(el => modal.appendChild(el));
            // Wire cursor-active state for elements inside the modal
            modal.querySelectorAll('[data-cursor]').forEach(el => {
                el.addEventListener('mouseenter', () => {
                    modal.classList.add('cursor-active-modal');
                    const label = modal.querySelector('.cursor-label');
                    if (label) label.textContent = el.dataset.cursor || 'OPEN';
                });
                el.addEventListener('mouseleave', () => modal.classList.remove('cursor-active-modal'));
            });
            const closeBtn = modal.querySelector('[data-close-contact]');
            (closeBtn || modal).focus();
        }

        function closeModal() {
            if (typeof modal.close === 'function') modal.close();
            else modal.removeAttribute('open');
            // Restore cursors back to body
            cursorEls.forEach(el => document.body.appendChild(el));
            lastTrigger?.focus();
        }

        triggers.forEach((btn) => {
            btn.addEventListener('click', () => openModal(btn));
        });

        modal.querySelector('[data-close-contact]')?.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        modal.addEventListener('close', () => {
            cursorEls.forEach(el => document.body.appendChild(el));
            lastTrigger?.focus();
        });
    }

    // ── 14a. Project + About artwork — hide missing files gracefully ─
    function setupOptionalImages() {
        document.querySelectorAll('.project-image, .about-photo').forEach((img) => {
            const markMissing = () => img.classList.add('is-missing');
            if (img.complete && img.naturalWidth === 0) markMissing();
            img.addEventListener('error', markMissing, { once: true });
        });
    }

    // ── 14b. Selected Projects — detail popups ──────────────
    function setupProjectModal() {
        const modal = document.getElementById('projectModal');
        const triggers = document.querySelectorAll('[data-project]');
        if (!modal || !triggers.length) return;

        const projects = {
            sampada: {
                index: '01',
                role: 'Disaster Relief Coordination Platform · Full-Stack Developer & UI/UX Designer',
                title: 'SampadaSuraksha',
                lead: 'Designed and developed an end-to-end disaster management web application enabling real-time SOS reporting and multi-agency rescue coordination during floods, cyclones, and earthquakes.',
                quote: '',
                points: [
                    'Crafted an intuitive, low-friction victim reporting UI for rapid location and emergency-need submission under high-stress conditions.',
                    'Built a centralized dashboard for NGOs and government responders featuring live request tracking, task claiming, and real-time inventory management (food, medicine, equipment) to minimize resource wastage.'
                ],
                github: 'https://github.com/EkanshSaraswat/SampadaSuraksha',
                demo: ''
            },
            escrow: {
                index: '02',
                role: 'Explainable Risk (XAI) & State Transparency · Full-Stack Developer & UI/UX Designer',
                title: 'Adaptive Escrow System',
                lead: 'Crypto and escrow interfaces often feel intimidating or opaque because users lock money away without understanding why certain rules apply. I focused on Explainable Risk (XAI) and State Transparency.',
                quote: 'Turn opaque smart contract rules into clear, predictable financial confidence.',
                points: [
                    'Transparent Risk Breakdown: instead of showing a raw number, visual risk indicators explain why a transaction was flagged Low, Medium or High risk, and how that directly determined the lock duration.',
                    'Visual Escrow Timelines: complex staged-payout smart contract logic becomes a clear visual timeline so both buyer and seller see exactly when funds unlock and what milestones protect them.',
                    'Graceful Web3 Error Handling: wallet connections, testnet transactions and smart contract revert reasons are translated into human-readable feedback.'
                ],
                github: '',
                demo: 'https://sea-escrow.vercel.app'
            },
            blocklance: {
                index: '03',
                role: 'Live Web3 + ML Reputation Systems · Full-Stack Developer & UI/UX Designer',
                title: 'BlockLance',
                lead: 'Blockchains are asynchronous: when an employer submits a review, the ML oracle takes a few seconds to detect the event, compute the new score and write it back on-chain. I made this event-driven pipeline feel instant and legible to everyday users.',
                quote: 'Hide the friction of asynchronous Web3 + ML pipelines behind live, transparent feedback.',
                points: [
                    'Structured, Anti-Bias Review Flow (/submit): instead of an arbitrary star box, the employer review form is built around concrete deliverables (Deadline Met toggle, Budget Adhered toggle, 1–10 Quality slider), so the UI naturally feeds clean features into the ML pipeline.',
                    'Live Event-Subscribed Profiles (/profile/:address): the React UI subscribes to TrustFactorUpdated and RecordAdded contract events via ethers.js, so the 0–100 Trust Gauge animates and updates live without forcing users to refresh.',
                    'Zero-Gatekeeping Discovery (/): freelancer profiles are publicly searchable by wallet address without requiring a wallet connection just to read reputation, proving true cross-platform portability.'
                ],
                github: 'https://github.com/EkanshSaraswat/BlockLance',
                demo: ''
            }
        };

        const cursorEls = [...document.querySelectorAll('.cursor-dot, .cursor-ring, .cursor-label, .click-ripple')];
        const titleEl = document.getElementById('projectModalTitle');
        const roleEl = document.getElementById('projectModalRole');
        const indexEl = document.getElementById('projectModalIndex');
        const copyEl = document.getElementById('projectModalCopy');
        const linksEl = document.getElementById('projectModalLinks');
        let lastTrigger = null;

        function openModal(trigger) {
            const project = projects[trigger.dataset.project];
            if (!project) return;
            lastTrigger = trigger;

            titleEl.textContent = project.title;
            roleEl.textContent = project.role;
            indexEl.textContent = project.index;

            const addParagraph = (text, className) => {
                if (!text) return;
                const p = document.createElement('p');
                p.textContent = text;
                if (className) p.className = className;
                copyEl.appendChild(p);
            };
            copyEl.replaceChildren();
            addParagraph(project.lead, 'project-modal-lead');
            addParagraph(project.quote, 'project-modal-quote');
            project.points.forEach((text) => addParagraph(text));

            linksEl.replaceChildren();
            const links = [
                { label: 'VIEW ON GITHUB ↗', url: project.github },
                { label: 'VIEW LIVE DEMO ↗', url: project.demo }
            ].filter((link) => link.url);

            links.forEach(({ label, url }) => {
                const a = document.createElement('a');
                a.href = url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.className = 'project-modal-link';
                a.textContent = label;
                linksEl.appendChild(a);
            });

            if (typeof modal.showModal === 'function') modal.showModal();
            else modal.setAttribute('open', '');
            cursorEls.forEach((el) => modal.appendChild(el));
            modal.querySelector('[data-close-project]')?.focus();
        }

        function closeModal() {
            if (typeof modal.close === 'function') modal.close();
            else modal.removeAttribute('open');
        }

        triggers.forEach((card) => {
            card.addEventListener('click', () => openModal(card));
        });
        modal.querySelector('[data-close-project]')?.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        modal.addEventListener('close', () => {
            cursorEls.forEach((el) => document.body.appendChild(el));
            lastTrigger?.focus();
        });
    }

    // ── 15. Copy email ──────────────────────────────────────
    function setupCopyEmail() {
        const btn = document.getElementById('copyMail');
        const state = document.getElementById('copyState');
        if (!btn) return;
        btn.addEventListener('click', async () => {
            const email = btn.dataset.email || 'ekanshsaraswat1234@gmail.com';
            try {
                await navigator.clipboard.writeText(email);
                if (state) state.innerHTML = 'Copied! <span>✓</span>';
                btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(.97)' }, { transform: 'scale(1.02)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
                setTimeout(() => { if (state) state.innerHTML = 'Click to copy <span>↗</span>'; }, 1800);
            } catch {
                if (state) state.textContent = email;
            }
        });
    }

    // ── 16. FAQ accordion ───────────────────────────────────
    function setupFaq() {
        const items = document.querySelectorAll('.faq-item');
        items.forEach((item) => {
            item.addEventListener('toggle', () => {
                if (!item.open) return;
                items.forEach((other) => { if (other !== item) other.removeAttribute('open'); });
            });
        });
    }

    // ── 17. Home Hero — scroll-driven mountain layers ───────
    function setupHomeHero() {
        const pin = document.getElementById('homeHeroPin');
        const hero = document.getElementById('homeHero');
        if (!pin || !hero) return;

        const G = typeof gsap !== 'undefined' ? gsap : null;
        const hasST = typeof ScrollTrigger !== 'undefined';
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const sky = document.getElementById('heroSky');
        const distant = document.getElementById('heroDistant');
        const dominant = document.getElementById('heroDominant');
        const closest = document.getElementById('heroClosest');
        const mistFar = document.getElementById('heroMistFar');
        const mistNear = document.getElementById('heroMistNear');
        const copyPrimary = document.getElementById('heroCopyPrimary');
        const copySecondary = document.getElementById('heroCopySecondary');
        const words = Array.from(document.querySelectorAll('#heroHeadline1 .hw'));
        const subline = document.getElementById('heroSubline1');
        const cue = document.querySelector('.hero-scroll-cue');
        const lip = document.querySelector('.hero-ivory-lip');

        if (reduced || !G || !hasST) {
            [sky, distant, dominant, closest].forEach((el) => {
                if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
            });
            if (mistFar) mistFar.style.opacity = '0.42';
            if (mistNear) mistNear.style.opacity = '0.5';
            words.forEach((w) => { w.style.opacity = '1'; w.style.filter = 'none'; w.style.transform = 'none'; });
            if (subline) { subline.style.opacity = '1'; subline.style.transform = 'none'; }
            if (lip) lip.style.opacity = '1';
            return;
        }

        const isMobile = window.matchMedia('(max-width: 760px)').matches;

        // Initial states: solid blue sky + headline only. Mountains, mist and
        // the white fade all stay hidden until the user starts scrolling.
        G.set([distant, dominant, closest].filter(Boolean), { y: 150, opacity: 0 });
        G.set([mistFar, mistNear].filter(Boolean), { opacity: 0 });
        if (lip) G.set(lip, { opacity: 0 });

        // Headline resolves word by word on initial load
        G.set(words, { opacity: 0, y: 10, filter: 'blur(8px)' });
        G.set(subline, { opacity: 0, y: 10 });
        if (cue) G.set(cue, { opacity: 0 });

        const introTl = G.timeline({ defaults: { ease: 'power2.out' } });
        introTl.to(words, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.75,
            stagger: 0.14
        }, 0.15);
        if (subline) introTl.to(subline, { opacity: 1, y: 0, duration: 0.7 }, 0.85);
        if (cue) introTl.to(cue, { opacity: 0.78, duration: 0.6 }, 1.15);

        // Subtle ambient mist drift (transform only)
        if (mistFar) {
            G.to(mistFar, { xPercent: 4, duration: 18, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        }
        if (mistNear) {
            G.to(mistNear, { xPercent: -5, duration: 15, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        }

        // Scroll-driven 200-250vh scrubbed sequence:
        // Mountain layers rise in pasted order ONLY when scrolling
        if (hasST) {
            G.registerPlugin(ScrollTrigger);
            const scrollDist = isMobile ? '+=130%' : '+=150%';

            const scrollTl = G.timeline({
                scrollTrigger: {
                    trigger: pin,
                    start: 'top top',
                    end: scrollDist,
                    pin: true,
                    scrub: 0.65,
                    anticipatePin: 1
                }
            });

            if (sky) scrollTl.to(sky, { yPercent: -4, ease: 'none', duration: 1 }, 0);

            // Pasted order: distant -> dominant -> closest -> mist
            if (distant && !isMobile) {
                scrollTl.to(distant, { y: 0, opacity: 0.88, duration: 0.28, ease: 'power2.out' }, 0.02);
                scrollTl.to(distant, { yPercent: -8, duration: 0.7, ease: 'none' }, 0.30);
            }
            if (dominant) {
                scrollTl.to(dominant, { y: 0, opacity: 0.96, duration: 0.30, ease: 'power2.out' }, 0.18);
                scrollTl.to(dominant, { yPercent: -15, duration: 0.52, ease: 'none' }, 0.48);
            }
            if (closest) {
                scrollTl.to(closest, { y: 0, opacity: 1, duration: 0.32, ease: 'power2.out' }, 0.36);
                scrollTl.to(closest, { yPercent: -22, duration: 0.32, ease: 'none' }, 0.68);
            }
            if (mistFar) {
                scrollTl.to(mistFar, { opacity: 0.42, xPercent: 8, duration: 0.45, ease: 'none' }, 0.45);
            }
            if (mistNear) {
                scrollTl.to(mistNear, { opacity: 0.5, xPercent: -10, duration: 0.45, ease: 'none' }, 0.52);
            }

            // The white gradient arrives only after the mountains have settled,
            // then carries the pinned hero into the white projects section.
            if (lip) scrollTl.to(lip, { opacity: 1, duration: 0.2, ease: 'none' }, 0.78);

            if (cue) scrollTl.to(cue, { opacity: 0, duration: 0.12 }, 0);

            // Headline 1 blurs out, Headline 2 resolves in
            if (copyPrimary) {
                scrollTl.to(copyPrimary, {
                    opacity: 0,
                    y: -24,
                    filter: 'blur(6px)',
                    duration: 0.22,
                    ease: 'power2.in'
                }, 0.22);
            }
            if (copySecondary) {
                G.set(copySecondary, { autoAlpha: 0, y: 20 });
                scrollTl.to(copySecondary, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.24,
                    ease: 'power2.out'
                }, 0.46);
                scrollTl.to(copySecondary, {
                    autoAlpha: 0,
                    y: -16,
                    duration: 0.18,
                    ease: 'power2.in'
                }, 0.84);
            }
        }
    }

    // ── 18. Selected Projects — muted drifting particles ────
    function setupWorkParticles() {
        const canvas = document.getElementById('workParticles');
        const section = document.getElementById('work');
        if (!canvas || !section) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const COLORS = ['#9BAEBB', '#A77D68', '#B8AD9E', '#A7A49D'];
        const COUNT = 52;
        let w = 0, h = 0, dpr = 1;
        let rafId = null;
        let running = false;

        const particles = Array.from({ length: COUNT }, () => ({
            x: Math.random(),
            y: Math.random(),
            r: 1.2 + Math.random() * 1.8,
            vx: (Math.random() - 0.5) * 0.00018,
            vy: (Math.random() - 0.5) * 0.00014,
            alpha: 0.22 + Math.random() * 0.30,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            depth: 0.4 + Math.random() * 0.8
        }));

        function resize() {
            const rect = section.getBoundingClientRect();
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = Math.max(rect.width, 320);
            h = Math.max(rect.height, 400);
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();
        window.addEventListener('resize', resize);

        function draw() {
            if (!running) return;
            ctx.clearRect(0, 0, w, h);
            const rect = section.getBoundingClientRect();
            const scrollShift = (rect.top / window.innerHeight) * 28;

            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < -0.02) p.x = 1.02;
                if (p.x > 1.02) p.x = -0.02;
                if (p.y < -0.02) p.y = 1.02;
                if (p.y > 1.02) p.y = -0.02;

                const px = p.x * w;
                const py = p.y * h + scrollShift * p.depth;
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(px, py, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
            rafId = requestAnimationFrame(draw);
        }

        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    if (!running) { running = true; draw(); }
                } else {
                    running = false;
                    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
                }
            });
        }, { threshold: 0.01 });
        io.observe(section);
    }

    // ── 19. Selected Projects — staggered card reveals ──────
    function setupWorkReveals() {
        const cards = gsapReady ? gsap.utils.toArray('.project-card') : [];
        if (!cards.length) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        gsap.registerPlugin(ScrollTrigger);
        cards.forEach((card, i) => {
            gsap.fromTo(card,
                { opacity: 0, y: 42 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.85,
                    delay: i * 0.08,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: card, start: 'top 86%', once: true }
                }
            );
        });
    }
})();
