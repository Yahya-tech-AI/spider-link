/* =========================================================
   SPIDER-LINK
   Futuristic Wearable Technology Interface
   script.js
   ========================================================= */

"use strict";


/* =========================================================
   SPIDER-LINK GLOBAL STATE
   ========================================================= */

const SPIDERLINK = {

    version: "0.1.0",

    system: {
        online: true,
        mode: "NORMAL",
        battery: 87,
        connection: 2,
        temperature: 31,
        stability: 99
    },

    mask: {
        online: true,
        expression: "NORMAL",
        camera: true,
        audio: true
    },

    suit: {
        current: "CLASSIC"
    },

    ai: {
        name: "LARA",
        online: true
    },

    hud: {
        activePanel: "SYSTEM"
    },

    boot: {
        complete: false
    }

};


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (selector, parent = document) => {
    return parent.querySelector(selector);
};

const $$ = (selector, parent = document) => {
    return [...parent.querySelectorAll(selector)];
};


/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEY = "spiderlink_state";


/* =========================================================
   SAFE HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   LOAD SAVED STATE
   ========================================================= */

function loadSavedState() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return;
        }

        const parsed =
            JSON.parse(saved);

        if (parsed.system) {

            SPIDERLINK.system = {
                ...SPIDERLINK.system,
                ...parsed.system
            };

        }

        if (parsed.mask) {

            SPIDERLINK.mask = {
                ...SPIDERLINK.mask,
                ...parsed.mask
            };

        }

        if (parsed.suit) {

            SPIDERLINK.suit = {
                ...SPIDERLINK.suit,
                ...parsed.suit
            };

        }

        if (parsed.ai) {

            SPIDERLINK.ai = {
                ...SPIDERLINK.ai,
                ...parsed.ai
            };

        }

        if (parsed.hud) {

            SPIDERLINK.hud = {
                ...SPIDERLINK.hud,
                ...parsed.hud
            };

        }

    } catch (error) {

        console.warn(
            "SPIDER-LINK: Could not load saved state.",
            error
        );

    }

}


/* =========================================================
   SAVE STATE
   ========================================================= */

function saveState() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(SPIDERLINK)
        );

    } catch (error) {

        console.warn(
            "SPIDER-LINK: Could not save state.",
            error
        );

    }

}


/* =========================================================
   SPLASH / BOOT SYSTEM
   ========================================================= */

function createSplashScreen() {

    let splash =
        $("#spiderlink-splash");

    if (splash) {
        return splash;
    }

    splash =
        document.createElement("div");

    splash.id =
        "spiderlink-splash";

    splash.innerHTML = `
        <div class="splash-grid"></div>

        <div class="splash-content">

            <div class="splash-symbol">
                <div class="splash-ring ring-one"></div>
                <div class="splash-ring ring-two"></div>

                <div class="splash-spider">
                    🕷
                </div>
            </div>

            <div class="splash-brand">
                SPIDER-LINK
            </div>

            <div class="splash-subtitle">
                WEAR THE INTERFACE
            </div>

            <div class="splash-status">
                <span id="splashStatus">
                    INITIALIZING SYSTEM
                </span>

                <span id="splashPercent">
                    0%
                </span>
            </div>

            <div class="splash-progress">
                <div
                    id="splashProgressBar"
                    class="splash-progress-bar"
                ></div>
            </div>

            <div
                id="splashLog"
                class="splash-log"
            >
                BOOT SEQUENCE STARTING...
            </div>

        </div>
    `;

    document.body.prepend(splash);

    addSplashStyles();

    return splash;

}


/* =========================================================
   SPLASH STYLES
   ========================================================= */

