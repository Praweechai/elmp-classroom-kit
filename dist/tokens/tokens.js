"use strict";

// ELMP tokens v1 (Plan 1 doc 04, elmp-tokens.css) + Classroom roles (Plan 3 doc 04 §2).
// Single source of truth: `npm run tokens` writes tokens.css, _tokens.scss and the Paragon theme from this file.

const palette = {
  green: {
    25: '#F6FBF8',
    50: '#EEF7F1',
    100: '#D7EDDF',
    200: '#B0DABF',
    300: '#7FC29A',
    400: '#45A36F',
    500: '#16844A',
    600: '#03692A',
    700: '#025622',
    800: '#02441C',
    900: '#013314'
  },
  gold: {
    50: '#FBF5E6',
    100: '#F5E7C2',
    300: '#DDB866',
    500: '#BE8E28',
    700: '#8A6418',
    800: '#6E4F12'
  },
  gray: {
    25: '#FAFBFA',
    50: '#F4F6F5',
    100: '#EDF0EE',
    200: '#E0E5E2',
    300: '#C8D0CB',
    400: '#9AA49E',
    450: '#7D8781',
    500: '#67716B',
    600: '#4B5550',
    700: '#37403B',
    800: '#232A26',
    900: '#141916'
  }
};
const {
  green,
  gold,
  gray
} = palette;
const color = {
  bg: '#F6F8F7',
  surface: '#FFFFFF',
  sunken: gray[50],
  border: gray[200],
  borderStrong: gray[300],
  borderInput: gray[450],
  text: gray[900],
  text2: gray[600],
  text3: gray[500],
  action: green[600],
  actionHover: green[700],
  actionPress: green[800],
  actionTint: green[50],
  actionTintBorder: green[100],
  gold: gold[500],
  goldText: gold[700],
  goldTint: gold[50],
  goldBorder: gold[100],
  okText: green[700],
  okBg: green[50],
  soonText: '#B54708',
  soonBg: '#FFFAEB',
  soonEdge: '#FEDF89',
  lateText: '#B42318',
  lateBg: '#FEF3F2',
  lateEdge: '#D92D20',
  lateBorder: '#FECDCA',
  doneText: gray[700],
  doneBg: gray[100],
  infoText: '#175CD3',
  infoTextStrong: '#1849A9',
  infoBg: '#EFF8FF',
  infoEdge: '#B2DDFF',
  ink: '#0F1F17',
  scrim: 'rgba(20, 25, 22, .38)',
  // Plan 4 data visuals (doc 04-design §2): ring/gauge track and fills. Values are always shown as text too (NFR-D3).
  ringTrack: '#E6ECE8',
  ring1: green[600],
  // progress
  ring2: '#2E90FA',
  // learning activity
  ring3: '#B38523',
  // achievement (gold 500 is 2.96:1 on white, a touch darker reaches 3.3:1)
  ring4: '#7A5AF8',
  // quizzes
  ring5: '#EE46BC',
  // time
  ringLate: '#D92D20',
  // overdue required training
  violetTint: '#F4F3FF',
  violetText: '#5925DC',
  pinkTint: '#FDF2FA',
  pinkText: '#C11574',
  // Plan 5 (kit 2.0): green HR banner (CA-14) and the urgent variant.
  banner: green[700],
  bannerText: '#FFFFFF',
  bannerUrgent: '#B42318',
  // Learner v2 (kit 2.1, D-92): one colour per status —
  // To do violet · In progress blue · Completed green · Overdue red.
  // `st*` = bars, icons, strips (3:1 graphics); `st*Text` on `st*Tint` = pill text (4.5:1). Dark values: motion.css.
  stTodo: '#7C5CDB',
  stTodoTint: '#F3EFFD',
  stTodoText: '#5B3FB8',
  stProg: '#2E6FD8',
  stProgTint: '#EAF2FE',
  stProgText: '#1D4FA8',
  stDone: '#16844A',
  stDoneTint: '#E8F5EE',
  stDoneText: '#03692A',
  stOver: '#D92D20',
  stOverTint: '#FEECEA',
  stOverText: '#B42318'
};

