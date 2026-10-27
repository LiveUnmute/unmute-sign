// The three screens, as markup. Shared by the launcher and the interactive page
// so the two can never drift apart.
//
// Content note: the supplied reference supplies layout only. Everything a person
// reads here is Unmute's own — a hospital conversation, not a social feed.

export const ICONS = {
  hand: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8.2 13.2V5.6a1.55 1.55 0 0 1 3.1 0V12"/>
    <path d="M11.3 12V4.5a1.55 1.55 0 0 1 3.1 0V12"/>
    <path d="M14.4 12V6.6a1.55 1.55 0 0 1 3.1 0V14.6"/>
    <path d="M8.2 13.2v-1.4a1.55 1.55 0 0 0-3.1 0v4.1a6.1 6.1 0 0 0 6.1 6.1h1.2a6.1 6.1 0 0 0 6.1-6.1v-2.1"/>
  </svg>`,

  mark: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8.2 13.2V5.6a1.55 1.55 0 0 1 3.1 0V12"/>
    <path d="M11.3 12V4.5a1.55 1.55 0 0 1 3.1 0V12"/>
    <path d="M14.4 12V6.6a1.55 1.55 0 0 1 3.1 0V14.6"/>
    <path d="M8.2 13.2v-1.4a1.55 1.55 0 0 0-3.1 0v4.1a6.1 6.1 0 0 0 6.1 6.1h1.2a6.1 6.1 0 0 0 6.1-6.1v-2.1"/>
  </svg>`,

  mic: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/>
  </svg>`,

  kebab: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg>`,

  home: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10.3 12 3.6l8.5 6.7V20a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-9.7Z"/><path d="M9.4 21v-6.6h5.2V21"/></svg>`,

  camera: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.8A2.3 2.3 0 0 1 5.3 6.5h1.4l1.2-2h8.2l1.2 2h1.4A2.3 2.3 0 0 1 21 8.8v9.4a2.3 2.3 0 0 1-2.3 2.3H5.3A2.3 2.3 0 0 1 3 18.2V8.8Z"/><circle cx="12" cy="13" r="3.6"/></svg>`,

  chat: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.7a8.2 8.2 0 0 1-8.9 8.1 9.4 9.4 0 0 1-2.6-.5L4 21l1.4-4.2A8.1 8.1 0 0 1 4 11.7 8.2 8.2 0 0 1 12.4 3.6h.5A8.2 8.2 0 0 1 21 11.7Z"/></svg>`,

  gear: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.1"/><path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7h-.3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5v-.3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.8 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.5 1Z"/></svg>`,

  back: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5 8 12l6.5 7"/></svg>`,

  bookmark: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4.5h12a1 1 0 0 1 1 1V21l-7-4.2L5 21V5.5a1 1 0 0 1 1-1Z"/></svg>`,

  copy: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.4"/><path d="M15 5.6A2.6 2.6 0 0 0 12.4 3H6.6A2.6 2.6 0 0 0 4 5.6v5.8A2.6 2.6 0 0 0 6.6 14"/></svg>`,

  share: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15.5V3.5"/><path d="M7.6 7.9 12 3.5l4.4 4.4"/><path d="M5 14v5.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V14"/></svg>`,

  edit: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.2 5.3 18.7 10.8"/><path d="M4 20.1 8.6 19 19.4 8.2a2.6 2.6 0 0 0-3.7-3.7L4.9 15.3 4 20.1Z"/></svg>`,

  play: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="margin-left:2px"><path d="M8 4.8c0-.9 1-1.5 1.8-1l9 6.4a1.7 1.7 0 0 1 0 2.8l-9 6.4c-.8.5-1.8-.1-1.8-1V4.8Z"/></svg>`,

  swap: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5h13"/><path d="M13.6 5.1 17 8.5l-3.4 3.4"/><path d="M20 15.5H7"/><path d="M10.4 12.1 7 15.5l3.4 3.4"/></svg>`,

  chev: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 9 12 15.5 18.5 9"/></svg>`,

  list: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h12"/><path d="M8 12h12"/><path d="M8 18h12"/><circle cx="4" cy="6" r="1.1" fill="currentColor"/><circle cx="4" cy="12" r="1.1" fill="currentColor"/><circle cx="4" cy="18" r="1.1" fill="currentColor"/></svg>`,

  flip: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5v17"/><path d="M8.6 6.6H6.2a2.2 2.2 0 0 0-2.2 2.2v6.4a2.2 2.2 0 0 0 2.2 2.2h2.4"/><path d="M15.4 6.6h2.4a2.2 2.2 0 0 1 2.2 2.2v6.4a2.2 2.2 0 0 1-2.2 2.2h-2.4"/></svg>`,
};

