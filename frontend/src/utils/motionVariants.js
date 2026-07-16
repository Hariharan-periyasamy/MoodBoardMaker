/**
 * Centralized Framer Motion Variants
 * Premium animation system for MoodBoard — Notion / Figma / Pinterest quality.
 * GPU-accelerated, respects prefers-reduced-motion via Framer's global setting.
 */

// ─── Page / Route Transitions ───────────────────────────────────────────────
export const pageVariants = {
  initial: { opacity: 0, y: 22, scale: 0.99 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0, y: -10, scale: 0.99,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
};

// ─── Auth Card ───────────────────────────────────────────────────────────────
export const authCardVariants = {
  initial: { opacity: 0, y: 32, scale: 0.96 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 24, delay: 0.1 },
  },
};

// ─── Stagger Container ───────────────────────────────────────────────────────
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const staggerContainerFast = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

// ─── Stagger Children ────────────────────────────────────────────────────────
export const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 26 },
  },
};

export const fadeInItem = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1, scale: 1,
    transition: { type: 'spring', stiffness: 360, damping: 28 },
  },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1, x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 26 },
  },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1, x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 26 },
  },
};

// ─── Tile / Card ─────────────────────────────────────────────────────────────
export const tileVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 16 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 26 },
  },
  exit: {
    opacity: 0, scale: 0.84, y: -8,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

// ─── Dropdown / Menu ─────────────────────────────────────────────────────────
export const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.94, y: -6 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 420, damping: 28 },
  },
  exit: {
    opacity: 0, scale: 0.94, y: -6,
    transition: { duration: 0.15 },
  },
};

// ─── Search Results ───────────────────────────────────────────────────────────
export const searchDropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
  exit: {
    opacity: 0, y: -8, scale: 0.97,
    transition: { duration: 0.15 },
  },
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export const sidebarNavItem = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1, x: 0,
    transition: { type: 'spring', stiffness: 340, damping: 28 },
  },
};

// ─── Timeline Activity ────────────────────────────────────────────────────────
export const timelineItem = {
  hidden: { opacity: 0, x: -20, scale: 0.97 },
  visible: {
    opacity: 1, x: 0, scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
};

// ─── Floating / Pulse ─────────────────────────────────────────────────────────
export const floatAnimation = {
  y: [0, -12, 0],
  transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
};

export const pulseAnimation = {
  scale: [1, 1.06, 1],
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
};

// ─── Notification / Toast ─────────────────────────────────────────────────────
export const toastVariants = {
  hidden: { opacity: 0, x: 80, scale: 0.9 },
  visible: {
    opacity: 1, x: 0, scale: 1,
    transition: { type: 'spring', stiffness: 420, damping: 32 },
  },
  exit: {
    opacity: 0, x: 80, scale: 0.9,
    transition: { duration: 0.2 },
  },
};

// ─── Counter ──────────────────────────────────────────────────────────────────
export const counterVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 24 },
  },
};