function addSplashStyles() {

    if ($("#spiderlink-splash-styles")) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "spiderlink-splash-styles";

    style.textContent = `

        #spiderlink-splash {
            position: fixed;
            inset: 0;
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            background:
                radial-gradient(
                    circle at center,
                    rgba(255,38,56,.10),
                    transparent 32%
                ),
                #030405;
            color: #f5f7fa;
            overflow: hidden;
            transition:
                opacity .7s ease,
                visibility .7s ease;
        }

        #spiderlink-splash.hidden {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }

        .splash-grid {
            position: absolute;
            inset: 0;
            opacity: .14;
            background-image:
                linear-gradient(
                    rgba(255,255,255,.06) 1px,
                    transparent 1px
                ),
                linear-gradient(
                    90deg,
                    rgba(255,255,255,.06) 1px,
                    transparent 1px
                );
            background-size: 42px 42px;
            mask-image:
                radial-gradient(
                    circle at center,
                    black,
                    transparent 75%
                );
        }

        .splash-content {
            position: relative;
            z-index: 2;
            width: min(460px, 88vw);
            text-align: center;
        }

        .splash-symbol {
            position: relative;
            width: 130px;
            height: 130px;
            margin: 0 auto 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .splash-spider {
            position: relative;
            z-index: 3;
            font-size: 54px;
            color: #ff2638;
            filter:
                drop-shadow(
                    0 0 12px
                    rgba(255,38,56,.8)
                );
            animation:
                splashSpiderPulse
                1.8s ease-in-out infinite;
        }

        .splash-ring {
            position: absolute;
            border: 1px solid
                rgba(255,38,56,.5);
            border-radius: 50%;
            inset: 10px;
        }

        .ring-one {
            animation:
                splashSpin
                7s linear infinite;
        }

        .ring-two {
            inset: 25px;
            border-style: dashed;
            opacity: .5;
            animation:
                splashSpinReverse
                5s linear infinite;
        }

        .splash-brand {
            font-family:
                Orbitron,
                Inter,
                Arial,
                sans-serif;
            font-size: clamp(25px, 6vw, 42px);
            font-weight: 800;
            letter-spacing: .18em;
            color: #f5f7fa;
        }

        .splash-subtitle {
            margin-top: 9px;
            font-family:
                Orbitron,
                Inter,
                Arial,
                sans-serif;
            font-size: 9px;
            letter-spacing: .32em;
            color: #ff2638;
        }

        .splash-status {
            display: flex;
            justify-content: space-between;
            margin-top: 42px;
            margin-bottom: 8px;
            font-family:
                Orbitron,
                Inter,
                Arial,
                sans-serif;
            font-size: 8px;
            letter-spacing: .13em;
            color: rgba(245,247,250,.65);
        }

        #splashPercent {
            color: #49ff9b;
        }

        .splash-progress {
            height: 3px;
            background:
                rgba(255,255,255,.08);
            overflow: hidden;
        }

        .splash-progress-bar {
            width: 0%;
            height: 100%;
            background: #ff2638;
            box-shadow:
                0 0 14px
                rgba(255,38,56,.8);
            transition: width .18s ease;
        }

        .splash-log {
            min-height: 20px;
            margin-top: 15px;
            font-family:
                "Courier New",
                monospace;
            font-size: 9px;
            letter-spacing: .08em;
            color: rgba(245,247,250,.38);
        }

        @keyframes splashSpin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }

        @keyframes splashSpinReverse {
            from {
                transform: rotate(360deg);
            }
            to {
                transform: rotate(0deg);
            }
        }

        @keyframes splashSpiderPulse {
            0%, 100% {
                transform: scale(1);
                opacity: .8;
            }

            50% {
                transform: scale(1.08);
                opacity: 1;
            }
        }

        @media (
            prefers-reduced-motion: reduce
        ) {

            .splash-spider,
            .ring-one,
            .ring-two {
                animation: none;
            }

        }

    `;

    document.head.appendChild(style);

}


/* =========================================================
   BOOT LOGIC
   ========================================================= */

function bootStep(
    percent,
    status,
    log,
    delay
) {

    return new Promise((resolve) => {

        setTimeout(() => {

            const progress =
                $("#splashProgressBar");

            const percentText =
                $("#splashPercent");

            const statusText =
                $("#splashStatus");

            const logText =
                $("#splashLog");

            if (progress) {
                progress.style.width =
                    `${percent}%`;
            }

            if (percentText) {
                percentText.textContent =
                    `${percent}%`;
            }

            if (statusText) {
                statusText.textContent =
                    status;
            }

            if (logText) {
                logText.textContent =
                    log;
            }

            resolve();

        }, delay);

    });

}


