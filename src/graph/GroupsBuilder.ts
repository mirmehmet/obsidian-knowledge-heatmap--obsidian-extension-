import { BucketMap, BucketName, ColorGroup } from "../core/types";
import { ColorMapper } from "../core/ColorMapper";

/**
 * Constructs Obsidian graph.json-compatible colorGroups arrays from heat bucket data.
 * Separates the concern of building path queries from the file I/O logic in GraphJsonManager.
 */
export class GroupsBuilder {
  /**
   * Builds an array of ColorGroup objects ready for writing into graph.json.
   * Automatically chunks large path lists to avoid excessively long query strings.
   * 
   * @param buckets - Map of bucket names to file paths.
   * @param customColors - Optional custom palette overrides.
   * @param chunkSize - Max paths per single colorGroup query (default: 200).
   * @returns Array of ColorGroup objects.
   */
  public static build(
    buckets: BucketMap,
    customColors?: Partial<Record<BucketName, string>>,
    chunkSize = 200
  ): ColorGroup[] {
    const colorGroups: ColorGroup[] = [];
    const bucketNames: BucketName[] = ["frozen", "cold", "warm", "hot", "burning"];

    for (const bucketName of bucketNames) {
      const paths = buckets[bucketName] || [];
      if (paths.length === 0) continue;

      const colorInfo = ColorMapper.getColor(bucketName, customColors);

      for (let i = 0; i < paths.length; i += chunkSize) {
        const chunk = paths.slice(i, i + chunkSize);
        const query = chunk.map(p => `path:"${p}"`).join(" OR ");

        colorGroups.push({
          query,
          color: {
            a: 1,
            rgb: colorInfo.rgb,
          },
        });
      }
    }

    return colorGroups;
  }
}
