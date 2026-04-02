export interface TranslationEngine {
  translate(texts: string[], from: string, to: string): Promise<string[]>
}

export class StubTranslator implements TranslationEngine {
  async translate(texts: string[]): Promise<string[]> {
    return texts.map((t) => `[FR] ${t}`)
  }
}
