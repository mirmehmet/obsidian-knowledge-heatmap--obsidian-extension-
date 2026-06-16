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
    const fragment = document.createDocumentFragment();
    const statsDiv = document.createElement("div");
    statsDiv.classList.add("heat-stats-panel");
    
    const header = document.createElement("h3");
    header.textContent = t.statsHeader;
    statsDiv.appendChild(header);

    const table = document.createElement("div");
    table.classList.add("heat-stats-table");

    const bucketDetails: { name: BucketName; label: string; icon: string }[] = [
      { name: "burning", label: "Burning", icon: "🔴" },
      { name: "hot", label: "Hot", icon: "🟠" },
      { name: "warm", label: "Warm", icon: "🟡" },
      { name: "cold", label: "Cold", icon: "🔵" },
      { name: "frozen", label: "Frozen", icon: "❄️" },
    ];

    for (const bucket of bucketDetails) {
      const row = document.createElement("div");
      row.classList.add("heat-stats-row");
      
      const left = document.createElement("span");
      left.classList.add("heat-stats-left");
      left.innerHTML = `<span>${bucket.icon} </span><span style="color: ${ColorMapper.getColor(bucket.name, this.customColors).hex}">${bucket.label}</span>`;

      const count = buckets[bucket.name]?.length ?? 0;
      const right = document.createElement("span");
      right.classList.add("heat-stats-right");
      right.textContent = `${count} ${t.statsNotesSuffix}`;

      row.appendChild(left);
      row.appendChild(right);
      table.appendChild(row);
    }

    statsDiv.appendChild(table);

    const divider = document.createElement("div");
    divider.classList.add("heat-stats-divider");
    statsDiv.appendChild(divider);

    const orphanCount = notes.filter((n) => n.inlinks + n.outlinks === 0).length;
    const orphanRow = document.createElement("div");
    orphanRow.classList.add("heat-stats-row");
    orphanRow.innerHTML = `<span>${t.statsOrphans}</span><span>${orphanCount} ${t.statsNotesSuffix}</span>`;
    statsDiv.appendChild(orphanRow);

    const totalScore = notes.reduce((sum, n) => sum + (scores[n.path] ?? 0), 0);
    const avgScore = notes.length > 0 ? totalScore / notes.length : 0;
    const avgRow = document.createElement("div");
    avgRow.classList.add("heat-stats-row");
    avgRow.innerHTML = `<span>${t.statsAverageScore}</span><span>${avgScore.toFixed(2)}</span>`;
    statsDiv.appendChild(avgRow);

    const totalRow = document.createElement("div");
    totalRow.classList.add("heat-stats-row");
    totalRow.style.fontWeight = "bold";
    totalRow.innerHTML = `<span>${t.statsTotalAnalyzed}</span><span>${notes.length} ${t.statsNotesSuffix}</span>`;
    statsDiv.appendChild(totalRow);

    fragment.appendChild(statsDiv);
    this.container.appendChild(fragment);
  }
}
