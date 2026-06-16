import { NoteData, Weights, HeatScore } from "./types";

/**
 * Engine to calculate the final weighted heat score for individual notes.
 */
export class ScoreCalculator {
  /**
   * Calculates the weighted heat score for a note based on configured weight parameters and active criteria.
   * 
   * @param note - Collected metrics for the target note.
   * @param weights - Configured weights for each metric.
   * @param activeCriteria - Optional mapping of whether each metric criteria is enabled.
   * @returns Calculated normalized heat score strictly within [0.0, 1.0].
   */
  public static calculate(
    note: NoteData,
    weights: Weights,
    activeCriteria?: Record<string, boolean>,
    timeRange?: string
  ): HeatScore {
    const totalLinks = note.inlinks + note.outlinks;

    const isActive = (key: string): boolean => {
      if (!activeCriteria) return true;
      return activeCriteria[key] ?? true;
    };

    let decayDenominator = 30;
    if (timeRange === "7d") decayDenominator = 7;
    else if (timeRange === "30d") decayDenominator = 30;
    else if (timeRange === "90d") decayDenominator = 90;

    const raw = {
      recency: Math.exp(-note.daysSinceModified / decayDenominator),
      linkDensity: Math.min(totalLinks, 50) / 50,
      visitFreq: Math.min(note.visitCount, 100) / 100,
      orphan: totalLinks === 0 ? 0 : 1,
      contentLen: Math.min(note.charCount, 5000) / 5000,
    };

    const totalWeight =
      (isActive("recency") ? (weights.recency || 0) : 0) +
      (isActive("linkDensity") ? (weights.linkDensity || 0) : 0) +
      (isActive("visitFreq") ? (weights.visitFreq || 0) : 0) +
      (isActive("orphan") ? (weights.orphan || 0) : 0) +
      (isActive("contentLen") ? (weights.contentLen || 0) : 0);

    if (totalWeight === 0) {
      return 0;
    }

    let weightedSum = 0;
    weightedSum += isActive("recency") ? raw.recency * (weights.recency || 0) : 0;
    weightedSum += isActive("linkDensity") ? raw.linkDensity * (weights.linkDensity || 0) : 0;
    weightedSum += isActive("visitFreq") ? raw.visitFreq * (weights.visitFreq || 0) : 0;
    weightedSum += isActive("orphan") ? raw.orphan * (weights.orphan || 0) : 0;
    weightedSum += isActive("contentLen") ? raw.contentLen * (weights.contentLen || 0) : 0;

    const score = weightedSum / totalWeight;

    // Ensure score is strictly within [0.0, 1.0]
    return Math.max(0, Math.min(1, score));
  }
}
