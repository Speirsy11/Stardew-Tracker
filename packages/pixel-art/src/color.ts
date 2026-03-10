import type { RGB, LAB } from './types'

/**
 * Convert sRGB [0-255] to linear RGB [0-1].
 */
function srgbToLinear(c: number): number {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

/**
 * Convert linear RGB [0-1] to sRGB [0-255].
 */
function linearToSrgb(c: number): number {
  const s = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
  return Math.round(Math.max(0, Math.min(255, s * 255)))
}

/**
 * Convert RGB to CIELAB using D65 illuminant.
 */
export function rgbToLab(rgb: RGB): LAB {
  // sRGB → linear
  const r = srgbToLinear(rgb.r)
  const g = srgbToLinear(rgb.g)
  const b = srgbToLinear(rgb.b)

  // Linear RGB → XYZ (D65)
  let x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375
  let y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750
  let z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041

  // Normalize to D65 white point
  x /= 0.95047
  y /= 1.00000
  z /= 1.08883

  // XYZ → Lab
  const epsilon = 0.008856
  const kappa = 903.3

  const fx = x > epsilon ? Math.cbrt(x) : (kappa * x + 16) / 116
  const fy = y > epsilon ? Math.cbrt(y) : (kappa * y + 16) / 116
  const fz = z > epsilon ? Math.cbrt(z) : (kappa * z + 16) / 116

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  }
}

/**
 * Convert CIELAB to RGB.
 */
export function labToRgb(lab: LAB): RGB {
  // Lab → XYZ
  const fy = (lab.l + 16) / 116
  const fx = lab.a / 500 + fy
  const fz = fy - lab.b / 200

  const epsilon = 0.008856
  const kappa = 903.3

  const x = (Math.pow(fx, 3) > epsilon ? Math.pow(fx, 3) : (116 * fx - 16) / kappa) * 0.95047
  const y = (lab.l > kappa * epsilon ? Math.pow(fy, 3) : lab.l / kappa) * 1.00000
  const z = (Math.pow(fz, 3) > epsilon ? Math.pow(fz, 3) : (116 * fz - 16) / kappa) * 1.08883

  // XYZ → linear RGB
  const lr = x * 3.2404542 + y * -1.5371385 + z * -0.4985314
  const lg = x * -0.9692660 + y * 1.8760108 + z * 0.0415560
  const lb = x * 0.0556434 + y * -0.2040259 + z * 1.0572252

  return {
    r: linearToSrgb(lr),
    g: linearToSrgb(lg),
    b: linearToSrgb(lb),
  }
}

/**
 * CIE76 Delta-E: perceptual color difference in CIELAB space.
 */
export function deltaE(lab1: LAB, lab2: LAB): number {
  const dl = lab1.l - lab2.l
  const da = lab1.a - lab2.a
  const db = lab1.b - lab2.b
  return Math.sqrt(dl * dl + da * da + db * db)
}

/**
 * Find the index of the closest palette color using Delta-E in CIELAB space.
 */
export function findClosestPaletteIndex(pixelLab: LAB, paletteLabs: LAB[]): number {
  let bestIndex = 0
  let bestDist = Infinity
  for (let i = 0; i < paletteLabs.length; i++) {
    const dist = deltaE(pixelLab, paletteLabs[i])
    if (dist < bestDist) {
      bestDist = dist
      bestIndex = i
    }
  }
  return bestIndex
}

/**
 * Convert RGB to hex string.
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (c: number) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

/**
 * Clamp a LAB value to reasonable ranges.
 */
export function clampLab(lab: LAB): LAB {
  return {
    l: Math.max(0, Math.min(100, lab.l)),
    a: Math.max(-128, Math.min(127, lab.a)),
    b: Math.max(-128, Math.min(127, lab.b)),
  }
}