const SIG = `<svg width="15" height="10" viewBox="0 0 15 10" fill="currentColor"><rect x="0" y="6.2" width="2.5" height="3.8" rx="0.8"/><rect x="4.1" y="4.2" width="2.5" height="5.8" rx="0.8"/><rect x="8.2" y="2.1" width="2.5" height="7.9" rx="0.8"/><rect x="12.3" y="0" width="2.5" height="10" rx="0.8"/></svg>`;
const WIFI = `<svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor"><path d="M7 9.6 5 7.4a2.9 2.9 0 0 1 4 0L7 9.6Z"/><path d="M3.5 5.7a5.5 5.5 0 0 1 7 0l-1.4 1.5a3.5 3.5 0 0 0-4.2 0L3.5 5.7Z"/><path d="M1.1 3.2a8.9 8.9 0 0 1 11.8 0l-1.4 1.5a6.9 6.9 0 0 0-9 0L1.1 3.2Z"/></svg>`;
const BATT = `<svg width="22" height="11" viewBox="0 0 22 11" fill="none"><rect x="0.5" y="0.6" width="18" height="9.8" rx="3" stroke="currentColor" stroke-opacity=".34"/><rect x="2" y="2.1" width="14.6" height="6.8" rx="1.7" fill="currentColor"/><path d="M20.1 3.7v3.6c.85-.28 1.25-.9 1.25-1.8s-.4-1.52-1.25-1.8Z" fill="currentColor" fill-opacity=".34"/></svg>`;

const statusbar = (dark) => `
  <div class="statusbar${dark ? " is-on-dark" : ""}">
    <span>9:41</span>
    <span class="glyphs">${SIG}${WIFI}${BATT}</span>
  </div>`;

const homebar = (dark) =>
  `<div class="home-bar${dark ? " is-on-dark" : ""}"><span></span></div>`;

/* ------------------------------------------------------------
   01 — HOME
   ------------------------------------------------------------ */

export const renderHome = () => `
<div class="screen">
  ${statusbar(false)}
  <div class="topline">
    <div class="brand">
      <span class="mark">${ICONS.mark}</span>
      <span class="brand-name">Unmute</span>
    </div>
    <button class="iconbtn" aria-label="More">${ICONS.kebab}</button>
  </div>

  <div class="home-body">
    <div class="hero">
      <div class="hero-kicker">Two-way</div>
      <div class="hero-title">Sign with your patient</div>
      <div class="hero-sub">No interpreter. Both directions.</div>
      <div class="hero-people">
        <span class="pip pip--a"></span>
        <span class="pip pip--b"></span>
        <span class="pip pip--c">+9</span>
      </div>
    </div>

    <div class="stack">
      <button class="btn btn--primary" data-go="translate">${ICONS.hand} Translate sign</button>
      <button class="btn btn--ghost" data-go="chat">${ICONS.mic} Speak to patient</button>
    </div>

    <div class="section-head">
      <span class="section-title">Recent</span>
      <span class="section-link">See all</span>
    </div>

    <div class="recent">
      <span class="thumb thumb--a"></span>
      <span class="recent-text">
        <span class="recent-title">Chest pain, two days</span>
        <span class="recent-meta">Signed reply · 2 min ago</span>
      </span>
      <span class="recent-badge">Live</span>
    </div>

    <div class="recent">
      <span class="thumb thumb--b"></span>
      <span class="recent-text">
        <span class="recent-title">Allergies</span>
        <span class="recent-meta">Saved phrase · 198 in library</span>
      </span>
    </div>
  </div>

  <div class="tabbar">
    <span class="tab is-active">${ICONS.home}<i class="tab-dot"></i></span>
    <span class="tab">${ICONS.camera}<i class="tab-dot"></i></span>
    <span class="tab">${ICONS.chat}<i class="tab-dot"></i></span>
    <span class="tab">${ICONS.gear}<i class="tab-dot"></i></span>
  </div>
  ${homebar(false)}
</div>`;