async function runBootSequence() {

    const splash =
        createSplashScreen();

    document.body.style.overflow =
        "hidden";

    await bootStep(
        12,
        "POWER CORE",
        "POWER CORE INITIALIZED...",
        120
    );

    await bootStep(
        28,
        "SYSTEM CHECK",
        "SYSTEM TELEMETRY ONLINE...",
        180
    );

    await bootStep(
        43,
        "MASK LINK",
        "MASK INTERFACE CONNECTED...",
        180
    );

    await bootStep(
        57,
        "SUIT LINK",
        "SUIT PROFILE DATABASE READY...",
        180
    );

    await bootStep(
        71,
        "HUD CORE",
        "HUD RENDERING ENGINE ONLINE...",
        180
    );

    await bootStep(
        84,
        "AI CORE",
        `${SPIDERLINK.ai.name} AI CORE INITIALIZING...`,
        180
    );

    await bootStep(
        94,
        "SYNC",
        "PHONE // MASK // SUIT SYNCHRONIZED...",
        180
    );

    await bootStep(
        100,
        "SYSTEM ONLINE",
        "SPIDER-LINK READY.",
        240
    );

    SPIDERLINK.boot.complete =
        true;

    saveState();

    await new Promise((resolve) => {

        setTimeout(resolve, 500);

    });

    splash.classList.add("hidden");

    document.body.style.overflow = "";

    setTimeout(() => {

        splash.remove();

    }, 800);

}


/* =========================================================
   DOM REFERENCES
   ========================================================= */

const heroAIName =
    $("#heroAIName");

const aiNameDisplay =
    $("#aiNameDisplay");

const aiNameInput =
    $("#aiNameInput");

const saveAI =
    $("#saveAI");

const commandAI =
    $("#commandAI");

const hudOptions =
    $$(".hud-option");

const suitCards =
    $$(".suit-card");

const systemOnlineElements =
    $$(".system-online");

const navLinks =
    $$(".nav-links a");

const buttons =
    $$("button");


/* =========================================================
   AI NAME SYSTEM
   ========================================================= */

function updateAINameUI() {

    const name =
        SPIDERLINK.ai.name || "LARA";

    if (heroAIName) {
        heroAIName.textContent =
            name;
    }

    if (aiNameDisplay) {
        aiNameDisplay.textContent =
            name;
    }

    if (aiNameInput) {
        aiNameInput.value =
            name;
    }

    if (commandAI) {

        commandAI.innerHTML =
            `“<span>${escapeHTML(name)}</span>, system status.”`;

    }

}


function saveAIName() {

    if (!aiNameInput) {
        return;
    }

    let newName =
        aiNameInput.value.trim();

    if (!newName) {
        newName = "LARA";
    }

    newName =
        newName
            .replace(/\s+/g, " ")
            .slice(0, 20);

    SPIDERLINK.ai.name =
        newName;

    updateAINameUI();

    saveState();

    showNotification(
        `AI identity updated → ${newName}`
    );

}


if (saveAI) {

    saveAI.addEventListener(
        "click",
        saveAIName
    );

}


if (aiNameInput) {

    aiNameInput.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {
                saveAIName();
            }

        }
    );

}


/* =========================================================
   HUD CONSOLE
   ========================================================= */

const HUD_DATA = {

    SYSTEM: {
        title: "SYSTEM OVERVIEW",
        description:
            "Core SPIDER-LINK system telemetry.",
        mode: "NORMAL"
    },

    SUIT: {
        title: "SUIT CONTROL",
        description:
            "Current wearable suit configuration.",
        mode: "SUIT"
    },

    AI: {
        title: "AI CORE",
        description:
            "Personal intelligence and command interface.",
        mode: "AI"
    },

    CAMERA: {
        title: "CAMERA SYSTEM",
        description:
            "Mask camera and visual subsystem.",
        mode: "CAMERA"
    },

    SENSORS: {
        title: "SENSOR ARRAY",
        description:
            "Wearable sensor monitoring interface.",
        mode: "SENSORS"
    }

};


function getHUDMainHeader() {

    return $(".hud-main-header");

}


function showHUDPanelMessage(panel) {

    const screen =
        $(".hud-screen");

    if (!screen) {
        return;
    }

    const existing =
        $(".hud-screen-label", screen);

    if (existing) {
        existing.remove();
    }

    const label =
        document.createElement("div");

    label.className =
        "hud-screen-label";

    label.textContent =
        `${panel} // ${HUD_DATA[panel].mode}`;

    Object.assign(
        label.style,
        {
            position: "absolute",
            bottom: "18px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "rgba(255,255,255,.5)",
            fontFamily:
                "Orbitron, sans-serif",
            fontSize: "8px",
            letterSpacing: ".14em"
        }
    );

    screen.appendChild(label);

}


