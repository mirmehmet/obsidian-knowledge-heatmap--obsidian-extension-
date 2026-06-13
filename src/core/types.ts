export interface NoteData {
  path: string;
  name: string;
  daysSinceModified: number;
  charCount: number;
  outlinks: number;
  inlinks: number;
  visitCount: number;
  tags: string[];
  frontmatter: Record<string, any>;
}

export type HeatScore = number; // Range: [0.0, 1.0]

export interface Weights {
  recency: number;     // 0-100
  linkDensity: number; // 0-100
  visitFreq: number;   // 0-100
  orphan: number;      // 0-100
  contentLen: number;  // 0-100
}

export type BucketName = 'frozen' | 'cold' | 'warm' | 'hot' | 'burning';

export type BucketMap = Record<BucketName, string[]>;

export interface ColorGroup {
  query: string;
  color: {
    a: number;
    rgb: number;
  };
}