// Generated course covers by category (doc 04 §2.1).
const covers = {
  clinical: ['#025622', '#16844A'],
  safety: ['#0B4F6C', '#2E90FA'],
  compliance: ['#43209F', '#7A5AF8'],
  soft: ['#8A6418', '#DDB866'],
  general: ['#37403B', '#7D8781']
};
const font = {
  sans: '"Inter", "IBM Plex Sans Thai", system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Thai", sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, "Cascadia Mono", Consolas, monospace'
};
const radius = {
  xs: '6px',
  sm: '8px',
  button: '10px',
  card: '12px',
  group: '14px',
  panel: '16px',
  pill: '999px',
  md: '12px',
  lg: '16px'
};
const shadow = {
  xs: '0 1px 2px rgba(20, 25, 22, .06)',
  md: '0 6px 16px -4px rgba(20, 25, 22, .10), 0 2px 4px -2px rgba(20, 25, 22, .05)',
  lg: '0 14px 28px -8px rgba(20, 25, 22, .14), 0 4px 8px -4px rgba(20, 25, 22, .06)',
  xl: '0 28px 56px -16px rgba(20, 25, 22, .22)',
  ring: `0 0 0 3px #FFFFFF, 0 0 0 5px ${green[600]}`,
  1: '0 1px 2px rgb(16 24 20 / .06), 0 1px 3px rgb(16 24 20 / .04)',
  // Plan 4 cards
  2: '0 12px 32px rgb(16 24 20 / .12)' // Plan 4 menus, modal
};
const motion = {
  fast: '150ms',
  base: '200ms',
  moderate: '280ms',
  slow: '400ms',
  deliberate: '800ms',
  easeStandard: 'cubic-bezier(.2, 0, 0, 1)',
  easeEnter: 'cubic-bezier(.05, .7, .1, 1)',
  easeExit: 'cubic-bezier(.3, 0, .8, .15)',
  easeSpring: 'cubic-bezier(.34, 1.56, .64, 1)',
  easeOut: 'cubic-bezier(.2, .8, .2, 1)' // kit 2.1 motion layer: entrances, bars, rings
};
const size = {
  header: '64px',
  playerBar: '56px',
  bottomBar: '64px',
  drawer: '320px',
  tap: '44px',
  homeMax: '1200px',
  courseMax: '1120px',
  measure: '880px',
  sidebar: '248px',
  // Plan 4 shell (F-115)
  sidebarCollapsed: '72px',
  dashMax: '1200px',
  tree: '320px',
  // Plan 4 player (F-116)
  rail: '40px',
  topbar: '60px',
  // Plan 5 thin top bar (Shell 3)
  pageMax: '1600px' // P5-6: wide screens (owner works at 1920 px); page is centred
};

// Text/background pairs that must reach WCAG AA (doc 04 §10, checked by tokens.test.js).
const contrastPairs = [['text', 'surface', 4.5], ['text2', 'surface', 4.5], ['text3', 'surface', 4.5], ['text3', 'bg', 4.5], ['action', 'surface', 4.5], ['action', 'actionTint', 4.5], ['okText', 'okBg', 4.5], ['soonText', 'soonBg', 4.5], ['lateText', 'lateBg', 4.5], ['doneText', 'doneBg', 4.5], ['infoTextStrong', 'infoBg', 4.5], ['goldText', 'goldTint', 4.5], ['goldText', 'surface', 4.5], ['surface', 'action', 4.5], ['borderInput', 'surface', 3], ['violetText', 'violetTint', 4.5], ['pinkText', 'pinkTint', 4.5], ['infoText', 'infoBg', 4.5],
// Plan 4: ring fills are graphics next to their text value (WCAG 1.4.11 → 3:1 on white)
['bannerText', 'banner', 4.5], ['bannerText', 'bannerUrgent', 4.5], ['ring1', 'surface', 3], ['ring3', 'surface', 3], ['ring4', 'surface', 3], ['ringLate', 'surface', 3],
// kit 2.1 status colours (D-92)
['stTodoText', 'stTodoTint', 4.5], ['stProgText', 'stProgTint', 4.5], ['stDoneText', 'stDoneTint', 4.5], ['stOverText', 'stOverTint', 4.5], ['stTodoText', 'surface', 4.5], ['stProgText', 'surface', 4.5], ['stDoneText', 'surface', 4.5], ['stOverText', 'surface', 4.5], ['stTodo', 'surface', 3], ['stProg', 'surface', 3], ['stDone', 'surface', 3], ['stOver', 'surface', 3]];
module.exports = {
  palette,
  color,
  covers,
  font,
  radius,
  shadow,
  motion,
  size,
  contrastPairs
};