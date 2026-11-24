// Minimal types for the parts of d3-force-3d the graph build uses (the package ships none).
declare module 'd3-force-3d' {
  type SimNode = { id: string; x?: number; y?: number; z?: number; [k: string]: unknown };
  type SimLink = { source: string | SimNode; target: string | SimNode };
  interface Force {}
  interface LinkForce extends Force {
    id(fn: (n: SimNode) => string): LinkForce;
    distance(d: number): LinkForce;
  }
  interface ManyBodyForce extends Force {
    strength(s: number | ((n: SimNode) => number)): ManyBodyForce;
  }
  interface Simulation {
    numDimensions(n: number): Simulation;
    randomSource(fn: () => number): Simulation;
    force(name: string, f: Force | null): Simulation;
    stop(): Simulation;
    tick(n?: number): Simulation;
  }
  export function forceSimulation(nodes: SimNode[], numDimensions?: number): Simulation;
  export function forceLink(links: SimLink[]): LinkForce;
  export function forceManyBody(): ManyBodyForce;
  export function forceCenter(x?: number, y?: number, z?: number): Force;
}
