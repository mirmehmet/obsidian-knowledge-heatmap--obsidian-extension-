import { NoteData, BucketMap, BucketName } from "../core/types";
import { ColorMapper } from "../core/ColorMapper";
import { getStrings } from "../utils/strings";

export class StatsPanel {
  constructor(private container: HTMLElement, private customColors?: Partial<Record<BucketName, string>>) {}

  public render(
    notes: NoteData[],
    scores: Record<string, number>,
    buckets: BucketMap
  ): void {
    const existing = this.container.querySelector(".heat-stats-panel");
    if (existing) existing.remove();

    const t = getStrings();
    const statsDiv = this.container.createEl("div", { cls: "heat-stats-panel" });
    statsDiv.createEl("h3", { text: t.statsHeader });

    const table = statsDiv.createEl("div", { cls: "heat-stats-table" });

    const bucketDetails: { name: BucketName; label: string; icon: string }[] = [
      { name: "burning", label: "Burning", icon: "🔴" },
      { name: "hot", label: "Hot", icon: "🟠" },
      { name: "warm", label: "Warm", icon: "🟡" },
      { name: "cold", label: "Cold", icon: "🔵" },
      { name: "frozen", label: "Frozen", icon: "❄️" },
    ];

    bucketDetails.forEach((bucket) => {
      const row = table.createEl("div", { cls: "heat-stats-row" });
      const left = row.createEl("span", { cls: "heat-stats-left" });
      left.createEl("span", { text: bucket.icon + " " });
      const nameSpan = left.createEl("span", { text: bucket.label });
      nameSpan.style.color = ColorMapper.getColor(bucket.name, this.customColors).hex;

      const count = buckets[bucket.name]?.length ?? 0;
      row.createEl("span", { cls: "heat-stats-right", text: `${count} ${t.statsNotesSuffix}` });
    });

    statsDiv.createEl("div", { cls: "heat-stats-divider" });

    const orphanCount = notes.filter((n) => n.inlinks + n.outlinks === 0).length;
    const orphanRow = statsDiv.createEl("div", { cls: "heat-stats-row" });
    orphanRow.createEl("span", { text: t.statsOrphans });
    orphanRow.createEl("span", { text: `${orphanCount} ${t.statsNotesSuffix}` });

    const totalScore = notes.reduce((sum, n) => sum + (scores[n.path] ?? 0), 0);
    const avgScore = notes.length > 0 ? totalScore / notes.length : 0;
    const avgRow = statsDiv.createEl("div", { cls: "heat-stats-row" });
    avgRow.createEl("span", { text: t.statsAverageScore });
    avgRow.createEl("span", { text: `${avgScore.toFixed(2)}` });

    const totalRow = statsDiv.createEl("div", { cls: "heat-stats-row", style: "font-weight: bold;" });
    totalRow.createEl("span", { text: t.statsTotalAnalyzed });
    totalRow.createEl("span", { text: `${notes.length} ${t.statsNotesSuffix}` });
  }
}
