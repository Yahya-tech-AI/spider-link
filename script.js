/*
 * ============================================================
 * SPIDEY-LINK
 * Original futuristic wearable-tech interface
 * Version: 0.2.0
 *
 * This is a software/UI prototype.
 * No dangerous hardware/projectile systems are implemented.
 * ============================================================
 */

(() => {
    "use strict";

    /* =====================================================
       CONFIG
    ===================================================== */

    const STORAGE_KEY = "spidey_link_v2";

    const VALID_SUITS = [
        "CLASSIC",
        "SHADOW",
        "APEX",
        "CUSTOM"
    ];

    const VALID_HUDS = [
        "MINIMAL",
        "TACTICAL",
        "STEALTH",
        "DEVELOPER"
    ];

    /* =====================================================
       STATE
    ===================================================== */

    const state = {
        suit: "CLASSIC",
        hud: "MINIMAL",
        aiName: "",
        aiActive: false
    };

    /* =====================================================
       HELPERS
    ===================================================== */

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const $$ = (selector, root = document) =>
        Array.from(root.querySelectorAll(selector));

    function safeText(element, value) {
        if (element) {
            element.textContent = value;
        }
    }

    function formatName(value) {
        return String(value)
            .toLowerCase()
            .replace(/_/g, " ")
            .replace(/\b\w/g, char => char.toUpperCase());
    }

    /* =====================================================
       STORAGE
    ===================================================== */

    function loadState() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "{}"
            );

            if (
                typeof saved.suit === "string" &&
                VALID_SUITS.includes(saved.suit.toUpperCase())
            ) {
                state.suit = saved.suit.toUpperCase();
            }

            if (
                typeof saved.hud === "string" &&
                VALID_HUDS.includes(saved.hud.toUpperCase())
            ) {
                state.hud = saved.hud.toUpperCase();
            }

            if (typeof saved.aiName === "string") {
                state.aiName = saved.aiName
                    .replace(/\s+/g, " ")
                    .trim()
                    .slice(0, 20);
            }

            if (typeof saved.aiActive === "boolean") {
                state.aiActive = saved.aiActive;
            }

        } catch (error) {
            console.warn(
                "SPIDEY-LINK storage reset.",
                error
            );
        }
    }

    function saveState() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    suit: state.suit,
                    hud: state.hud,
                    aiName: state.aiName,
                    aiActive: state.aiActive
                })
            );

        } catch (error) {
            console.warn(
                "SPIDEY-LINK could not save state.",
                error
            );
        }
    }

    /* =====================================================
       NOTIFICATION ENGINE
    ===================================================== */

    let notificationTimer = null;

    function showNotification(message) {

        const notification = $("#notification");
        const text = $("#notificationText");

        if (!notification || !text) {
            return;
        }

        text.textContent = message;

        notification.classList.add("show");

        clearTimeout(notificationTimer);

        notificationTimer = setTimeout(() => {
            notification.classList.remove("show");
        }, 2400);
    }

    /* =====================================================
       SPLASH BOOT
    ===================================================== */

    function runSplash() {

        return new Promise(resolve => {

            const screen = $("#splashScreen");
            const status = $("#splashStatus");
            const progress = $("#splashProgressBar");
            const percent = $("#splashPercent");

            if (!screen) {
                resolve();
                return;
            }

            const stages = [
                "BOOTING CORE",
                "CHECKING INTERFACE",
                "LINKING SYSTEMS",
                "LOADING HUD",
                "INITIALIZING AI",
                "SYSTEM READY"
            ];

            let value = 0;

            const interval = setInterval(() => {

                value += Math.floor(
                    Math.random() * 8
                ) + 4;

                if (value >= 100) {
                    value = 100;
                }

                if (progress) {
                    progress.style.width = `${value}%`;
                }

                if (percent) {
                    percent.textContent = `${value}%`;
                }

                const index = Math.min(
                    stages.length - 1,
                    Math.floor(
                        (value / 100) *
                        stages.length
                    )
                );

                if (status) {
                    status.textContent = stages[index];
                }

                if (value >= 100) {

                    clearInterval(interval);

                    setTimeout(() => {

                        screen.classList.add("hidden");

                        resolve();

                    }, 450);
                }

            }, 110);
        });
    }

    /* =====================================================
       SCROLL PROGRESS
    ===================================================== */

    function updateScrollProgress() {

        const documentHeight =
            document.documentElement.scrollHeight -
            window.innerHeight;

        if (documentHeight <= 0) {

            document.documentElement.style
                .setProperty(
                    "--scroll-progress",
                    "0%"
                );

            return;
        }

        const progress =
            (window.scrollY / documentHeight) * 100;

        document.documentElement.style
            .setProperty(
                "--scroll-progress",
                `${Math.min(100, Math.max(0, progress))}%`
            );
    }

    /* =====================================================
       NAVBAR SCROLL STATE
    ===================================================== */

    function updateNavbar() {

        const navbar = $(".navbar");

        if (!navbar) {
            return;
        }

        navbar.classList.toggle(
            "scrolled",
            window.scrollY > 40
        );
    }

    /* =====================================================
       SCROLL REVEAL
       Automatically adds reveal classes to the HTML.
       This fixes the problem where the HTML had no
       .reveal elements.
    ===================================================== */

    function initializeReveal() {

        const revealGroups = [
            ".section-heading",
            ".hero-content",
            ".hero-visual",
            ".hero-meta",
            ".hero-actions",
            ".system-card",
            ".mask-display",
            ".feature-row",
            ".hud-options",
            ".hud-console",
            ".suit-card",
            ".selected-suit-panel",
            ".ai-panel",
            ".sync-node",
            ".architecture-card",
            ".safety-panel"
        ];

        revealGroups.forEach(selector => {

            $$(selector).forEach(element => {

                if (
                    !element.classList.contains("reveal") &&
                    !element.classList.contains("reveal-left") &&
                    !element.classList.contains("reveal-right")
                ) {
                    element.classList.add("reveal");
                }
            });
        });

        const elements =
            $$(".reveal, .reveal-left, .reveal-right");

        if (!elements.length) {
            return;
        }

        elements.forEach((element, index) => {

            const delay =
                Math.min(index * 45, 450);

            element.style.setProperty(
                "--reveal-delay",
                `${delay}ms`
            );
        });

        if (
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {

            elements.forEach(element => {
                element.classList.add("visible");
            });

            return;
        }

        if (!("IntersectionObserver" in window)) {

            elements.forEach(element => {
                element.classList.add("visible");
            });

            return;
        }

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target
                                .classList
                                .add("visible");

                            observer.unobserve(
                                entry.target
                            );
                        }
                    });

                },
                {
                    threshold: 0.12,
                    rootMargin: "0px 0px -50px 0px"
                }
            );

        elements.forEach(element => {
            observer.observe(element);
        });
    }

    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    function initializeNavigation() {

        const links = $$(".nav-links a");

        if (!links.length) {
            return;
        }

        const sections = [];

        links.forEach(link => {

            const href =
                link.getAttribute("href");

            if (
                href &&
                href.startsWith("#")
            ) {

                const section =
                    document.querySelector(href);

                if (section) {

                    sections.push({
                        section,
                        link
                    });
                }
            }

            link.addEventListener(
                "click",
                () => {

                    links.forEach(item =>
                        item.classList.remove(
                            "active"
                        )
                    );

                    link.classList.add(
                        "active"
                    );
                }
            );
        });

        if (!sections.length) {
            return;
        }

        if (!("IntersectionObserver" in window)) {
            return;
        }

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            links.forEach(link =>
                                link.classList
                                    .remove("active")
                            );

                            const match =
                                sections.find(
                                    item =>
                                        item.section ===
                                        entry.target
                                );

                            if (match) {

                                match.link
                                    .classList
                                    .add("active");
                            }
                        }

                    });

                },
                {
                    rootMargin:
                        "-35% 0px -55% 0px"
                }
            );

        sections.forEach(item => {
            observer.observe(item.section);
        });
    }

    /* =====================================================
       MOUSE TRACKING
    ===================================================== */

    function initializeMouseTracking() {

        const isTouch =
            window.matchMedia(
                "(hover: none)"
            ).matches;

        if (isTouch) {
            return;
        }

        window.addEventListener(
            "pointermove",
            event => {

                const x =
                    (event.clientX /
                        window.innerWidth) *
                    100;

                const y =
                    (event.clientY /
                        window.innerHeight) *
                    100;

                document.documentElement
                    .style
                    .setProperty(
                        "--mouse-x",
                        `${x}%`
                    );

                document.documentElement
                    .style
                    .setProperty(
                        "--mouse-y",
                        `${y}%`
                    );
            },
            {
                passive: true
            }
        );
    }

    /* =====================================================
       CARD POINTER GLOW
    ===================================================== */

    function initializeCardGlow() {

        const cards =
            $$(".system-card, .suit-card, .architecture-card");

        if (!cards.length) {
            return;
        }

        cards.forEach(card => {

            card.addEventListener(
                "pointermove",
                event => {

                    const rect =
                        card.getBoundingClientRect();

                    if (
                        rect.width === 0 ||
                        rect.height === 0
                    ) {
                        return;
                    }

                    const x =
                        ((event.clientX -
                            rect.left) /
                            rect.width) *
                        100;

                    const y =
                        ((event.clientY -
                            rect.top) /
                            rect.height) *
                        100;

                    card.style.setProperty(
                        "--card-x",
                        `${x}%`
                    );

                    card.style.setProperty(
                        "--card-y",
                        `${y}%`
                    );
                }
            );
        });
    }

    /* =====================================================
       MAGNETIC BUTTONS
    ===================================================== */

    function initializeMagneticButtons() {

        const buttons =
            $$(".button-primary, .button-secondary");

        if (!buttons.length) {
            return;
        }

        const isTouch =
            window.matchMedia(
                "(hover: none)"
            ).matches;

        if (isTouch) {
            return;
        }

        buttons.forEach(button => {

            button.addEventListener(
                "pointermove",
                event => {

                    const rect =
                        button.getBoundingClientRect();

                    const x =
                        event.clientX -
                        (rect.left +
                            rect.width / 2);

                    const y =
                        event.clientY -
                        (rect.top +
                            rect.height / 2);

                    button.style.transform =
                        `translate(${x * 0.08}px, ${y * 0.08}px)`;
                }
            );

            button.addEventListener(
                "pointerleave",
                () => {

                    button.style.transform = "";
                }
            );
        });
    }

    /* =====================================================
       HERO PARALLAX
    ===================================================== */

    function initializeHeroParallax() {

        const visual = $(".hero-visual");

        if (!visual) {
            return;
        }

        const isTouch =
            window.matchMedia(
                "(hover: none)"
            ).matches;

        if (isTouch) {
            return;
        }

        visual.addEventListener(
            "pointermove",
            event => {

                const rect =
                    visual.getBoundingClientRect();

                const x =
                    (event.clientX -
                        rect.left) /
                    rect.width -
                    0.5;

                const y =
                    (event.clientY -
                        rect.top) /
                    rect.height -
                    0.5;

                const core =
                    $(".hero-core", visual);

                const cardTop =
                    $(".card-top", visual);

                const cardBottom =
                    $(".card-bottom", visual);

                if (core) {

                    core.style.transform =
                        `translate(${x * 12}px, ${y * 12}px)`;
                }

                if (cardTop) {

                    cardTop.style.transform =
                        `translate(${x * -10}px, ${y * -10}px)`;
                }

                if (cardBottom) {

                    cardBottom.style.transform =
                        `translate(${x * 8}px, ${y * 8}px)`;
                }
            }
        );

        visual.addEventListener(
            "pointerleave",
            () => {

                const core =
                    $(".hero-core", visual);

                const cardTop =
                    $(".card-top", visual);

                const cardBottom =
                    $(".card-bottom", visual);

                if (core) {
                    core.style.transform = "";
                }

                if (cardTop) {
                    cardTop.style.transform = "";
                }

                if (cardBottom) {
                    cardBottom.style.transform = "";
                }
            }
        );
    }

    /* =====================================================
       SUIT SYSTEM
    ===================================================== */

    function setSuit(
        suit,
        notify = true
    ) {

        const normalized =
            String(suit)
                .trim()
                .toUpperCase();

        if (
            !VALID_SUITS.includes(
                normalized
            )
        ) {
            return;
        }

        state.suit = normalized;

        $$(".suit-card").forEach(card => {

            const cardSuit =
                String(
                    card.dataset.suit || ""
                ).toUpperCase();

            const active =
                cardSuit === state.suit;

            card.classList.toggle(
                "active",
                active
            );

            const status =
                $(".suit-status", card);

            if (status) {

                status.textContent =
                    active
                        ? "SELECTED"
                        : "AVAILABLE";
            }
        });

        safeText(
            $("#heroSuitName"),
            state.suit
        );

        safeText(
            $("#hudSuit"),
            state.suit
        );

        safeText(
            $("#selectedSuitName"),
            state.suit
        );

        saveState();

        if (notify) {

            showNotification(
                `SPIDEY-LINK SUIT → ${state.suit}`
            );
        }
    }

    function initializeSuits() {

        const cards =
            $$(".suit-card");

        cards.forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    setSuit(
                        card.dataset.suit
                    );
                }
            );
        });

        setSuit(
            state.suit,
            false
        );
    }

    /* =====================================================
       HUD SYSTEM
    ===================================================== */

    function setHUD(
        hud,
        notify = true
    ) {

        const normalized =
            String(hud)
                .trim()
                .toUpperCase();

        if (
            !VALID_HUDS.includes(
                normalized
            )
        ) {
            return;
        }

        state.hud = normalized;

        $$(".hud-option").forEach(
            button => {

                const buttonHUD =
                    String(
                        button.dataset.hud ||
                        ""
                    ).toUpperCase();

                button.classList.toggle(
                    "active",
                    buttonHUD === normalized
                );
            }
        );

        safeText(
            $("#hudMode"),
            normalized
        );

        const consoleDisplay =
            $(".console-display");

        if (consoleDisplay) {

            consoleDisplay.dataset.mode =
                normalized;
        }

        saveState();

        if (notify) {

            showNotification(
                `HUD MODE → ${normalized}`
            );
        }
    }

    function initializeHUD() {

        $$(".hud-option").forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        setHUD(
                            button.dataset.hud
                        );
                    }
                );
            }
        );

        setHUD(
            state.hud,
            false
        );
    }

    /* =====================================================
       AI SYSTEM
    ===================================================== */

    function updateAIUI() {

        const name =
            state.aiName ||
            "UNCONFIGURED";

        safeText(
            $("#heroAIName"),
            name
        );

        safeText(
            $("#aiNameDisplay"),
            name
        );

        safeText(
            $("#hudAI"),
            state.aiName
                ? "ONLINE"
                : "OFFLINE"
        );

        const status =
            $(".ai-status");

        if (status) {

            status.textContent =
                state.aiActive
                    ? "AI ACTIVE"
                    : state.aiName
                        ? "AI ONLINE"
                        : "AI OFFLINE";
        }

        const core =
            $(".ai-core");

        if (core) {

            core.classList.toggle(
                "active",
                state.aiActive
            );
        }
    }

    function saveAIName() {

        const input =
            $("#aiNameInput");

        if (!input) {
            return;
        }

        const name =
            input.value
                .trim()
                .replace(/\s+/g, " ")
                .slice(0, 20);

        if (!name) {

            showNotification(
                "ENTER AN AI DESIGNATION"
            );

            return;
        }

        state.aiName = name;
        state.aiActive = false;

        saveState();

        updateAIUI();

        input.value = "";

        showNotification(
            `AI DESIGNATION → ${name.toUpperCase()}`
        );
    }

    function toggleAI() {

        if (!state.aiName) {

            showNotification(
                "CONFIGURE AI FIRST"
            );

            return;
        }

        state.aiActive =
            !state.aiActive;

        saveState();

        updateAIUI();

        showNotification(
            state.aiActive
                ? `${state.aiName.toUpperCase()} → ACTIVE`
                : `${state.aiName.toUpperCase()} → STANDBY`
        );
    }

    function commandAI() {

        if (!state.aiName) {

            showNotification(
                "AI NOT CONFIGURED"
            );

            return;
        }

        state.aiActive = true;

        saveState();

        updateAIUI();

        showNotification(
            `${state.aiName.toUpperCase()} → SYSTEM NOMINAL`
        );
    }

    function initializeAI() {

        const save =
            $("#saveAI");

        if (save) {

            save.addEventListener(
                "click",
                saveAIName
            );
        }

        const input =
            $("#aiNameInput");

        if (input) {

            input.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter"
                    ) {
                        saveAIName();
                    }
                }
            );
        }

        const command =
            $("#commandAI");

        if (command) {

            command.addEventListener(
                "click",
                commandAI
            );
        }

        const core =
            $(".ai-core");

        if (core) {

            core.addEventListener(
                "click",
                toggleAI
            );
        }

        updateAIUI();
    }

    /* =====================================================
       MASK INTERACTION
    ===================================================== */

    function initializeMask() {

        const eyes =
            $$(".mask-eye");

        if (!eyes.length) {
            return;
        }

        eyes.forEach(eye => {

            eye.addEventListener(
                "click",
                () => {

                    eye.classList.add(
                        "mask-eye-flash"
                    );

                    showNotification(
                        "MASK OPTICS → ACTIVE"
                    );

                    setTimeout(() => {

                        eye.classList.remove(
                            "mask-eye-flash"
                        );

                    }, 500);
                }
            );
        });
    }

    /* =====================================================
       SYNC NODES
    ===================================================== */

    function initializeSyncNodes() {

        const nodes =
            $$(".sync-node");

        nodes.forEach(node => {

            node.addEventListener(
                "click",
                () => {

                    nodes.forEach(
                        item =>
                            item.classList
                                .remove("active")
                    );

                    node.classList.add(
                        "active"
                    );

                    const label =
                        $("strong", node);

                    const name =
                        label
                            ? label.textContent
                            : "SYSTEM";

                    showNotification(
                        `${name.toUpperCase()} → LINK ACTIVE`
                    );
                }
            );
        });
    }

    /* =====================================================
       FEATURE ROW INTERACTION
    ===================================================== */

    function initializeFeatureRows() {

        $$(".feature-row").forEach(
            row => {

                row.addEventListener(
                    "click",
                    () => {

                        const title =
                            $("h3", row);

                        if (!title) {
                            return;
                        }

                        showNotification(
                            `${title.textContent.toUpperCase()} → READY`
                        );
                    }
                );
            }
        );
    }

    /* =====================================================
       ARCHITECTURE CARDS
    ===================================================== */

    function initializeArchitectureCards() {

        $$(".architecture-card").forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        const title =
                            $("h3", card);

                        if (!title) {
                            return;
                        }

                        showNotification(
                            `${title.textContent.toUpperCase()} → MODULE ONLINE`
                        );
                    }
                );
            }
        );
    }

    /* =====================================================
       SYSTEM CARDS
    ===================================================== */

    function initializeSystemCards() {

        $$(".system-card").forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        const title =
                            $("h3", card);

                        if (!title) {
                            return;
                        }

                        showNotification(
                            `${title.textContent.toUpperCase()} → SYSTEM READY`
                        );
                    }
                );
            }
        );
    }

    /* =====================================================
       CLICK RIPPLE
    ===================================================== */

    function createRipple(event, element) {

        if (!element) {
            return;
        }

        const ripple =
            document.createElement("span");

        ripple.className =
            "click-ripple";

        const rect =
            element.getBoundingClientRect();

        ripple.style.left =
            `${event.clientX - rect.left}px`;

        ripple.style.top =
            `${event.clientY - rect.top}px`;

        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    function initializeRipple() {

        const interactive =
            $$(".button, .suit-card, .hud-option, .sync-node");

        interactive.forEach(element => {

            element.addEventListener(
                "click",
                event => {
                    createRipple(
                        event,
                        element
                    );
                }
            );
        });
    }

    /* =====================================================
       BUTTON FEEDBACK
    ===================================================== */

    function initializeButtonFeedback() {

        $$(".button").forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    if (
                        button.id ===
                        "saveAI"
                    ) {
                        return;
                    }

                    if (
                        button.id ===
                        "commandAI"
                    ) {
                        return;
                    }

                    const text =
                        button.textContent
                            .trim()
                            .toUpperCase();

                    if (text) {

                        showNotification(
                            `${text} → EXECUTED`
                        );
                    }
                }
            );
        });
    }

    /* =====================================================
       KEYBOARD SHORTCUTS
    ===================================================== */

    function initializeKeyboard() {

        document.addEventListener(
            "keydown",
            event => {

                const target =
                    event.target;

                if (
                    target &&
                    (
                        target.tagName === "INPUT" ||
                        target.tagName === "TEXTAREA" ||
                        target.isContentEditable
                    )
                ) {
                    return;
                }

                switch (
                    event.key.toLowerCase()
                ) {

                    case "1":
                        setHUD("MINIMAL");
                        break;

                    case "2":
                        setHUD("TACTICAL");
                        break;

                    case "3":
                        setHUD("STEALTH");
                        break;

                    case "4":
                        setHUD("DEVELOPER");
                        break;

                    case "s":
                        setSuit("SHADOW");
                        break;

                    case "a":
                        setSuit("APEX");
                        break;

                    case "c":
                        setSuit("CLASSIC");
                        break;

                    default:
                        break;
                }
            }
        );
    }

    /* =====================================================
       SCROLL EVENTS
    ===================================================== */

    function initializeScroll() {

        let ticking = false;

        function update() {

            updateScrollProgress();
            updateNavbar();

            ticking = false;
        }

        window.addEventListener(
            "scroll",
            () => {

                if (!ticking) {

                    window.requestAnimationFrame(
                        update
                    );

                    ticking = true;
                }

            },
            {
                passive: true
            }
        );

        update();
    }

    /* =====================================================
       DEBUG API
    ===================================================== */

    window.SPIDEYLINK = {

        state,

        setSuit,

        setHUD,

        saveAIName,

        showNotification,

        reset() {

            localStorage.removeItem(
                STORAGE_KEY
            );

            location.reload();
        }
    };

    /* =====================================================
       MASTER INITIALIZATION
    ===================================================== */

    async function initializeSPIDEYLINK() {

        loadState();

        initializeScroll();

        initializeReveal();

        initializeNavigation();

        initializeMouseTracking();

        initializeCardGlow();

        initializeMagneticButtons();

        initializeHeroParallax();

        initializeSuits();

        initializeHUD();

        initializeAI();

        initializeMask();

        initializeSyncNodes();

        initializeFeatureRows();

        initializeArchitectureCards();

        initializeSystemCards();

        initializeRipple();

        initializeButtonFeedback();

        initializeKeyboard();

        await runSplash();

        showNotification(
            "SPIDEY-LINK INTERACTIVE ENGINE v0.2 ONLINE"
        );

        console.log(
            "%cSPIDEY-LINK",
            "color:#ff2038;font-size:20px;font-weight:bold;"
        );

        console.log(
            "SPIDEY-LINK Interactive Engine v0.2 initialized."
        );

        console.log(
            "Suit:",
            state.suit
        );

        console.log(
            "HUD:",
            state.hud
        );

        console.log(
            "AI:",
            state.aiName || "UNCONFIGURED"
        );

        console.log(
            "AI Status:",
            state.aiActive
                ? "ACTIVE"
                : "STANDBY"
        );
    }

    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeSPIDEYLINK,
            {
                once: true
            }
        );

    } else {

        initializeSPIDEYLINK();
    }

})();
