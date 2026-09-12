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
   DOM REFERENCES
   ========================================================= */

const heroAIName = $("#heroAIName");
const aiNameDisplay = $("#aiNameDisplay");
const aiNameInput = $("#aiNameInput");
const saveAI = $("#saveAI");
const commandAI = $("#commandAI");

const hudOptions = $$(".hud-option");
const suitCards = $$(".suit-card");

const systemOnlineElements = $$(".system-online");

const navLinks = $$(".nav-links a");

const buttons = $$("button");

const statValues = $$(".stat-value");


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

const STORAGE_KEY = "spiderlink_state";


function loadSavedState() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return;
        }

        const parsed = JSON.parse(saved);

        if (parsed.ai) {
            SPIDERLINK.ai = {
                ...SPIDERLINK.ai,
                ...parsed.ai
            };
        }

        if (parsed.system) {
            SPIDERLINK.system = {
                ...SPIDERLINK.system,
                ...parsed.system
            };
        }

        if (parsed.suit) {
            SPIDERLINK.suit = {
                ...SPIDERLINK.suit,
                ...parsed.suit
            };
        }

        if (parsed.mask) {
            SPIDERLINK.mask = {
                ...SPIDERLINK.mask,
                ...parsed.mask
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
   AI NAME SYSTEM
   ========================================================= */

function updateAINameUI() {

    const name = SPIDERLINK.ai.name || "LARA";

    if (heroAIName) {
        heroAIName.textContent = name;
    }

    if (aiNameDisplay) {
        aiNameDisplay.textContent = name;
    }

    if (aiNameInput) {
        aiNameInput.value = name;
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

    let newName = aiNameInput.value.trim();

    if (!newName) {
        newName = "LARA";
    }

    /*
     * Keep the AI name readable.
     * This is only a UI simulator, so we limit
     * extremely long names.
     */

    newName = newName
        .replace(/\s+/g, " ")
        .slice(0, 20);

    SPIDERLINK.ai.name = newName;

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
   HUD CONSOLE
   ========================================================= */

const HUD_DATA = {

    SYSTEM: {
        title: "SYSTEM OVERVIEW",
        description: "Core SPIDER-LINK system telemetry.",
        mode: "NORMAL"
    },

    SUIT: {
        title: "SUIT CONTROL",
        description: "Current wearable suit configuration.",
        mode: "SUIT"
    },

    AI: {
        title: "AI CORE",
        description: "Personal intelligence and command interface.",
        mode: "AI"
    },

    CAMERA: {
        title: "CAMERA SYSTEM",
        description: "Mask camera and visual subsystem.",
        mode: "CAMERA"
    },

    SENSORS: {
        title: "SENSOR ARRAY",
        description: "Wearable sensor monitoring interface.",
        mode: "SENSORS"
    }

};


function getHUDMainHeader() {

    return $(".hud-main-header");

}


function setHUDPanel(panel) {

    if (!HUD_DATA[panel]) {
        panel = "SYSTEM";
    }

    SPIDERLINK.hud.activePanel = panel;

    hudOptions.forEach((button) => {

        const buttonText =
            button.textContent.trim().toUpperCase();

        button.classList.toggle(
            "active",
            buttonText === panel
        );

    });

    const header = getHUDMainHeader();

    if (header) {

        const title = $("h3", header);
        const description = $("p", header);

        if (title) {
            title.textContent = HUD_DATA[panel].title;
        }

        if (description) {
            description.textContent =
                HUD_DATA[panel].description;
        }

    }

    showHUDPanelMessage(panel);

    saveState();

}


function showHUDPanelMessage(panel) {

    const screen = $(".hud-screen");

    if (!screen) {
        return;
    }

    const existing = $(".hud-screen-label", screen);

    if (existing) {
        existing.remove();
    }

    const label = document.createElement("div");

    label.className = "hud-screen-label";

    label.textContent =
        `${panel} // ${HUD_DATA[panel].mode}`;

    label.style.position = "absolute";
    label.style.bottom = "18px";
    label.style.left = "50%";
    label.style.transform = "translateX(-50%)";
    label.style.color = "rgba(255,255,255,.5)";
    label.style.fontFamily = "Orbitron, sans-serif";
    label.style.fontSize = "8px";
    label.style.letterSpacing = ".14em";

    screen.appendChild(label);

}


hudOptions.forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            const panel =
                button.textContent.trim().toUpperCase();

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

    const title = $("h3", card);

    if (!title) {
        return "CUSTOM";
    }

    return normalizeSuitName(
        title.textContent
    );

}


function setSuit(suit) {

    SPIDERLINK.suit.current = suit;

    suitCards.forEach((card) => {

        const cardSuit =
            getSuitNameFromCard(card);

        const active =
            cardSuit === suit;

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

    document.body.dataset.suit = suit;

    updateSuitUI(suit);

    saveState();

    showNotification(
        `Suit profile loaded → ${formatSuitName(suit)}`
    );

}


function updateSuitUI(suit) {

    const suitLabels = $$(
        "[data-suit]"
    );

    suitLabels.forEach((element) => {

        element.textContent =
            formatSuitName(suit);

    });

}


function formatSuitName(suit) {

    return String(suit)
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, char =>
            char.toUpperCase()
        );

}


suitCards.forEach((card) => {

    card.addEventListener(
        "click",
        () => {

            const suit =
                getSuitNameFromCard(card);

            setSuit(suit);

        }
    );

});


/* =========================================================
   SYSTEM STATUS
   ========================================================= */

function updateSystemStatus() {

    SPIDERLINK.system.battery -=
        Math.random() < 0.15 ? 1 : 0;

    if (SPIDERLINK.system.battery < 20) {
        SPIDERLINK.system.battery = 87;
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

    const labels = $$(
        ".stat-label"
    );

    labels.forEach((label) => {

        const text =
            label.textContent.trim().toUpperCase();

        const value =
            label.parentElement
                ? $(".stat-value", label.parentElement)
                : null;

        if (!value) {
            return;
        }

        if (text.includes("BATTERY")) {

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
   SYSTEM ONLINE INDICATORS
   ========================================================= */

function updateOnlineIndicators() {

    systemOnlineElements.forEach((element) => {

        if (SPIDERLINK.system.online) {

            element.classList.add("online");

            const text =
                element.querySelector("span");

            if (text) {
                text.textContent = "SYSTEM ONLINE";
            }

        } else {

            element.classList.remove("online");

            const text =
                element.querySelector("span");

            if (text) {
                text.textContent = "SYSTEM OFFLINE";
            }

        }

    });

}


/* =========================================================
   NOTIFICATION SYSTEM
   ========================================================= */

let notificationTimer = null;


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

    notification.style.position = "fixed";
    notification.style.right = "22px";
    notification.style.bottom = "22px";
    notification.style.zIndex = "99999";

    notification.style.maxWidth = "320px";

    notification.style.padding =
        "14px 18px";

    notification.style.border =
        "1px solid rgba(255,38,56,.4)";

    notification.style.borderRadius =
        "10px";

    notification.style.background =
        "rgba(5,7,9,.92)";

    notification.style.backdropFilter =
        "blur(15px)";

    notification.style.color =
        "#f5f7fa";

    notification.style.fontFamily =
        "Orbitron, sans-serif";

    notification.style.fontSize =
        "9px";

    notification.style.letterSpacing =
        ".08em";

    notification.style.boxShadow =
        "0 15px 50px rgba(0,0,0,.45)";

    notification.style.opacity = "0";

    notification.style.transform =
        "translateY(10px)";

    notification.style.transition =
        "opacity .2s ease, transform .2s ease";

    document.body.appendChild(notification);

    return notification;

}


function showNotification(message) {

    const notification =
        createNotificationElement();

    notification.textContent =
        message;

    notification.style.opacity = "1";

    notification.style.transform =
        "translateY(0)";

    clearTimeout(notificationTimer);

    notificationTimer =
        setTimeout(() => {

            notification.style.opacity =
                "0";

            notification.style.transform =
                "translateY(10px)";

        }, 2600);

}


/* =========================================================
   BUTTON RIPPLE EFFECT
   ========================================================= */

buttons.forEach((button) => {

    button.addEventListener(
        "click",
        function (event) {

            const rect =
                button.getBoundingClientRect();

            const ripple =
                document.createElement("span");

            ripple.style.position =
                "absolute";

            ripple.style.left =
                `${event.clientX - rect.left}px`;

            ripple.style.top =
                `${event.clientY - rect.top}px`;

            ripple.style.width = "5px";
            ripple.style.height = "5px";

            ripple.style.borderRadius = "50%";

            ripple.style.background =
                "rgba(255,255,255,.35)";

            ripple.style.transform =
                "translate(-50%, -50%) scale(0)";

            ripple.style.pointerEvents =
                "none";

            ripple.style.transition =
                "transform .4s ease, opacity .4s ease";

            button.style.position =
                button.style.position || "relative";

            button.style.overflow =
                "hidden";

            button.appendChild(ripple);

            requestAnimationFrame(() => {

                ripple.style.transform =
                    "translate(-50%, -50%) scale(35)";

                ripple.style.opacity = "0";

            });

            setTimeout(() => {

                ripple.remove();

            }, 450);

        }
    );

});


/* =========================================================
   SMOOTH NAVIGATION
   ========================================================= */

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
                document.querySelector(href);

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


/* =========================================================
   ACTIVE NAVIGATION ON SCROLL
   ========================================================= */

const sections =
    $$("section[id]");


function updateActiveNavigation() {

    let current =
        "";

    const scrollPosition =
        window.scrollY + 160;

    sections.forEach((section) => {

        if (
            scrollPosition >=
            section.offsetTop
        ) {

            current =
                section.id;

        }

    });

    navLinks.forEach((link) => {

        const href =
            link.getAttribute("href");

        link.classList.toggle(
            "active",
            href === `#${current}`
        );

    });

}


window.addEventListener(
    "scroll",
    updateActiveNavigation,
    {
        passive: true
    }
);


/* =========================================================
   MASK EXPRESSION SYSTEM
   ========================================================= */

const MASK_EXPRESSIONS = [
    "NORMAL",
    "ALERT",
    "FOCUS",
    "STEALTH",
    "WARNING"
];


function setMaskExpression(expression) {

    if (
        !MASK_EXPRESSIONS.includes(
            expression
        )
    ) {
        expression = "NORMAL";
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
        (currentIndex + 1) %
        MASK_EXPRESSIONS.length;

    setMaskExpression(
        MASK_EXPRESSIONS[nextIndex]
    );

}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        /*
         * Ignore shortcuts while typing.
         */

        const active =
            document.activeElement;

        const typing =
            active &&
            (
                active.tagName === "INPUT" ||
                active.tagName === "TEXTAREA"
            );

        if (typing) {
            return;
        }


        /*
         * M = cycle mask expression
         */

        if (
            event.key.toLowerCase() === "m"
        ) {

            cycleMaskExpression();

            showNotification(
                `Mask expression → ${SPIDERLINK.mask.expression}`
            );

        }


        /*
         * 1–5 = HUD panels
         */

        const panelKeys = {
            "1": "SYSTEM",
            "2": "SUIT",
            "3": "AI",
            "4": "CAMERA",
            "5": "SENSORS"
        };

        if (panelKeys[event.key]) {

            setHUDPanel(
                panelKeys[event.key]
            );

        }

    }
);


/* =========================================================
   AI COMMAND SIMULATOR
   ========================================================= */

function processAICommand(command) {

    const cleanCommand =
        command
            .trim()
            .toLowerCase();

    if (!cleanCommand) {
        return;
    }

    const aiName =
        SPIDERLINK.ai.name.toLowerCase();

    let response =
        "Command recognized.";

    if (
        cleanCommand.includes("system status") ||
        cleanCommand.includes("status")
    ) {

        response =
            `SYSTEM ONLINE • BATTERY ${SPIDERLINK.system.battery}% • STABILITY ${SPIDERLINK.system.stability}%`;

    } else if (
        cleanCommand.includes("battery")
    ) {

        response =
            `BATTERY LEVEL ${SPIDERLINK.system.battery}%`;

    } else if (
        cleanCommand.includes("suit")
    ) {

        response =
            `CURRENT SUIT → ${formatSuitName(SPIDERLINK.suit.current)}`;

    } else if (
        cleanCommand.includes("camera")
    ) {

        response =
            SPIDERLINK.mask.camera
                ? "CAMERA SYSTEM READY."
                : "CAMERA SYSTEM OFFLINE.";

    } else if (
        cleanCommand.includes("hello") ||
        cleanCommand.includes("hi")
    ) {

        response =
            `HELLO. ${SPIDERLINK.ai.name} AI CORE IS ONLINE.`;

    } else if (
        cleanCommand.includes("stealth")
    ) {

        SPIDERLINK.system.mode =
            "STEALTH";

        setMaskExpression("STEALTH");

        response =
            "STEALTH MODE SIMULATED.";

    } else if (
        cleanCommand.includes("normal")
    ) {

        SPIDERLINK.system.mode =
            "NORMAL";

        setMaskExpression("NORMAL");

        response =
            "NORMAL MODE RESTORED.";

    } else if (
        cleanCommand.includes(aiName)
    ) {

        response =
            `${SPIDERLINK.ai.name} ONLINE. AWAITING COMMAND.`;

    }

    showNotification(response);

    saveState();

}


/*
 * If an element with id="aiCommandInput"
 * exists in the HTML, enable command simulation.
 */

const aiCommandInput =
    $("#aiCommandInput");

const aiCommandButton =
    $("#aiCommandButton");


if (aiCommandButton && aiCommandInput) {

    aiCommandButton.addEventListener(
        "click",
        () => {

            processAICommand(
                aiCommandInput.value
            );

            aiCommandInput.value = "";

        }
    );


    aiCommandInput.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                processAICommand(
                    aiCommandInput.value
                );

                aiCommandInput.value = "";

            }

        }
    );

}


/* =========================================================
   HOVER PARALLAX FOR HUD
   ========================================================= */

const hudFrame =
    $(".hud-frame");


if (hudFrame) {

    hudFrame.addEventListener(
        "mousemove",
        (event) => {

            const rect =
                hudFrame.getBoundingClientRect();

            const x =
                (event.clientX - rect.left) /
                rect.width;

            const y =
                (event.clientY - rect.top) /
                rect.height;

            const rotateX =
                (y - 0.5) * -5;

            const rotateY =
                (x - 0.5) * 5;

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

const animatedElements =
    $$(
        ".system-card, .suit-card, .feature-row, .arch-node, .ai-panel"
    );


if (
    "IntersectionObserver" in window
) {

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
                threshold: 0.12
            }
        );


    animatedElements.forEach(
        (element) => {

            element.style.opacity = "0";

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
   VISIBILITY CLASS
   ========================================================= */

const visibilityStyle =
    document.createElement("style");

visibilityStyle.textContent = `
    .system-card.visible,
    .suit-card.visible,
    .feature-row.visible,
    .arch-node.visible,
    .ai-panel.visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }

    .nav-links a.active {
        color: #f5f7fa;
    }

    .nav-links a.active::after {
        width: 100%;
    }
`;

document.head.appendChild(
    visibilityStyle
);


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeSPIDERLINK() {

    loadSavedState();

    updateAINameUI();

    updateOnlineIndicators();

    updateTelemetryUI();

    setHUDPanel(
        SPIDERLINK.hud.activePanel
    );

    setSuit(
        SPIDERLINK.suit.current
    );

    setMaskExpression(
        SPIDERLINK.mask.expression
    );

    updateActiveNavigation();

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

}


initializeSPIDERLINK();


/* =========================================================
   DEBUG API
   ========================================================= */

window.SPIDERLINK =
    SPIDERLINK;


/*
 * Example console commands:
 *
 * SPIDERLINK.ai.name
 *
 * SPIDERLINK.suit.current
 *
 * SPIDERLINK.system.battery
 *
 * setSuit("SHADOW")
 *
 * setMaskExpression("FOCUS")
 *
 * setHUDPanel("AI")
 *
 * processAICommand("system status")
 *
 */


/* =========================================================
   END OF SPIDER-LINK
   ========================================================= */
