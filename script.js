  /*
   * ============================================================
   * SPIDER-LINK
   * Original futuristic wearable-tech interface
   * Version: 0.2.0
   *
   * This is a software/UI prototype.
   * No dangerous hardware/projectile systems are implemented.
   * ============================================================
   */

(() => {
    "use strict";

    const STORAGE_KEY = "spiderlink_v2";

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

    const state = {
        suit: "CLASSIC",
        hud: "MINIMAL",
        aiName: "",
        battery: 87,
        connection: 2
    };

    let notificationTimer = null;

    /* ========================================================
       HELPERS
       ======================================================== */

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const $$ = (selector, root = document) =>
        Array.from(root.querySelectorAll(selector));

    function setText(selector, value) {
        const element = $(selector);

        if (element) {
            element.textContent = value;
        }
    }

    /* ========================================================
       STORAGE
       ======================================================== */

    function loadState() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "{}"
            );

            if (
                typeof saved.suit === "string" &&
                VALID_SUITS.includes(
                    saved.suit.toUpperCase()
                )
            ) {
                state.suit =
                    saved.suit.toUpperCase();
            }

            if (
                typeof saved.hud === "string" &&
                VALID_HUDS.includes(
                    saved.hud.toUpperCase()
                )
            ) {
                state.hud =
                    saved.hud.toUpperCase();
            }

            if (
                typeof saved.aiName === "string"
            ) {
                state.aiName =
                    saved.aiName
                        .replace(/\s+/g, " ")
                        .trim()
                        .slice(0, 20);
            }

        } catch (error) {
            console.warn(
                "SPIDER-LINK storage error:",
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
                    aiName: state.aiName
                })
            );
        } catch (error) {
            console.warn(
                "SPIDER-LINK save error:",
                error
            );
        }
    }

    /* ========================================================
       NOTIFICATIONS
       ======================================================== */

    function showNotification(message) {
        const notification =
            $("#notification");

        const text =
            $("#notificationText");

        if (!notification || !text) {
            console.log(
                `SPIDER-LINK → ${message}`
            );
            return;
        }

        text.textContent = message;

        notification.classList.remove(
            "show"
        );

        void notification.offsetWidth;

        notification.classList.add(
            "show"
        );

        clearTimeout(
            notificationTimer
        );

        notificationTimer =
            setTimeout(() => {
                notification.classList.remove(
                    "show"
                );
            }, 2400);
    }

    /* ========================================================
       SCROLL PROGRESS
       ======================================================== */

    function initializeScrollProgress() {
        let ticking = false;

        function update() {
            const scrollTop =
                window.scrollY;

            const documentHeight =
                document.documentElement
                    .scrollHeight -
                window.innerHeight;

            const progress =
                documentHeight > 0
                    ? (
                        scrollTop /
                        documentHeight
                    ) * 100
                    : 0;

            const bar =
                $(".scroll-progress");

            if (bar) {
                bar.style.width =
                    `${progress}%`;
            }

            const navbar =
                $(".navbar");

            if (navbar) {
                navbar.classList.toggle(
                    "scrolled",
                    scrollTop > 25
                );
            }

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
            { passive: true }
        );

        update();
    }

    /* ========================================================
       SCROLL REVEAL
       ======================================================== */

    function initializeScrollReveal() {
        const elements = $$(
            ".reveal, .reveal-left, .reveal-right"
        );

        if (!elements.length) {
            return;
        }

        if (
            !("IntersectionObserver" in window)
        ) {
            elements.forEach((element) => {
                element.classList.add(
                    "visible"
                );
            });

            return;
        }

        const observer =
            new IntersectionObserver(
                (entries, obs) => {
                    entries.forEach(
                        (entry) => {
                            if (
                                !entry.isIntersecting
                            ) {
                                return;
                            }

                            entry.target.classList.add(
                                "visible"
                            );

                            obs.unobserve(
                                entry.target
                            );
                        }
                    );
                },
                {
                    threshold: 0.12,
                    rootMargin:
                        "0px 0px -50px 0px"
                }
            );

        elements.forEach(
            (element) => {
                observer.observe(
                    element
                );
            }
        );
    }

    /* ========================================================
       STAGGERED CHILD REVEAL
       ======================================================== */

    function initializeStagger() {
        const groups = $$(
            ".system-grid, .suit-grid, .architecture-grid, .safety-grid"
        );

        groups.forEach((group) => {
            const children =
                Array.from(
                    group.children
                );

            children.forEach(
                (child, index) => {
                    child.classList.add(
                        "stagger-item"
                    );

                    child.style.transitionDelay =
                        `${index * 80}ms`;
                }
            );

            if (
                !("IntersectionObserver" in window)
            ) {
                children.forEach(
                    (child) => {
                        child.classList.add(
                            "visible"
                        );
                    }
                );

                return;
            }

            const observer =
                new IntersectionObserver(
                    (entries, obs) => {
                        entries.forEach(
                            (entry) => {
                                if (
                                    !entry.isIntersecting
                                ) {
                                    return;
                                }

                                children.forEach(
                                    (child) => {
                                        child.classList.add(
                                            "visible"
                                        );
                                    }
                                );

                                obs.unobserve(
                                    group
                                );
                            }
                        );
                    },
                    {
                        threshold: 0.08
                    }
                );

            observer.observe(group);
        });
    }

    /* ========================================================
       ACTIVE NAVIGATION
       ======================================================== */

    function initializeActiveNavigation() {
        const links = $$(
            '.nav-links a[href^="#"]'
        );

        if (!links.length) {
            return;
        }

        const sections = links
            .map((link) => {
                const id =
                    link.getAttribute(
                        "href"
                    );

                if (
                    !id ||
                    id === "#"
                ) {
                    return null;
                }

                return $(id);
            })
            .filter(Boolean);

        if (
            !("IntersectionObserver" in window)
        ) {
            return;
        }

        const observer =
            new IntersectionObserver(
                (entries) => {
                    entries.forEach(
                        (entry) => {
                            if (
                                !entry.isIntersecting
                            ) {
                                return;
                            }

                            links.forEach(
                                (link) => {
                                    link.classList.remove(
                                        "active"
                                    );
                                }
                            );

                            const active =
                                links.find(
                                    (link) =>
                                        link.getAttribute(
                                            "href"
                                        ) ===
                                        `#${entry.target.id}`
                                );

                            if (active) {
                                active.classList.add(
                                    "active"
                                );
                            }
                        }
                    );
                },
                {
                    rootMargin:
                        "-30% 0px -60% 0px",
                    threshold: 0
                }
            );

        sections.forEach(
            (section) => {
                observer.observe(
                    section
                );
            }
        );
    }

    /* ========================================================
       SMOOTH NAVIGATION
       ======================================================== */

    function initializeNavigation() {
        const links = $$(
            'a[href^="#"]'
        );

        links.forEach((link) => {
            link.addEventListener(
                "click",
                (event) => {
                    const targetID =
                        link.getAttribute(
                            "href"
                        );

                    if (
                        !targetID ||
                        targetID === "#"
                    ) {
                        return;
                    }

                    const target =
                        $(targetID);

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            );
        });
    }

    /* ========================================================
       CURSOR GLOW
       ======================================================== */

    function initializeCursorGlow() {
        if (
            window.matchMedia(
                "(pointer: coarse)"
            ).matches
        ) {
            return;
        }

        let glow =
            $(".cursor-glow");

        if (!glow) {
            glow =
                document.createElement(
                    "div"
                );

            glow.className =
                "cursor-glow";

            document.body.appendChild(
                glow
            );
        }

        let mouseX = -300;
        let mouseY = -300;

        let currentX = mouseX;
        let currentY = mouseY;

        function animate() {
            currentX +=
                (mouseX - currentX) *
                0.12;

            currentY +=
                (mouseY - currentY) *
                0.12;

            glow.style.left =
                `${currentX}px`;

            glow.style.top =
                `${currentY}px`;

            requestAnimationFrame(
                animate
            );
        }

        window.addEventListener(
            "pointermove",
            (event) => {
                mouseX = event.clientX;
                mouseY = event.clientY;

                glow.style.opacity = "1";
            },
            { passive: true }
        );

        document.addEventListener(
            "mouseleave",
            () => {
                glow.style.opacity = "0";
            }
        );

        animate();
    }

    /* ========================================================
       CARD TILT
       ======================================================== */

    function initializeCardTilt() {
        if (
            window.matchMedia(
                "(pointer: coarse)"
            ).matches
        ) {
            return;
        }

        const cards = $$(
            ".system-card, .architecture-card, .safety-card, .suit-card"
        );

        cards.forEach((card) => {
            card.addEventListener(
                "pointermove",
                (event) => {
                    const rect =
                        card.getBoundingClientRect();

                    const x =
                        event.clientX -
                        rect.left;

                    const y =
                        event.clientY -
                        rect.top;

                    const centerX =
                        rect.width / 2;

                    const centerY =
                        rect.height / 2;

                    const rotateX =
                        ((y - centerY) /
                            centerY) *
                        -3;

                    const rotateY =
                        ((x - centerX) /
                            centerX) *
                        3;

                    card.style.setProperty(
                        "--mouse-x",
                        `${x}px`
                    );

                    card.style.setProperty(
                        "--mouse-y",
                        `${y}px`
                    );

                    card.style.transform =
                        `perspective(800px)
                         rotateX(${rotateX}deg)
                         rotateY(${rotateY}deg)
                         translateY(-5px)`;
                }
            );

            card.addEventListener(
                "pointerleave",
                () => {
                    card.style.transform =
                        "";
                }
            );
        });
    }

    /* ========================================================
       MAGNETIC BUTTONS
       ======================================================== */

    function initializeMagneticButtons() {
        if (
            window.matchMedia(
                "(pointer: coarse)"
            ).matches
        ) {
            return;
        }

        const buttons = $$(
            ".primary-button, .secondary-button, .hud-option"
        );

        buttons.forEach((button) => {
            button.addEventListener(
                "pointermove",
                (event) => {
                    const rect =
                        button.getBoundingClientRect();

                    const x =
                        event.clientX -
                        rect.left -
                        rect.width / 2;

                    const y =
                        event.clientY -
                        rect.top -
                        rect.height / 2;

                    button.style.transform =
                        `translate(
                            ${x * 0.12}px,
                            ${y * 0.12}px
                        )`;
                }
            );

            button.addEventListener(
                "pointerleave",
                () => {
                    button.style.transform =
                        "";
                }
            );
        });
    }

    /* ========================================================
       RIPPLE EFFECT
       ======================================================== */

    function initializeRipples() {
        const elements = $$(
            ".primary-button, .secondary-button, .hud-option"
        );

        elements.forEach((element) => {
            element.addEventListener(
                "click",
                (event) => {
                    const rect =
                        element.getBoundingClientRect();

                    const ripple =
                        document.createElement(
                            "span"
                        );

                    ripple.className =
                        "ripple";

                    ripple.style.left =
                        `${event.clientX - rect.left}px`;

                    ripple.style.top =
                        `${event.clientY - rect.top}px`;

                    element.appendChild(
                        ripple
                    );

                    setTimeout(() => {
                        ripple.remove();
                    }, 700);
                }
            );
        });
    }

    /* ========================================================
       SUIT ENGINE
       ======================================================== */

    function setSuit(
        suit,
        notify = true
    ) {
        const normalized =
            String(suit || "")
                .trim()
                .toUpperCase();

        if (
            !VALID_SUITS.includes(
                normalized
            )
        ) {
            return;
        }

        state.suit =
            normalized;

        const cards =
            $$(".suit-card");

        cards.forEach((card) => {
            const cardSuit =
                String(
                    card.dataset.suit ||
                    ""
                ).toUpperCase();

            const active =
                cardSuit ===
                state.suit;

            card.classList.toggle(
                "active",
                active
            );

            card.setAttribute(
                "aria-pressed",
                String(active)
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

        setText(
            "#heroSuitName",
            state.suit
        );

        setText(
            "#hudSuit",
            state.suit
        );

        setText(
            "#selectedSuitName",
            state.suit
        );

        saveState();

        if (notify) {
            showNotification(
                `SUIT SYSTEM → ${state.suit}`
            );
        }

        console.log(
            `SPIDER-LINK SUIT → ${state.suit}`
        );
    }

    function initializeSuits() {
        const cards =
            $$(".suit-card");

        cards.forEach((card) => {
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

    /* ========================================================
       HUD ENGINE
       ======================================================== */

    function setHUD(
        hud,
        notify = true
    ) {
        const normalized =
            String(hud || "")
                .trim()
                .toUpperCase();

        if (
            !VALID_HUDS.includes(
                normalized
            )
        ) {
            return;
        }

        state.hud =
            normalized;

        const buttons =
            $$(".hud-option");

        buttons.forEach((button) => {
            const buttonHUD =
                String(
                    button.dataset.hud ||
                    ""
                ).toUpperCase();

            const active =
                buttonHUD ===
                state.hud;

            button.classList.toggle(
                "active",
                active
            );

            button.setAttribute(
                "aria-pressed",
                String(active)
            );
        });

        setText(
            "#hudMode",
            state.hud
        );

        saveState();

        if (notify) {
            showNotification(
                `HUD MODE → ${state.hud}`
            );
        }
    }

    function initializeHUD() {
        const buttons =
            $$(".hud-option");

        buttons.forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    setHUD(
                        button.dataset.hud
                    );
                }
            );
        });

        setHUD(
            state.hud,
            false
        );
    }

    /* ========================================================
       AI ENGINE
       ======================================================== */

    function updateAIUI() {
        const configured =
            Boolean(state.aiName);

        const name =
            state.aiName ||
            "UNCONFIGURED";

        setText(
            "#heroAIName",
            name
        );

        setText(
            "#aiNameDisplay",
            name
        );

        setText(
            "#hudAI",
            configured
                ? "ONLINE"
                : "OFFLINE"
        );
    }

    function saveAIName() {
        const input =
            $("#aiNameInput");

        if (!input) {
            return;
        }

        const name =
            input.value
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 20);

        if (!name) {
            showNotification(
                "ENTER AN AI DESIGNATION"
            );

            input.focus();

            return;
        }

        state.aiName =
            name;

        saveState();
        updateAIUI();

        input.value = "";

        showNotification(
            `AI LINK → ${name.toUpperCase()}`
        );
    }

    function initializeAI() {
        const saveButton =
            $("#saveAI");

        const input =
            $("#aiNameInput");

        const command =
            $("#commandAI");

        if (saveButton) {
            saveButton.addEventListener(
                "click",
                saveAIName
            );
        }

        if (input) {
            input.addEventListener(
                "keydown",
                (event) => {
                    if (
                        event.key ===
                        "Enter"
                    ) {
                        event.preventDefault();

                        saveAIName();
                    }
                }
            );
        }

        if (command) {
            command.addEventListener(
                "click",
                () => {
                    if (!state.aiName) {
                        showNotification(
                            "AI NOT CONFIGURED"
                        );

                        return;
                    }

                    showNotification(
                        `${state.aiName.toUpperCase()} → SYSTEM NOMINAL`
                    );
                }
            );
        }

        updateAIUI();
    }

    /* ========================================================
       MASK INTERACTION
       ======================================================== */

    function initializeMaskInteraction() {
        const mask =
            $(".mask-core");

        if (!mask) {
            return;
        }

        if (
            window.matchMedia(
                "(pointer: coarse)"
            ).matches
        ) {
            return;
        }

        mask.parentElement?.addEventListener(
            "pointermove",
            (event) => {
                const rect =
                    mask.parentElement.getBoundingClientRect();

                const x =
                    (
                        event.clientX -
                        rect.left
                    ) / rect.width;

                const rotation =
                    (x - 0.5) * 14;

                mask.style.setProperty(
                    "--mask-rotation",
                    `${rotation}deg`
                );
            }
        );

        mask.parentElement?.addEventListener(
            "pointerleave",
            () => {
                mask.style.setProperty(
                    "--mask-rotation",
                    "0deg"
                );
            }
        );
    }

    /* ========================================================
       TELEMETRY
       ======================================================== */

    function initializeTelemetry() {
        const batteryElements = $$(
            "[data-telemetry='battery']"
        );

        const connectionElements = $$(
            "[data-telemetry='connection']"
        );

        if (
            !batteryElements.length &&
            !connectionElements.length
        ) {
            return;
        }

        function update() {
            state.battery =
                Math.max(
                    65,
                    Math.min(
                        99,
                        state.battery +
                            (
                                Math.random() >
                                0.7
                                    ? -1
                                    : 0
                            )
                    )
                );

            state.connection =
                Math.floor(
                    1 +
                    Math.random() * 4
                );

            batteryElements.forEach(
                (element) => {
                    element.textContent =
                        `${state.battery}%`;
                }
            );

            connectionElements.forEach(
                (element) => {
                    element.textContent =
                        `${state.connection}ms`;
                }
            );
        }

        update();

        setInterval(
            update,
            3500
        );
    }

    /* ========================================================
       KEYBOARD CONTROL
       ======================================================== */

    function initializeKeyboard() {
        document.addEventListener(
            "keydown",
            (event) => {
                const active =
                    document.activeElement;

                const typing =
                    active &&
                    (
                        active.tagName ===
                            "INPUT" ||
                        active.tagName ===
                            "TEXTAREA" ||
                        active.isContentEditable
                    );

                if (typing) {
                    return;
                }

                switch (
                    event.key.toLowerCase()
                ) {
                    case "1":
                        setHUD(
                            "MINIMAL"
                        );
                        break;

                    case "2":
                        setHUD(
                            "TACTICAL"
                        );
                        break;

                    case "3":
                        setHUD(
                            "STEALTH"
                        );
                        break;

                    case "4":
                        setHUD(
                            "DEVELOPER"
                        );
                        break;

                    case "q":
                        setSuit(
                            "CLASSIC"
                        );
                        break;

                    case "w":
                        setSuit(
                            "SHADOW"
                        );
                        break;

                    case "e":
                        setSuit(
                            "APEX"
                        );
                        break;

                    case "r":
                        setSuit(
                            "CUSTOM"
                        );
                        break;

                    default:
                        break;
                }
            }
        );
    }

    /* ========================================================
       SYSTEM RESET
       ======================================================== */

    function resetSystem() {
        try {
            localStorage.removeItem(
                STORAGE_KEY
            );
        } catch (error) {
            console.warn(
                "SPIDER-LINK reset error:",
                error
            );
        }

        state.suit =
            "CLASSIC";

        state.hud =
            "MINIMAL";

        state.aiName =
            "";

        setSuit(
            "CLASSIC",
            false
        );

        setHUD(
            "MINIMAL",
            false
        );

        updateAIUI();

        showNotification(
            "SYSTEM RESET COMPLETE"
        );
    }

    /* ========================================================
       PUBLIC DEBUG API
       ======================================================== */

    window.SPIDERLINK = {
        version: "0.2.0",

        state,

        setSuit,
        setHUD,

        reset:
            resetSystem,

        notify:
            showNotification
    };

    /* ========================================================
       BOOT
       ======================================================== */

    async function runBoot() {
        const splash =
            $("#splashScreen");

        if (!splash) {
            return;
        }

        const status =
            $("#splashStatus");

        const percent =
            $("#splashPercent");

        const progress =
            $("#splashProgressBar");

        const sequence = [
            [
                "INITIALIZING CORE",
                12
            ],
            [
                "CHECKING INTERFACE",
                27
            ],
            [
                "LOADING INTERACTION ENGINE",
                43
            ],
            [
                "LINKING HUD",
                58
            ],
            [
                "SYNCING SUIT",
                73
            ],
            [
                "VERIFYING AI",
                88
            ],
            [
                "SYSTEM READY",
                100
            ]
        ];

        for (
            const [message, value]
            of sequence
        ) {
            if (status) {
                status.textContent =
                    message;
            }

            if (percent) {
                percent.textContent =
                    `${value}%`;
            }

            if (progress) {
                progress.style.width =
                    `${value}%`;
            }

            await new Promise(
                (resolve) =>
                    setTimeout(
                        resolve,
                        170
                    )
            );
        }

        await new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    350
                )
        );

        splash.classList.add(
            "hidden"
        );

        splash.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    /* ========================================================
       INITIALIZATION
       ======================================================== */

    async function initialize() {
        console.log(
            "%c🕷️ SPIDER-LINK v0.2.0",
            "font-size:22px;font-weight:900;"
        );

        loadState();

        initializeScrollProgress();

        initializeScrollReveal();

        initializeStagger();

        initializeNavigation();

        initializeActiveNavigation();

        initializeCursorGlow();

        initializeCardTilt();

        initializeMagneticButtons();

        initializeRipples();

        initializeSuits();

        initializeHUD();

        initializeAI();

        initializeMaskInteraction();

        initializeTelemetry();

        initializeKeyboard();

        await runBoot();

        showNotification(
            "SPIDER-LINK ONLINE"
        );

        console.log(
            "SYSTEM → ONLINE"
        );

        console.log(
            `SUIT → ${state.suit}`
        );

        console.log(
            `HUD → ${state.hud}`
        );

        console.log(
            `AI → ${
                state.aiName ||
                "UNCONFIGURED"
            }`
        );
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }

})();
