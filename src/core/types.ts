/**
 * Represents structured analysis metadata collected for a single note in the vault.
 */
export interface NoteData {
  /** The absolute workspace path of the note file. */
  path: string;
  /** The display name (basename) of the note. */
  name: string;
  /** Days elapsed since the note was last modified. */
  daysSinceModified: number;
  /** Size of the note in characters (bytes). */
  charCount: number;
  /** Count of outgoing links from this note. */
  outlinks: number;
  /** Count of incoming links to this note from other notes. */
  inlinks: number;
  /** Total visit count recorded by the tracker. */
  visitCount: number;
  /** Cleaned tags associated with the note (including frontmatter tags). */
  tags: string[];
  /** Raw frontmatter object of the note. */
  frontmatter: Record<string, any>;
}

/**
 * Normalized heat score ranging from 0.0 (coldest) to 1.0 (hottest).
 */
export type HeatScore = number;

/**
 * Weight configurations for each active criterion used in score calculations.
 * Values typically range from 0 to 100.
 */
export interface Weights {
  /** Weight for last modified recency. */
  recency: number;
  /** Weight for total links (inlinks + outlinks). */
  linkDensity: number;
  /** Weight for file open visit counts. */
  visitFreq: number;
  /** Weight for orphan status penalty. */
  orphan: number;
  /** Weight for note content size in characters. */
  contentLen: number;
}

/**
 * Names representing each of the 5 heat index buckets.
 */
export type BucketName = 'frozen' | 'cold' | 'warm' | 'hot' | 'burning';

/**
 * Map categorizing file paths into their respective heat index buckets.
 */
export type BucketMap = Record<BucketName, string[]>;

/**
 * Structure representing color settings matching Obsidian's native graph.json config schema.
 */
export interface ColorGroup {
  /** Query filter string (e.g. path:"...") */
  query: string;
  /** Color configurations */
  color: {
    /** Alpha opacity (usually 1) */
    a: number;
    /** Integer color representation (r * 65536 + g * 256 + b) */
    rgb: number;
  };
}
