// Encode un ID utilisateur dans un texte avec des caractères Unicode invisibles
// Zero-width space (U+200B) = 0, Zero-width non-joiner (U+200C) = 1

const ZERO = '\u200B' // bit 0
const ONE = '\u200C' // bit 1
const SEPARATOR = '\u200D' // séparateur de watermark

export function encodeWatermark(userId: string): string {
  // Prend les 8 premiers caractères de l'userId (suffisant pour identifier)
  const shortId = userId.slice(0, 8)
  let binary = ''
  for (const char of shortId) {
    binary += char.charCodeAt(0).toString(2).padStart(8, '0')
  }
  return SEPARATOR + binary.split('').map((b) => (b === '0' ? ZERO : ONE)).join('') + SEPARATOR
}

export function applyWatermark(text: string, userId: string): string {
  if (text.length < 5) return text // trop court pour watermarker
  const watermark = encodeWatermark(userId)
  // Insère le watermark au milieu du texte
  const mid = Math.floor(text.length / 2)
  return text.slice(0, mid) + watermark + text.slice(mid)
}

export function decodeWatermark(text: string): string | null {
  const sepIndex1 = text.indexOf(SEPARATOR)
  if (sepIndex1 === -1) return null
  const sepIndex2 = text.indexOf(SEPARATOR, sepIndex1 + 1)
  if (sepIndex2 === -1) return null

  const binaryChars = text.slice(sepIndex1 + 1, sepIndex2)
  let binary = ''
  for (const char of binaryChars) {
    if (char === ZERO) binary += '0'
    else if (char === ONE) binary += '1'
  }

  let result = ''
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.slice(i, i + 8)
    if (byte.length === 8) {
      result += String.fromCharCode(parseInt(byte, 2))
    }
  }
  return result
}
