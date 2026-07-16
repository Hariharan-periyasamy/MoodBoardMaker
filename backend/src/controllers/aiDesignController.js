const { extractColorPalette, hexToHsl, hslToHex } = require('../utils/paletteHelper');
const Tile = require('../models/Tile');
const Board = require('../models/Board');
const { sendSuccess, sendError } = require('../utils/responseUtils');

// Known color names mapped to their HEX ranges for labeling
const COLOR_NAMES = [
  { name: 'Red', h: [0, 15] },
  { name: 'Orange', h: [15, 45] },
  { name: 'Yellow', h: [45, 65] },
  { name: 'Lime', h: [65, 80] },
  { name: 'Green', h: [80, 160] },
  { name: 'Teal', h: [160, 195] },
  { name: 'Cyan', h: [195, 210] },
  { name: 'Sky', h: [210, 230] },
  { name: 'Blue', h: [230, 250] },
  { name: 'Indigo', h: [250, 265] },
  { name: 'Violet', h: [265, 285] },
  { name: 'Purple', h: [285, 310] },
  { name: 'Pink', h: [310, 345] },
  { name: 'Rose', h: [345, 360] },
];

const THEME_PALETTES = {
  Nature:     { colors: ['#2D6A4F', '#40916C', '#74C69D', '#B7E4C7', '#D8F3DC'], emoji: '🌿' },
  Ocean:      { colors: ['#03045E', '#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8'], emoji: '🌊' },
  Minimal:    { colors: ['#F8F9FA', '#E9ECEF', '#DEE2E6', '#6C757D', '#212529'], emoji: '⬜' },
  'Dark Mode':{ colors: ['#0D0D0D', '#1A1A2E', '#16213E', '#0F3460', '#533483'], emoji: '🌑' },
  Vintage:    { colors: ['#D4A574', '#C9856E', '#A0522D', '#8B4513', '#654321'], emoji: '🍂' },
  Pastel:     { colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'], emoji: '🌸' },
  Neon:       { colors: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF6B6B', '#39FF14'], emoji: '⚡' },
  Cyberpunk:  { colors: ['#0D0221', '#740D8F', '#D600AA', '#FF2975', '#F6019D'], emoji: '🤖' },
  Autumn:     { colors: ['#7B2D00', '#C0392B', '#E67E22', '#F39C12', '#F1C40F'], emoji: '🍁' },
  Sunset:     { colors: ['#FF6B6B', '#FE8F5E', '#FEA657', '#FECC5C', '#FFFFA0'], emoji: '🌅' },
};

/**
 * Get friendly color name from HEX
 */
function getColorName(hex) {
  try {
    const { h, s, l } = hexToHsl(hex);
    if (s < 12) {
      if (l < 20) return 'Charcoal';
      if (l < 50) return 'Gray';
      if (l < 75) return 'Silver';
      return 'White';
    }
    const match = COLOR_NAMES.find(({ h: [min, max] }) => h >= min && h < max);
    const baseName = match?.name || 'Color';
    if (l > 75) return `Light ${baseName}`;
    if (l < 30) return `Dark ${baseName}`;
    return baseName;
  } catch {
    return 'Color';
  }
}

/**
 * Calculate contrast ratio between foreground and background (WCAG)
 */
function getRelativeLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastRatio(hex1, hex2) {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getTextColor(bgHex) {
  const contrastWithWhite = getContrastRatio(bgHex, '#FFFFFF');
  const contrastWithBlack = getContrastRatio(bgHex, '#000000');
  return contrastWithWhite >= contrastWithBlack ? '#FFFFFF' : '#000000';
}

function getContrastInfo(bgHex) {
  const textColor = getTextColor(bgHex);
  const ratio = getContrastRatio(bgHex, textColor);
  return {
    textColor,
    contrastRatio: Math.round(ratio * 100) / 100,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7,
    label: ratio >= 7 ? 'Excellent' : ratio >= 4.5 ? 'Good' : ratio >= 3 ? 'Fair' : 'Poor',
  };
}

/**
 * Generate color harmony from a base hex
 */
function generateHarmonies(baseHex) {
  const hsl = hexToHsl(baseHex);
  const { h, s, l } = hsl;

  return {
    complementary: {
      name: 'Complementary',
      description: 'Opposite hue creates strong, vibrant contrast',
      colors: [
        baseHex,
        hslToHex((h + 180) % 360, s, l),
      ],
    },
    analogous: {
      name: 'Analogous',
      description: 'Adjacent hues create a calm, harmonious feel',
      colors: [
        hslToHex((h - 30 + 360) % 360, s, l),
        baseHex,
        hslToHex((h + 30) % 360, s, l),
      ],
    },
    triadic: {
      name: 'Triadic',
      description: 'Three evenly spaced hues for a balanced, dynamic look',
      colors: [
        baseHex,
        hslToHex((h + 120) % 360, s, l),
        hslToHex((h + 240) % 360, s, l),
      ],
    },
    monochromatic: {
      name: 'Monochromatic',
      description: 'Same hue at different lightness for a refined, cohesive look',
      colors: [
        hslToHex(h, s, Math.max(10, l - 30)),
        hslToHex(h, s, Math.max(10, l - 15)),
        baseHex,
        hslToHex(h, s, Math.min(90, l + 15)),
        hslToHex(h, s, Math.min(90, l + 30)),
      ],
    },
    splitComplementary: {
      name: 'Split Complementary',
      description: 'Complement split into two adjacent hues for rich contrast',
      colors: [
        baseHex,
        hslToHex((h + 150) % 360, s, l),
        hslToHex((h + 210) % 360, s, l),
      ],
    },
  };
}

/**
 * Recommend role-based colors from a palette
 */
function recommendFromPalette(colors, boardColors = []) {
  if (colors.length === 0) return null;

  // Sort by saturation (most vivid first) for primary
  const withHsl = colors.map((hex) => ({ hex, ...hexToHsl(hex) }));
  const sorted = [...withHsl].sort((a, b) => b.s - a.s);

  const primary = sorted[0];
  const secondary = sorted[1] || sorted[0];
  const accent = withHsl.find((c) => c.l > 55 && c.s > 40) || sorted[sorted.length - 1];
  const background = withHsl.find((c) => c.l > 80) || { hex: hslToHex(primary.h, 10, 96) };
  const text = { hex: getTextColor(background.hex) };

  const makeRole = (swatch, role, reason) => ({
    role,
    hex: swatch.hex.toUpperCase(),
    name: getColorName(swatch.hex),
    reason,
    ...getContrastInfo(swatch.hex),
  });

  // Generate reasons based on board context
  const boardContext = boardColors.length > 0
    ? `Harmonizes with your board's existing ${getColorName(boardColors[0])} palette.`
    : 'Extracted from your uploaded image.';

  return [
    makeRole(primary, 'Primary', `Most vibrant tone from your image. ${boardContext}`),
    makeRole(secondary, 'Secondary', 'Supports the primary while adding visual depth.'),
    makeRole(accent, 'Accent', 'Creates warm contrast with your dominant palette.'),
    makeRole(background, 'Background', 'Light, neutral tone that keeps your content readable.'),
    makeRole(text, 'Text', `Ensures WCAG-compliant readability on your tile background.`),
  ];
}

/**
 * Match themes to board tags
 */
function matchThemesToBoard(tiles) {
  const allTags = tiles.flatMap((t) => t.tags || []).map((t) => t.toLowerCase());
  const allCaptions = tiles.map((t) => (t.caption || '').toLowerCase()).join(' ');
  const content = [...allTags, allCaptions].join(' ');

  const scores = {
    Nature: ['nature', 'plant', 'forest', 'green', 'garden', 'tree', 'leaf'],
    Ocean: ['ocean', 'sea', 'water', 'blue', 'wave', 'beach', 'marine'],
    Minimal: ['minimal', 'clean', 'simple', 'white', 'modern', 'flat'],
    'Dark Mode': ['dark', 'night', 'space', 'black', 'galaxy'],
    Vintage: ['vintage', 'retro', 'old', 'classic', 'antique', 'brown'],
    Pastel: ['pastel', 'soft', 'gentle', 'baby', 'pink', 'light'],
    Neon: ['neon', 'bright', 'electric', 'glow', 'vivid', 'pop'],
    Cyberpunk: ['cyberpunk', 'cyber', 'tech', 'future', 'robot', 'sci-fi'],
    Autumn: ['autumn', 'fall', 'harvest', 'orange', 'warm', 'cozy'],
    Sunset: ['sunset', 'sunrise', 'sky', 'dusk', 'golden', 'warm'],
  };

  return Object.entries(scores)
    .map(([theme, keywords]) => ({
      theme,
      emoji: THEME_PALETTES[theme].emoji,
      colors: THEME_PALETTES[theme].colors,
      score: keywords.filter((k) => content.includes(k)).length,
      description: `${THEME_PALETTES[theme].emoji} A ${theme.toLowerCase()} palette inspired by your board content.`,
    }))
    .sort((a, b) => b.score - a.score)
    .map((t, i) => ({
      ...t,
      recommended: i < 3,
      accessibility: t.colors.map((hex) => ({ hex, ...getContrastInfo(hex) })),
    }));
}

// @desc    Get AI design recommendations for a board
// @route   GET /api/ai-design/:boardId
// @access  Private
const getBoardRecommendations = async (req, res, next) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findOne({
      _id: boardId,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id },
      ],
    });
    if (!board) return sendError(res, 'Board not found or access denied', 403);

    const tiles = await Tile.find({ boardId }).lean();

    // Gather all board colors (deduplicated)
    const boardColors = [...new Set(
      tiles.flatMap((t) => [
        t.themeColor,
        ...(t.colorPalette || []),
      ]).filter(Boolean)
    )];

    // Extract dominant color from board palette
    const dominantColor = boardColors[0] || '#7C3AED';

    // Generate recommendations
    const harmonies = generateHarmonies(dominantColor);
    const themeMatches = matchThemesToBoard(tiles);
    const roleColors = recommendFromPalette(
      boardColors.slice(0, 6),
      boardColors
    );

    // Tile style recommendations
    const { h, s, l } = hexToHsl(dominantColor);
    const tileStyles = {
      tileBackground: { hex: hslToHex(h, s * 0.1, 97), name: 'Background', role: 'Tile Background' },
      borderColor: { hex: hslToHex(h, s * 0.4, 80), name: getColorName(hslToHex(h, s * 0.4, 80)), role: 'Border' },
      shadowColor: { hex: hslToHex(h, s * 0.6, 40), name: getColorName(hslToHex(h, s * 0.6, 40)), role: 'Shadow' },
      hoverColor: { hex: hslToHex(h, s * 0.15, 94), name: 'Hover Background', role: 'Hover' },
      buttonColor: { hex: dominantColor, name: getColorName(dominantColor), role: 'Button' },
      captionColor: { hex: hslToHex(h, s * 0.3, 15), name: 'Caption Text', role: 'Caption' },
      tagColor: { hex: hslToHex(h, s * 0.5, 90), name: 'Tag Background', role: 'Tag' },
    };

    return sendSuccess(res, {
      boardId,
      boardTitle: board.title,
      totalTiles: tiles.length,
      boardColors: boardColors.slice(0, 12),
      dominantColor,
      roleColors,
      harmonies,
      themes: themeMatches,
      tileStyles,
      generatedAt: new Date().toISOString(),
    }, 'Design recommendations generated');
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze a single image URL for color extraction
// @route   POST /api/ai-design/analyze-image
// @access  Private
const analyzeImage = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return sendError(res, 'imageUrl is required', 400);

    const colors = await extractColorPalette(imageUrl);
    if (colors.length === 0) return sendError(res, 'Could not extract colors from this image', 422);

    const analyzed = colors.map((hex) => ({
      hex: hex.toUpperCase(),
      name: getColorName(hex),
      ...getContrastInfo(hex),
    }));

    const recommended = colors[0];
    const harmonies = generateHarmonies(recommended);
    const roleColors = recommendFromPalette(colors, []);

    return sendSuccess(res, {
      extractedColors: analyzed,
      recommended: {
        hex: recommended.toUpperCase(),
        name: getColorName(recommended),
        reason: 'Most dominant color from your image by pixel weight.',
        ...getContrastInfo(recommended),
      },
      roleColors,
      harmonies,
    }, 'Image analysis complete');
  } catch (error) {
    next(error);
  }
};

module.exports = { getBoardRecommendations, analyzeImage };
