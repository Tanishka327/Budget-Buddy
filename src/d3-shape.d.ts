declare module "d3-shape" {
  export type LinePoint = { x: number; y: number };

  export function line<T extends LinePoint>(): {
    x(fn: (point: T, index: number) => number): any;
    y(fn: (point: T) => number): any;
    curve(fn: any): any;
    (data: T[]): string;
  };

  export const curveMonotoneX: any;
}
