// The four screens, as markup. Shared by the board and the interactive app.
//
//   01 Home       entry point — hero, one action, recent history
//   02 Sign       the two-way screen: patient signs ⇄ clinician speaks
//   03 History    past encounters
//   04 Settings   language, capture, accessibility, data
//
// Design language (Syncopate, bone/ink/blue, hairline rules) is the website's.

import { mediaMarkup } from "./media.js";

export const ICONS = {
  home: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.6 10.2 12 3.7l8.4 6.5V20a.9.9 0 0 1-.9.9H4.5a.9.9 0 0 1-.9-.9v-9.8Z"/><path d="M9.6 20.9v-6.3h4.8v6.3"/></svg>`,

  hand: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8.5 13.4V6.2a1.4 1.4 0 0 1 2.8 0v5.6"/>
    <path d="M11.3 11.8V4.7a1.4 1.4 0 0 1 2.8 0v7.1"/>
    <path d="M14.1 11.8V6.6a1.4 1.4 0 0 1 2.8 0v7.2"/>
    <path d="M8.5 13.4v-1.1a1.4 1.4 0 0 0-2.8 0v3.9a5.9 5.9 0 0 0 5.9 5.9h1.1a5.9 5.9 0 0 0 5.9-5.9v-2.1"/>
  </svg>`,

  speech: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.4 11.6a7.7 7.7 0 0 1-8.3 7.6 8.9 8.9 0 0 1-2.4-.4L4.6 20.4l1.3-3.9a7.6 7.6 0 0 1-1.3-4.4 7.7 7.7 0 0 1 7.9-7.6h.4a7.7 7.7 0 0 1 7.5 7.1Z"/>
    <path d="M9.2 11.6h.01"/><path d="M12.4 11.6h.01"/><path d="M15.6 11.6h.01"/>
  </svg>`,

  clock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 2"/></svg>`,

  gear: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.1 14.4a1.5 1.5 0 0 0 .3 1.7l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.5 1.5 0 0 0-2.6 1.1v.2a1.9 1.9 0 1 1-3.8 0v-.1a1.5 1.5 0 0 0-2.6-1.1l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.5 1.5 0 0 0-1.1-2.6h-.2a1.9 1.9 0 1 1 0-3.8h.1a1.5 1.5 0 0 0 1.1-2.6l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.5 1.5 0 0 0 1.7.3h.1a1.5 1.5 0 0 0 .9-1.4v-.2a1.9 1.9 0 1 1 3.8 0v.1a1.5 1.5 0 0 0 2.6 1.1l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.5 1.5 0 0 0 1.1 2.6h.2a1.9 1.9 0 1 1 0 3.8h-.1a1.5 1.5 0 0 0-1.4.9Z"/></svg>`,

  repeat: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11.5a8 8 0 1 1-2.6-5.9"/><path d="M20.2 4.4v4.2h-4.2"/></svg>`,

  mic: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2.6" width="6" height="10.6" rx="3"/><path d="M5.6 11a6.4 6.4 0 0 0 12.8 0"/><path d="M12 17.4v3.2"/></svg>`,

  play: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="margin-left:2px"><path d="M8 4.8c0-.9 1-1.5 1.8-1l9 6.4a1.7 1.7 0 0 1 0 2.8l-9 6.4c-.8.5-1.8-.1-1.8-1V4.8Z"/></svg>`,
};

const SIG = `<svg width="14" height="9" viewBox="0 0 14 9" fill="currentColor"><rect x="0" y="5.6" width="2.2" height="3.4" rx="0.7"/><rect x="3.8" y="3.8" width="2.2" height="5.2" rx="0.7"/><rect x="7.6" y="1.9" width="2.2" height="7.1" rx="0.7"/><rect x="11.4" y="0" width="2.2" height="9" rx="0.7"/></svg>`;
const WIFI = `<svg width="13" height="9" viewBox="0 0 13 9" fill="currentColor"><path d="M6.5 8.7 4.7 6.7a2.6 2.6 0 0 1 3.6 0L6.5 8.7Z"/><path d="M3.3 5.1a5 5 0 0 1 6.4 0L8.4 6.4a3.2 3.2 0 0 0-3.8 0L3.3 5.1Z"/><path d="M1 2.8a8 8 0 0 1 11 0l-1.3 1.3a6.2 6.2 0 0 0-8.4 0L1 2.8Z"/></svg>`;
const BATT = `<svg width="20" height="10" viewBox="0 0 20 10" fill="none"><rect x="0.4" y="0.5" width="16.4" height="9" rx="2.6" stroke="currentColor" stroke-opacity=".32"/><rect x="1.8" y="1.9" width="13.4" height="6.2" rx="1.5" fill="currentColor"/><path d="M18.3 3.4v3.2c.75-.25 1.1-.8 1.1-1.6s-.35-1.35-1.1-1.6Z" fill="currentColor" fill-opacity=".32"/></svg>`;

const statusbar = (dark) => `
  <div class="statusbar${dark ? " is-on-dark" : ""}">
    <span>9:41</span>
    <span class="glyphs">${SIG}${WIFI}${BATT}</span>
  </div>`;

const homebar = (dark) =>
  `<div class="home-bar${dark ? " is-on-dark" : ""}"><span></span></div>`;

const tabbar = (active) => {
  const tabs = [
    ["home", "home", "Home"],
    ["sign", "hand", "Sign"],
    ["history", "clock", "History"],
    ["settings", "gear", "Settings"],
  ];
  return `
  <div class="tabbar">
    ${tabs
      .map(
        ([key, icon, label]) => `
      <button class="tab${key === active ? " is-active" : ""}" data-go="${key}" aria-label="${label}"${key === active ? ' aria-current="page"' : ""}>
        ${ICONS[icon]}
        <span class="tab-label">${label}</span>
      </button>`
      )
      .join("")}
  </div>`;
};

/* ------------------------------------------------------------
   01 — HOME
   ------------------------------------------------------------ */

export const renderHome = () => `
<div class="screen">
  ${statusbar(false)}

  <div class="appbar">
    <img src="assets/unmute-logo-trimmed.png" alt="Unmute" class="wordmark">
    <span class="appbar-note"><b>Hallway 4</b>St. Mary's</span>
  </div>

  <div class="home-body">
    <div class="hero">
      <div class="kicker">Two-way · ASL ⇄ English</div>
      <h1 class="hero-title">The conversation, both ways.</h1>
      <p class="hero-sub">No interpreter on the ward — the patient signs, you speak, both are understood.</p>
      <div class="hero-people">
        <span class="pip pip--a"></span>
        <span class="pip pip--b"></span>
        <span class="pip pip--c">+9</span>
      </div>
    </div>

    <button class="cta" data-go="sign">
      ${ICONS.speech}
      Speak to patient
    </button>

    <div class="section-head">
      <span class="kicker">Recent</span>
      <span class="section-link">See all</span>
    </div>

    <div class="recent">
      <span class="thumb thumb--a"></span>
      <span class="recent-text">
        <span class="recent-title">Chest pain, two days</span>
        <span class="recent-meta">Signed reply · 2 min ago</span>
      </span>
      <span class="recent-tag">Live</span>
    </div>

    <div class="recent">
      <span class="thumb thumb--b"></span>
      <span class="recent-text">
        <span class="recent-title">Allergies</span>
        <span class="recent-meta">198 phrases in library</span>
      </span>
    </div>
  </div>

  ${tabbar("home")}
  ${homebar(false)}
</div>`;

/* ------------------------------------------------------------
   02 — SIGN
   Two modes, one screen.

   sign  — the patient is on camera; the caption is what they signed.
   speak — the patient is NOT shown. The translator signs the clinician's
           sentence, and the caption is the clinician's transcript.
           A repeat control sits at the top of the sheet.
   ------------------------------------------------------------ */

export const renderSign = (state = {}) => {
  const mode = state.mode || "sign";
  const entry = state.entry || {};
  const speaking = mode === "speak";

  const kicker = speaking
    ? `Clinician <b>speaking</b>`
    : `Patient <b>signed</b>`;

  const caption = state.caption || entry.text || "";

  return `
<div class="screen screen--media">
  ${statusbar(true)}

  <div class="stage" data-stage>
    ${mediaMarkup(entry.media || "media/patient-01.jpg", entry.text || "", state.poster || "")}
  </div>

  <div class="scrim" aria-hidden="true"></div>

  ${speaking ? "" : `
  <div class="track" aria-hidden="true">
    <i></i><i></i><i></i><i></i>
    <span class="track-chip">${state.confidence || 98}%</span>
  </div>`}

  <span class="demo-chip">Demo</span>

  <div class="sheet">
    <div class="sheet-head">
      <span class="sheet-kicker" data-kicker>${kicker}</span>
      ${speaking
        ? `<button class="repeat" data-repeat aria-label="Repeat the sign">
             ${ICONS.repeat}<span>Repeat</span>
           </button>`
        : ""}
    </div>

    <p class="caption" data-caption>${caption}</p>
    <p class="caption-note" data-note>${state.note || ""}</p>

    <div class="controls">
      <div class="dir${speaking ? "" : " is-on"}" data-dir="sign">
        <button class="dir-btn" data-mode="sign" aria-label="Patient signs">${ICONS.hand}</button>
        <span class="dir-label">Sign</span>
      </div>
      <div class="dir${speaking ? " is-on" : ""}" data-dir="speak">
        <button class="dir-btn" data-mode="speak" aria-label="Clinician speaks">${ICONS.speech}</button>
        <span class="dir-label">Speak</span>
      </div>
    </div>
  </div>

  ${tabbar("sign")}
  ${homebar(false)}
</div>`;
};

/* ------------------------------------------------------------
   03 — HISTORY
   ------------------------------------------------------------ */

const ENCOUNTERS = [
  {
    group: "Today",
    rows: [
      ["Chest pain, two days", "09:38", "4 min", "Live"],
      ["Allergies — penicillin", "09:12", "1 min", ""],
      ["Discharge instructions", "08:54", "6 min", ""],
    ],
  },
  {
    group: "Yesterday",
    rows: [
      ["Where does it hurt?", "17:20", "3 min", ""],
      ["Medication review", "14:05", "5 min", ""],
      ["Consent for procedure", "11:47", "8 min", "Flagged"],
    ],
  },
  {
    group: "Earlier this week",
    rows: [["Follow-up: dizziness", "Mon 16:30", "4 min", ""]],
  },
];

export const renderHistory = () => `
<div class="screen">
  ${statusbar(false)}

  <div class="page-head">
    <h1 class="page-title">History</h1>
    <p class="page-sub">Every conversation is kept on device. Nothing leaves without consent.</p>
  </div>

  <div class="list">
    ${ENCOUNTERS.map(
      (g) => `
      <div class="list-group">${g.group}</div>
      ${g.rows
        .map(
          ([title, time, dur, flag]) => `
        <div class="row">
          <span class="row-main">
            <span class="row-title">${title}</span>
            <span class="row-meta">${time}<i class="dot"></i>${dur}</span>
          </span>
          ${flag ? `<span class="row-flag${flag === "Live" ? " is-flag" : ""}">${flag}</span>` : ""}
        </div>`
        )
        .join("")}`
    ).join("")}
  </div>

  ${tabbar("history")}
  ${homebar(false)}
</div>`;

/* ------------------------------------------------------------
   04 — SETTINGS
   ------------------------------------------------------------ */

const toggle = (on) => `<span class="toggle${on ? " is-on" : ""}" data-toggle role="switch" aria-checked="${on}"></span>`;

export const renderSettings = () => `
<div class="screen">
  ${statusbar(false)}

  <div class="page-head">
    <h1 class="page-title">Settings</h1>
    <p class="page-sub">St. Mary's · Hallway 4</p>
  </div>

  <div class="settings">
    <div class="group" style="padding-top:0">
      <div class="group-label">Language</div>
      <div class="item">
        <span class="item-main">
          <span class="item-title">Sign language</span>
          <span class="item-note">ASL, United States</span>
        </span>
        <span class="item-value is-accent">Change</span>
      </div>
      <div class="item">
        <span class="item-main">
          <span class="item-title">Spoken language</span>
          <span class="item-note">English</span>
        </span>
        <span class="item-value is-accent">Change</span>
      </div>
    </div>

    <div class="group">
      <div class="group-label">Capture</div>
      <div class="item">
        <span class="item-main">
          <span class="item-title">Speak the reply aloud</span>
          <span class="item-note">Patient's signs are read out for the clinician</span>
        </span>
        ${toggle(true)}
      </div>
      <div class="item">
        <span class="item-main">
          <span class="item-title">Show confidence</span>
          <span class="item-note">Display the match score on screen</span>
        </span>
        ${toggle(true)}
      </div>
    </div>

    <div class="group">
      <div class="group-label">Accessibility</div>
      <div class="item">
        <span class="item-main">
          <span class="item-title">Larger text</span>
          <span class="item-note">Increases caption size</span>
        </span>
        ${toggle(false)}
      </div>
    </div>

    <div class="group">
      <div class="group-label">Data</div>
      <div class="item">
        <span class="item-main">
          <span class="item-title">Recording consent</span>
          <span class="item-note">Ask before any capture is stored</span>
        </span>
        ${toggle(true)}
      </div>
    </div>
  </div>

  ${tabbar("settings")}
  ${homebar(false)}
</div>`;

export const SCREENS = {
  home: renderHome,
  sign: renderSign,
  history: renderHistory,
  settings: renderSettings,
};

export const device = (inner) => `<div class="device">${inner}</div>`;