function setHUDPanel(panel) {

    if (!HUD_DATA[panel]) {
        panel = "SYSTEM";
    }

    SPIDERLINK.hud.activePanel =
        panel;

    hudOptions.forEach((button) => {

        const buttonText =
            button.textContent
                .trim()
                .toUpperCase();

        button.classList.toggle(
            "active",
            buttonText === panel
        );

    });

    const header =
        getHUDMainHeader();

    if (header) {

        const title =
            $("h3", header);

        const description =
            $("p", header);

        if (title) {
            title.textContent =
                HUD_DATA[panel].title;
        }

        if (description) {
            description.textContent =
                HUD_DATA[panel].description;
        }

    }

    showHUDPanelMessage(panel);

    saveState();

}


hudOptions.forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            const panel =
                button.textContent
                    .trim()
                    .toUpperCase();

            setHUDPanel(panel);

        }
    );

});


/* =========================================================
   SUIT SYSTEM
   ========================================================= */

function normalizeSuitName(name) {

    return String(name)
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_");

}


function getSuitNameFromCard(card) {

    const title =
        $("h3", card);

    if (!title) {
        return "CUSTOM";
    }

    return normalizeSuitName(
        title.textContent
    );

}


function formatSuitName(suit) {

    return String(suit)
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            char => char.toUpperCase()
        );

}


/*
 * IMPORTANT:
 * notify = true when the user manually
 * changes suit.
 *
 * notify = false during startup.
 */

