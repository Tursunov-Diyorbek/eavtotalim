declare module 'three/examples/jsm/loaders/SVGLoader.js' {
  import type { Shape } from 'three'

  type ShapePathLike = {
    toShapes: (isCCW?: boolean) => Shape[]
  }

  export class SVGLoader {
    parse(text: string): { paths: ShapePathLike[] }
  }
}
