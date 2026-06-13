import { NoteData, Weights, HeatScore } from "./types";

export class ScoreCalculator {
  public static calculate(note: NoteData, weights: Weights): HeatScore {
    const totalLinks = note.inlinks + note.outlinks;

    const raw = {
      recency: Math.exp(-note.daysSinceModified / 30),
      linkDensity: Math.min(totalLinks, 50) / 50,
      visitFreq: Math.min(note.visitCount, 100) / 100,
      orphan: totalLinks === 0 ? 0 : 1,
      contentLen: Math.min(note.charCount, 5000) / 5000,
    };

    const totalWeight =
      (weights.recency || 0) +
      (weights.linkDensity || 0) +
      (weights.visitFreq || 0) +
      (weights.orphan || 0) +
      (weights.contentLen || 0);

    if (totalWeight === 0) {
      return 0;
    }

    let weightedSum = 0;
    weightedSum += raw.recency * (weights.recency || 0);
    weightedSum += raw.linkDensity * (weights.linkDensity || 0);
    weightedSum += raw.visitFreq * (weights.visitFreq || 0);
    weightedSum += raw.orphan * (weights.orphan || 0);
    weightedSum += raw.contentLen * (weights.contentLen || 0);

    const score = weightedSum / totalWeight;

    // Ensure score is strictly within [0.0, 1.0]
    return Math.max(0, Math.min(1, score));
  }
}
