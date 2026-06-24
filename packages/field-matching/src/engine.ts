import { FieldMetadata } from '@job-autofill/shared-types';
import { FIELD_DICTIONARY } from './dictionary';
import * as stringSimilarity from 'string-similarity';

export interface MatchResult {
  fieldKey: string;
  confidence: number;
  strategy: 'exact' | 'dictionary' | 'ai' | 'unknown';
}

export class FieldMatchingEngine {
  
  public static matchField(metadata: FieldMetadata): MatchResult {
    // 1. Normalize the input texts
    const normalizedName = this.normalize(metadata.name);
    const normalizedLabel = this.normalize(metadata.label);
    const normalizedPlaceholder = this.normalize(metadata.placeholder);

    const candidates = [normalizedLabel, normalizedName, normalizedPlaceholder].filter(c => c.length > 0);

    // 2. Exact Match Check & Dictionary Check
    for (const candidate of candidates) {
      for (const [key, variations] of Object.entries(FIELD_DICTIONARY)) {
        if (variations.includes(candidate)) {
          return { fieldKey: key, confidence: 1.0, strategy: 'exact' };
        }

        // Fuzzy match via string similarity (dice's coefficient)
        const bestMatch = stringSimilarity.findBestMatch(candidate, variations);
        if (bestMatch.bestMatch.rating >= 0.8) {
          return { fieldKey: key, confidence: bestMatch.bestMatch.rating, strategy: 'dictionary' };
        }
      }
    }

    // 3. Fallback (would call AI here if confidence < 0.8)
    return { fieldKey: 'unknown', confidence: 0, strategy: 'unknown' };
  }

  private static normalize(text: string): string {
    if (!text) return '';
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, ' ');
  }
}
