import { FieldMetadata } from '@job-autofill/shared-types';

export class AIFallbackMatcher {
  /**
   * Calls the Gemini API / OpenRouter to analyze the field and determine its mapping.
   * This is a stub for the actual API call.
   */
  public static async analyzeField(metadata: FieldMetadata): Promise<{ fieldKey: string, confidence: number }> {
    // TODO: Implement actual API call to Google Gemini or OpenRouter
    // Prompt structure: "Given the field label '{metadata.label}' and nearby text '{metadata.nearbyText}', which database field from our schema does this match?"
    
    console.log(`[AI Fallback] Analyzing field: ${metadata.name}`);
    
    // Stub response
    return {
      fieldKey: 'unknown',
      confidence: 0
    };
  }
}
