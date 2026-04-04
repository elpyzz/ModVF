export function addMicroVariations(text: string, userId: string): string {
  if (text.length < 10) return text

  // Utilise le userId comme seed pour des variations déterministes
  const seed = (userId.charCodeAt(0) || 0) + (userId.charCodeAt(1) || 0)

  // Variations subtiles : ponctuation / espaces (affichage normal dans Minecraft)
  const variations: Record<string, string> = {
    '...': seed % 2 === 0 ? '…' : '...', // points de suspension vs caractère unicode
    ' !': seed % 3 === 0 ? '\u00A0!' : ' !', // espace normal vs insécable avant !
    ' ?': seed % 3 === 1 ? '\u00A0?' : ' ?', // pareil pour ?
    "'": seed % 2 === 0 ? '\u2019' : "'", // apostrophe droite vs courbe
  }

  let result = text
  for (const [from, to] of Object.entries(variations)) {
    result = result.replace(from, to)
  }

  return result
}
