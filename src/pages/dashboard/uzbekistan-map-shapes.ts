import type { Shape } from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { UZ_REGIONS, type UzRegionShape } from './uzbekistan-map-data'

const loader = new SVGLoader()

export type UzRegionMesh = UzRegionShape & {
  shapes: Shape[]
  /** Yozuv uchun viloyat o‘rtasi (SVG koordinata). */
  anchor: { x: number; y: number }
}

function anchorOf(shapes: Shape[], fallback: { x: number; y: number }) {
  let sx = 0
  let sy = 0
  let count = 0
  for (const shape of shapes) {
    for (const point of shape.getPoints(8)) {
      sx += point.x
      sy += point.y
      count += 1
    }
  }
  if (!count) return fallback
  return { x: sx / count, y: sy / count }
}

/** SVG chiziqlari bir marta Shape ga aylantiriladi. */
export const UZ_REGION_MESHES: UzRegionMesh[] = UZ_REGIONS.map((region) => {
  const parsed = loader.parse(
    `<svg xmlns="http://www.w3.org/2000/svg"><path d="${region.d}"/></svg>`,
  )
  const shapes = parsed.paths.flatMap((path) => path.toShapes(true))
  return { ...region, shapes, anchor: anchorOf(shapes, region.label) }
})