function setSuit(
    suit,
    notify = true
) {

    SPIDERLINK.suit.current =
        normalizeSuitName(suit);

    suitCards.forEach((card) => {

        const cardSuit =
            getSuitNameFromCard(card);

        const active =
            cardSuit ===
            SPIDERLINK.suit.current;

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

    document.body.dataset.suit =
        SPIDERLINK.suit.current;

    updateSuitUI(
        SPIDERLINK.suit.current
    );

    saveState();

    /*
     * ONLY notify when a real
     * user action happens.
     */

    if (notify) {

        showNotification(
            `Suit profile loaded → ${formatSuitName(
                SPIDERLINK.suit.current
            )}`
        );

    }

}


function updateSuitUI(suit) {

    const suitLabels =
        $$("[data-suit]");

    suitLabels.forEach((element) => {

        element.textContent =
            formatSuitName(suit);

    });

}


suitCards.forEach((card) => {

    card.addEventListener(
        "click",
        () => {

            const suit =
                getSuitNameFromCard(card);

            setSuit(
                suit,
                true
            );

        }
    );

});


/* =========================================================
   SYSTEM TELEMETRY
   ========================================================= */

function updateSystemStatus() {

    SPIDERLINK.system.battery -=
        Math.random() < 0.15
            ? 1
            : 0;

    if (
        SPIDERLINK.system.battery < 20
    ) {

        SPIDERLINK.system.battery =
            87;

    }

    SPIDERLINK.system.connection =
        Math.floor(
            1 + Math.random() * 4
        );

    SPIDERLINK.system.temperature =
        Math.floor(
            29 + Math.random() * 7
        );

    SPIDERLINK.system.stability =
        Math.floor(
            97 + Math.random() * 3
        );

    updateTelemetryUI();

}


function updateTelemetryUI() {

    const labels =
        $$(".stat-label");

    labels.forEach((label) => {

        const text =
            label.textContent
                .trim()
                .toUpperCase();

        const parent =
            label.parentElement;

        const value =
            parent
                ? $(".stat-value", parent)
                : null;

        if (!value) {
            return;
        }

        if (
            text.includes("BATTERY")
        ) {

            value.textContent =
                `${SPIDERLINK.system.battery}%`;

            value.classList.toggle(
                "red",
                SPIDERLINK.system.battery <= 20
            );

            value.classList.toggle(
                "green",
                SPIDERLINK.system.battery > 40
            );

        }

        if (
            text.includes("CONNECTION") ||
            text.includes("LATENCY")
        ) {

            value.textContent =
                `${SPIDERLINK.system.connection}ms`;

        }

        if (
            text.includes("TEMP") ||
            text.includes("TEMPERATURE")
        ) {

            value.textContent =
                `${SPIDERLINK.system.temperature}°C`;

        }

        if (
            text.includes("STABILITY") ||
            text.includes("SYSTEM")
        ) {

            value.textContent =
                `${SPIDERLINK.system.stability}%`;

        }

    });

}


setInterval(
    updateSystemStatus,
    4000
);


/* =========================================================
   ONLINE INDICATORS
   ========================================================= */

function updateOnlineIndicators() {

    systemOnlineElements.forEach(
        (element) => {

            const text =
                element.querySelector("span");

            if (
                SPIDERLINK.system.online
            ) {

                element.classList.add(
                    "online"
                );

                if (text) {
                    text.textContent =
                        "SYSTEM ONLINE";
                }

            } else {

                element.classList.remove(
                    "online"
                );

                if (text) {
                    text.textContent =
                        "SYSTEM OFFLINE";
                }

            }

        }
    );

}


/* =========================================================
   NOTIFICATION SYSTEM
   ========================================================= */

let notificationTimer =
    null;


function createNotificationElement() {

    let notification =
        $("#spiderlink-notification");

    if (notification) {
        return notification;
    }

    notification =
        document.createElement("div");

    notification.id =
        "spiderlink-notification";

    Object.assign(
        notification.style,
        {
            position: "fixed",
            right: "22px",
            bottom: "22px",
            zIndex: "99999",
            maxWidth: "320px",
            padding: "14px 18px",
            border:
                "1px solid rgba(255,38,56,.4)",
            borderRadius: "10px",
            background:
                "rgba(5,7,9,.92)",
            backdropFilter: "blur(15px)",
            color: "#f5f7fa",
            fontFamily:
                "Orbitron, sans-serif",
            fontSize: "9px",
            letterSpacing: ".08em",
            boxShadow:
                "0 15px 50px rgba(0,0,0,.45)",
            opacity: "0",
            transform:
                "translateY(10px)",
            transition:
                "opacity .2s ease, transform .2s ease"
        }
    );

    document.body.appendChild(
        notification
    );

    return notification;

}


function showNotification(message) {

    const notification =
        createNotificationElement();

    notification.textContent =
        message;

    notification.style.opacity =
        "1";

    notification.style.transform =
        "translateY(0)";

    clearTimeout(
        notificationTimer
    );

    notificationTimer =
        setTimeout(() => {

            notification.style.opacity =
                "0";

            notification.style.transform =
                "translateY(10px)";

        }, 2600);

}


/* =========================================================
   BUTTON RIPPLE
   ========================================================= */

function initializeButtonRipples() {

    $$("button").forEach((button) => {

        button.addEventListener(
            "click",
            function(event) {

                const rect =
                    button.getBoundingClientRect();

                const ripple =
                    document.createElement("span");

                Object.assign(
                    ripple.style,
                    {
                        position: "absolute",
                        left:
                            `${event.clientX - rect.left}px`,
                        top:
                            `${event.clientY - rect.top}px`,
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background:
                            "rgba(255,255,255,.35)",
                        transform:
                            "translate(-50%, -50%) scale(0)",
                        pointerEvents: "none",
                        transition:
                            "transform .4s ease, opacity .4s ease"
                    }
                );

                button.style.position =
                    button.style.position ||
                    "relative";

                button.style.overflow =
                    "hidden";

                button.appendChild(
                    ripple
                );

                requestAnimationFrame(
                    () => {

                        ripple.style.transform =
                            "translate(-50%, -50%) scale(35)";

                        ripple.style.opacity =
                            "0";

                    }
                );

                setTimeout(
                    () => ripple.remove(),
                    450
                );

            }
        );

    });

}


/* =========================================================
   SMOOTH NAVIGATION
   ========================================================= */

function initializeNavigation() {

    navLinks.forEach((link) => {

        link.addEventListener(
            "click",
            (event) => {

                const href =
                    link.getAttribute("href");

                if (
                    !href ||
                    !href.startsWith("#")
                ) {
                    return;
                }

                const target =
                    document.querySelector(
                        href
                    );

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


/* =========================================================
   ACTIVE NAVIGATION
   ========================================================= */

const sections =
    $$("section[id]");


function updateActiveNavigation() {

    let current =
        "";

    const scrollPosition =
        window.scrollY + 160;

    sections.forEach(
        (section) => {

            if (
                scrollPosition >=
                section.offsetTop
            ) {

                current =
                    section.id;

            }

        }
    );

    navLinks.forEach(
        (link) => {

            const href =
                link.getAttribute("href");

            link.classList.toggle(
                "active",
                href === `#${current}`
            );

        }
    );

}


window.addEventListener(
    "scroll",
    updateActiveNavigation,
    {
        passive: true
    }
);


/* =========================================================
   MASK EXPRESSIONS
   ========================================================= */

const MASK_EXPRESSIONS = [

    "NORMAL",
    "ALERT",
    "FOCUS",
    "STEALTH",
    "WARNING"

];


function setMaskExpression(
    expression
) {

    if (
        !MASK_EXPRESSIONS.includes(
            expression
        )
    ) {

        expression =
            "NORMAL";

    }

    SPIDERLINK.mask.expression =
        expression;

    document.body.dataset.maskExpression =
        expression.toLowerCase();

    updateMaskExpressionUI();

    saveState();

}


function updateMaskExpressionUI() {

    const status =
        $(".mask-status");

    if (status) {

        status.textContent =
            `MASK // ${SPIDERLINK.mask.expression}`;

    }

}


function cycleMaskExpression() {

    const currentIndex =
        MASK_EXPRESSIONS.indexOf(
            SPIDERLINK.mask.expression
        );

    const nextIndex =
        (
            currentIndex + 1
        ) %
        MASK_EXPRESSIONS.length;

    setMaskExpression(
        MASK_EXPRESSIONS[nextIndex]
    );

}


/* =========================================================
   AI COMMAND SYSTEM
   ========================================================= */

function processAICommand(
    command
) {

    const cleanCommand =
        command
            .trim()
            .toLowerCase();

    if (!cleanCommand) {
        return;
    }

    const aiName =
        SPIDERLINK.ai.name
            .toLowerCase();

    let response =
        "COMMAND RECOGNIZED.";

    if (
        cleanCommand.includes(
            "system status"
        ) ||
        cleanCommand.includes(
            "status"
        )
    ) {

        response =
            `SYSTEM ONLINE • BATTERY ${SPIDERLINK.system.battery}% • STABILITY ${SPIDERLINK.system.stability}%`;

    }

    else if (
        cleanCommand.includes(
            "battery"
        )
    ) {

        response =
            `BATTERY LEVEL ${SPIDERLINK.system.battery}%`;

    }

    else if (
        cleanCommand.includes(
            "suit"
        )
    ) {

        response =
            `CURRENT SUIT → ${formatSuitName(
                SPIDERLINK.suit.current
            )}`;

    }

    else if (
        cleanCommand.includes(
            "camera"
        )
    ) {

        response =
            SPIDERLINK.mask.camera
                ? "CAMERA SYSTEM READY."
                : "CAMERA SYSTEM OFFLINE.";

    }

    else if (
        cleanCommand.includes(
            "hello"
        ) ||
        cleanCommand.includes(
            "hi"
        )
    ) {

        response =
            `HELLO. ${SPIDERLINK.ai.name} AI CORE IS ONLINE.`;

    }

    else if (
        cleanCommand.includes(
            "stealth"
        )
    ) {

        SPIDERLINK.system.mode =
            "STEALTH";

        setMaskExpression(
            "STEALTH"
        );

        response =
            "STEALTH MODE SIMULATED.";

    }

    else if (
        cleanCommand.includes(
            "normal"
        )
    ) {

        SPIDERLINK.system.mode =
            "NORMAL";

        setMaskExpression(
            "NORMAL"
        );

        response =
            "NORMAL MODE RESTORED.";

    }

    else if (
        cleanCommand.includes(
            aiName
        )
    ) {

        response =
            `${SPIDERLINK.ai.name} ONLINE. AWAITING COMMAND.`;

    }

    showNotification(
        response
    );

    saveState();

}


function initializeAICommands() {

    const input =
        $("#aiCommandInput");

    const button =
        $("#aiCommandButton");

    if (
        !input ||
        !button
    ) {
        return;
    }

    button.addEventListener(
        "click",
        () => {

            processAICommand(
                input.value
            );

            input.value =
                "";

        }
    );

    input.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key ===
                "Enter"
            ) {

                processAICommand(
                    input.value
                );

                input.value =
                    "";

            }

        }
    );

}


/* =========================================================
   HUD PARALLAX
   ========================================================= */

function initializeHUDParallax() {

    const hudFrame =
        $(".hud-frame");

    if (!hudFrame) {
        return;
    }

    hudFrame.addEventListener(
        "mousemove",
        (event) => {

            const rect =
                hudFrame.getBoundingClientRect();

            const x =
                (
                    event.clientX -
                    rect.left
                ) /
                rect.width;

            const y =
                (
                    event.clientY -
                    rect.top
                ) /
                rect.height;

            const rotateX =
                (y - .5) * -5;

            const rotateY =
                (x - .5) * 5;

            hudFrame.style.transform =
                `perspective(900px)
                 rotateX(${rotateX}deg)
                 rotateY(${rotateY}deg)`;

        }
    );

    hudFrame.addEventListener(
        "mouseleave",
        () => {

            hudFrame.style.transform =
                "perspective(900px) rotateX(0deg) rotateY(0deg)";

        }
    );

}


/* =========================================================
   INTERSECTION OBSERVER
   ========================================================= */

function initializeAnimations() {

    const animatedElements =
        $$(
            ".system-card, .suit-card, .feature-row, .arch-node, .ai-panel"
        );

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
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: .12
            }
        );

    animatedElements.forEach(
        (element) => {

            element.style.opacity =
                "0";

            element.style.transform =
                "translateY(18px)";

            element.style.transition =
                "opacity .6s ease, transform .6s ease";

            observer.observe(
                element
            );

        }
    );

}


/* =========================================================
   VISIBILITY STYLES
   ========================================================= */

function addVisibilityStyles() {

    const style =
        document.createElement("style");

    style.textContent = `

        .system-card.visible,
        .suit-card.visible,
        .feature-row.visible,
        .arch-node.visible,
        .ai-panel.visible {

            opacity:
                1 !important;

            transform:
                translateY(0) !important;

        }

        .nav-links a.active {
            color: #f5f7fa;
        }

        .nav-links a.active::after {
            width: 100%;
        }

    `;

    document.head.appendChild(
        style
    );

}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

function initializeKeyboardShortcuts() {

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
                    "TEXTAREA"
                );

            if (typing) {
                return;
            }

            /*
             * M
             * Cycle mask expression
             */

            if (
                event.key.toLowerCase() ===
                "m"
            ) {

                cycleMaskExpression();

                showNotification(
                    `Mask expression → ${SPIDERLINK.mask.expression}`
                );

            }

            /*
             * 1–5
             * HUD panels
             */

            const panelKeys = {

                "1": "SYSTEM",
                "2": "SUIT",
                "3": "AI",
                "4": "CAMERA",
                "5": "SENSORS"

            };

            if (
                panelKeys[event.key]
            ) {

                setHUDPanel(
                    panelKeys[event.key]
                );

            }

        }
    );

}


