import { Notice } from "obsidian";
import { KnowledgeHeatMapSettings } from "./PluginSettings";
import { ColorMapper } from "../core/ColorMapper";
import { Logger } from "../utils/logger";

/**
 * Weekly Digest Service — analyzes score history changes and shows
 * a summary notification every 7 days.
 */
export class DigestService {
  private static readonly DIGEST_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  /**
   * Checks if a weekly digest should be shown and displays it if so.
   * @returns true if digest was shown.
   */
  public static async checkAndShow(
    settings: KnowledgeHeatMapSettings,
    saveCallback: () => Promise<void>
  ): Promise<boolean> {
    if (!settings.weeklyDigestEnabled) return false;

    const now = Date.now();
    const lastDigest = settings.lastDigestDate ? new Date(settings.lastDigestDate).getTime() : 0;

    if (now - lastDigest < this.DIGEST_INTERVAL_MS) return false;

    const digest = this.generateDigest(settings);
    if (digest) {
      new Notice(digest, 10000);
      settings.lastDigestDate = new Date().toISOString();
      await saveCallback();
      Logger.info("Weekly digest shown");
      return true;
    }

    return false;
  }

  /**
   * Generates a digest summary string from score history.
   */
  private static generateDigest(settings: KnowledgeHeatMapSettings): string | null {
    const history = settings.scoreHistory;
    if (!history || Object.keys(history).length === 0) return null;

    let improved = 0;
    let declined = 0;
    let frozenCount = 0;

    for (const entries of Object.values(history)) {
      if (entries.length < 2) continue;

      const latest = entries[entries.length - 1].score;
      const previous = entries[entries.length - 2].score;
      const latestBucket = ColorMapper.getBucketName(latest);
      const previousBucket = ColorMapper.getBucketName(previous);

      if (latestBucket !== previousBucket) {
        const bucketOrder = ["frozen", "cold", "warm", "hot", "burning"];
        const latestIdx = bucketOrder.indexOf(latestBucket);
        const prevIdx = bucketOrder.indexOf(previousBucket);
        if (latestIdx > prevIdx) improved++;
        else declined++;
      }

      if (latestBucket === "frozen") frozenCount++;
    }

    if (improved === 0 && declined === 0) return null;

    const lines: string[] = ["📊 Weekly Heat Digest"];
    if (improved > 0) {
      lines.push(`🔥 ${improved} note(s) heated up!`);
    }
    if (declined > 0) {
      lines.push(`❄️ ${declined} note(s) cooled down.`);
    }
    if (frozenCount > 0) {
      lines.push(`🕳️ ${frozenCount} note(s) are frozen.`);
    }

    return lines.join("\n");
  }
}
