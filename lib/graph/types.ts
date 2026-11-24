import type { Domain, PostType, Stage } from '../content/schema';

export type GraphNode = {
  id: string;
  kind: 'post' | 'project' | 'domain';
  type?: PostType;
  domain: Domain;
  title: string;
  stage?: Stage;
  weight: number;
  x: number;
  y: number;
  z: number;
};
export type GraphLink = { source: string; target: string };
export type Graph = { nodes: GraphNode[]; links: GraphLink[] };