/* =========================================================
   MAIN INITIALIZATION
   ========================================================= */

async function initializeSPIDERLINK() {

    /*
     * Load saved user state first.
     */

    loadSavedState();


    /*
     * Prepare visual systems.
     */

    updateAINameUI();

    updateOnlineIndicators();

    updateTelemetryUI();

    setHUDPanel(
        SPIDERLINK.hud.activePanel
    );


    /*
     * IMPORTANT:
     *
     * false prevents:
     *
     * "Suit profile loaded → Classic"
     *
     * from appearing on every page load.
     */

    setSuit(
        SPIDERLINK.suit.current,
        false
    );


    setMaskExpression(
        SPIDERLINK.mask.expression
    );


    /*
     * Initialize interactive systems.
     */

    initializeButtonRipples();

    initializeNavigation();

    initializeAICommands();

    initializeHUDParallax();

    initializeAnimations();

    initializeKeyboardShortcuts();

    addVisibilityStyles();

    updateActiveNavigation();


    /*
     * Console diagnostics.
     */

    console.log(
        "%cSPIDER-LINK",
        "color:#ff2638;font-size:24px;font-weight:bold;"
    );

    console.log(
        `%cSYSTEM ONLINE // v${SPIDERLINK.version}`,
        "color:#49ff9b;font-size:12px;"
    );

    console.log(
        "Prototype interface initialized."
    );


    /*
     * Start splash sequence.
     */

    await runBootSequence();

}


/* =========================================================
   START
   ========================================================= */

initializeSPIDERLINK();


/* =========================================================
   DEBUG API
   ========================================================= */

window.SPIDERLINK =
    SPIDERLINK;

window.setSuit =
    setSuit;

window.setMaskExpression =
    setMaskExpression;

window.setHUDPanel =
    setHUDPanel;

window.processAICommand =
    processAICommand;


/* =========================================================
   END OF SPIDER-LINK
   ========================================================= */
