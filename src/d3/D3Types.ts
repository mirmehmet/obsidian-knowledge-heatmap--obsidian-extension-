import * as d3 from "d3";

export interface HeatNode extends d3.SimulationNodeDatum {
  id: string; 
  name: string; 
  score: number;
  color: string;
  inlinks: number;
  outlinks: number;
  visitCount: number;
  charCount: number;
  daysSinceModified: number;
}

export interface HeatLink extends d3.SimulationLinkDatum<HeatNode> {
  source: string | HeatNode;
  target: string | HeatNode;
  value: number; 
}
