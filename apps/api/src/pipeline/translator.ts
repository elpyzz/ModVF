import translate from 'google-translate-api-x';

export interface TranslationEngine {
  translate(texts: string[], from: string, to: string): Promise<string[]>;
}

export class GoogleTranslateEngine implements TranslationEngine {
  async translate(texts: string[], from: string, to: string): Promise<string[]> {
    const results: string[] = new Array(texts.length);
    const batchSize = 200;

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(texts.length / batchSize);
      console.log("[TRANSLATE] Batch " + batchNum + "/" + totalBatches + " (" + batch.length + " strings)");

      try {
        const res = await translate(batch, { from, to });
        const translated = Array.isArray(res) ? res.map((r: any) => r.text) : [(res as any).text];
        for (let j = 0; j < translated.length; j++) {
          results[i + j] = translated[j];
        }
      } catch (err: any) {
        console.error("[TRANSLATE ERROR] " + err.message);
        for (let j = 0; j < batch.length; j++) {
          results[i + j] = batch[j];
        }
      }
    }

    return results;
  }
}