/* ------------------------------------------------------------
   02 — TRANSLATE
   ------------------------------------------------------------ */

export const renderTranslate = (caption = "My chest hurts. It started two days ago.") => `
<div class="screen screen--stage">
  ${statusbar(true)}
  <div class="stage"></div>
  <div class="sweep"></div>

  <div class="track">
    <span class="track-chip" data-chip>98%</span>
  </div>

  <span class="demo-chip">Demo</span>

  <div class="stage-top">
    <button class="backbtn" data-go="home" aria-label="Back">${ICONS.back}</button>
  </div>

  <div class="sheet">
    <div class="sheet-head">
      <span class="sheet-label">Patient signed</span>
      <span class="sheet-actions">
        <button class="mini" aria-label="Save">${ICONS.bookmark}</button>
        <button class="mini" aria-label="Copy">${ICONS.copy}</button>
        <button class="mini" aria-label="Share">${ICONS.share}</button>
      </span>
    </div>
    <p class="caption" data-caption>${caption}</p>
    <div class="shutter-row">
      <button class="round-ghost" aria-label="Phrase library">${ICONS.list}</button>
      <button class="shutter" data-shutter aria-label="Capture sign">${ICONS.hand}</button>
      <button class="round-ghost" aria-label="Flip camera">${ICONS.flip}</button>
    </div>
  </div>
  ${homebar(false)}
</div>`;

/* ------------------------------------------------------------
   03 — CONVERSATION
   ------------------------------------------------------------ */

export const renderChat = () => `
<div class="screen">
  ${statusbar(false)}
  <div class="topbar">
    <button class="backbtn backbtn--soft" data-go="home" aria-label="Back">${ICONS.back}</button>
    <div class="lang-row">
      <span class="lang"><span>Sign</span>${ICONS.chev}</span>
      <button class="swap" data-swap aria-label="Swap direction">${ICONS.swap}</button>
      <span class="lang"><span>English</span>${ICONS.chev}</span>
    </div>
  </div>

  <div class="chat-body" data-thread>
    <div class="bubble">
      <p>My chest hurts, and I get dizzy when I stand. It started two days ago.</p>
      <div class="bubble-foot">
        <span class="bubble-meta">Signed</span>
        <button class="mini" style="width:23px;height:23px" aria-label="Speak">${ICONS.mic}</button>
        <button class="mini" style="width:23px;height:23px" aria-label="Copy">${ICONS.copy}</button>
        <button class="mini" style="width:23px;height:23px" aria-label="Edit">${ICONS.edit}</button>
      </div>
    </div>

    <div class="bubble bubble--right">
      <p>Where does it hurt, and when did it start?</p>
      <div class="bubble-foot"><span class="bubble-meta bubble-meta--right">Spoken</span></div>
    </div>

    <div class="tile" data-tile>
      <div class="tile-media"></div>
      <span class="tile-tag">Signed reply</span>
      <button class="tile-play" data-play aria-label="Play signed reply">${ICONS.play}</button>
      <div class="tile-progress"><i></i></div>
    </div>
  </div>

  <div class="mic-dock">
    <button class="mic" data-mic aria-label="Hold to speak">${ICONS.mic}</button>
    <span class="mic-hint" data-mic-hint>Hold to speak</span>
  </div>
  ${homebar(false)}
</div>`;

export const SCREENS = { home: renderHome, translate: renderTranslate, chat: renderChat };

export const device = (inner, extraClass = "") =>
  `<div class="device ${extraClass}">${inner}</div>`;
