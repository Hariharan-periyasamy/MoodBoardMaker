const { Vibrant } = require('node-vibrant/node');
const https = require('https');
const http = require('http');

const fetchImageBuffer = (url) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch image status: ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
};

const hexToHsl = (hex) => {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToHex = (h, s, l) => {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  const toHex = x => {
    const hexStr = Math.round(x * 255).toString(16);
    return hexStr.length === 1 ? '0' + hexStr : hexStr;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Dynamically extract a premium 6-color palette from local path or remote URL.
 */
const extractColorPalette = async (imageUrl) => {
  try {
    let palette;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const buffer = await fetchImageBuffer(imageUrl);
      palette = await Vibrant.from(buffer).getPalette();
    } else {
      palette = await Vibrant.from(imageUrl).getPalette();
    }

    const sortedSwatches = Object.values(palette)
      .filter(Boolean)
      .sort((a, b) => b.population - a.population);

    let colors = sortedSwatches.map(swatch => swatch.hex.toUpperCase());
    colors = [...new Set(colors)];

    if (colors.length > 0 && colors.length < 6) {
      const baseColor = colors[0];
      const hsl = hexToHsl(baseColor);
      const theoreticalHarmonies = [
        { h: hsl.h, s: hsl.s, l: Math.min(90, Math.max(10, hsl.l + 15)) },
        { h: hsl.h, s: hsl.s, l: Math.min(90, Math.max(10, hsl.l - 15)) },
        { h: (hsl.h + 25) % 360, s: Math.min(100, hsl.s + 10), l: hsl.l },
        { h: (hsl.h - 25 + 360) % 360, s: Math.min(100, hsl.s + 10), l: hsl.l },
        { h: hsl.h, s: Math.max(10, hsl.s - 25), l: hsl.l }
      ];

      for (const variant of theoreticalHarmonies) {
        if (colors.length >= 6) break;
        const generatedHex = hslToHex(variant.h, variant.s, variant.l).toUpperCase();
        if (!colors.includes(generatedHex)) {
          colors.push(generatedHex);
        }
      }
    }

    return colors.slice(0, 6);
  } catch (err) {
    console.error('extractColorPalette helper error:', err.message);
    return [];
  }
};

module.exports = {
  extractColorPalette,
  hexToHsl,
  hslToHex
};
