import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Canvas, useThree, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { ExtrudeGeometry, Vector3 } from 'three'
import type { Shape } from 'three'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { RegionDailyRow } from '@/types/republic-dashboard'
import { UZ_REGION_MESHES } from './uzbekistan-map-shapes'

const LOW: [number, number, number] = [234, 244, 248]
const HIGH: [number, number, number] = [30, 83, 108]
const SMALL = new Set(['tashkentCity', 'andijan', 'namangan', 'fergana', 'syrdarya'])
/** Siqilgan viloyatlarda yozuv bir-birining ustiga chiqmasin. */
const LABEL_NUDGE: Record<string, { x: number; y: number }> = {
  bukhara: { x: -28, y: 18 },
  tashkentCity: { x: 26, y: 16 },
  tashkentRegion: { x: -28, y: -22 },
  namangan: { x: 8, y: -14 },
  andijan: { x: 18, y: 6 },
  fergana: { x: -10, y: 18 },
  syrdarya: { x: 10, y: -8 },
  jizzakh: { x: 14, y: 6 },
}

const CAMERA_HOME = { position: [16, 520, 340] as const, target: [0, 12, 0] as const }

function heat(t: number) {
  const clamped = Math.min(1, Math.max(0, t))
  const rgb = LOW.map((value, index) =>
    Math.round(value + (HIGH[index] - value) * clamped),
  )
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
}

function slabHeight(amount: number, max: number, selected: boolean) {
  const t = max > 0 ? Math.sqrt(amount / max) : 0
  return (selected ? 10 : 5) + t * 24
}

type UzbekistanMapProps = {
  rows: RegionDailyRow[]
  selectedId: number | null
  hoverId: number | null
  onSelect: (id: number) => void
  onHover: (id: number | null) => void
}

export function UzbekistanMap({
  rows,
  selectedId,
  hoverId,
  onSelect,
  onHover,
}: UzbekistanMapProps) {
  const { t } = useTranslation()
  const controls = useRef<OrbitControlsImpl>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const labelNodes = useRef(new Map<number, HTMLSpanElement>())
  const vec = useMemo(() => new Vector3(), [])
  const byId = useMemo(() => new Map(rows.map((row) => [row.region.id, row])), [rows])
  const max = rows.reduce((peak, row) => Math.max(peak, row.active_students_count), 0)
  const spots = useMemo(
    () =>
      UZ_REGION_MESHES.map((region) => {
        const amount = byId.get(region.id)?.active_students_count ?? 0
        const selected = selectedId === region.id
        const height = slabHeight(amount, max, selected)
        const nudge = LABEL_NUDGE[region.label.key]
        const x = region.anchor.x + (nudge?.x ?? 0)
        const y = region.anchor.y + (nudge?.y ?? 0)
        return {
          id: region.id,
          key: region.label.key,
          name: t(`republicDash.regions.${region.label.key}`),
          selected,
          hovered: hoverId === region.id,
          position: [x - 400, height + 10, y - 260] as [number, number, number],
        }
      }),
    [byId, hoverId, max, selectedId, t],
  )
  const spotsRef = useRef(spots)
  spotsRef.current = spots

  useEffect(() => {
    let frame = 0
    const tick = () => {
      const camera = controls.current?.object
      const stage = stageRef.current
      if (camera && stage) {
        const width = stage.clientWidth
        const height = stage.clientHeight
        camera.updateMatrixWorld()
        for (const spot of spotsRef.current) {
          const el = labelNodes.current.get(spot.id)
          if (!el) continue
          vec.set(spot.position[0], spot.position[1], spot.position[2])
          vec.project(camera)
          const x = (vec.x * 0.5 + 0.5) * width
          const y = (-vec.y * 0.5 + 0.5) * height
          el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
          el.style.visibility = vec.z < 1 ? 'visible' : 'hidden'
        }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [vec])

  const resetView = () => {
    const orbit = controls.current
    if (!orbit) return
    orbit.target.set(...CAMERA_HOME.target)
    orbit.object.position.set(...CAMERA_HOME.position)
    orbit.update()
  }

  return (
    <div ref={stageRef} className="relative h-full min-h-0">
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [...CAMERA_HOME.position], fov: 32, near: 1, far: 5000 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: false }}
          onPointerMissed={() => onHover(null)}
        >
          <color attach="background" args={['#f4f8fb']} />
          <AimCamera />
          <ambientLight intensity={0.78} />
          <directionalLight position={[180, 420, 140]} intensity={1.45} />
          <directionalLight position={[-220, 160, -80]} intensity={0.32} color="#d5e6f0" />
          <group position={[-400, 0, -260]}>
            <group rotation={[-Math.PI / 2, 0, 0]} scale={[1, -1, 1]}>
              {UZ_REGION_MESHES.map((region) => {
                const row = byId.get(region.id)
                const amount = row?.active_students_count ?? 0
                const selected = selectedId === region.id
                const hovered = hoverId === region.id
                const color = !row
                  ? '#e7eef3'
                  : selected
                    ? '#0f2430'
                    : hovered
                      ? '#2f7ea0'
                      : heat(max ? Math.sqrt(amount / max) : 0)
                return (
                  <RegionSlab
                    key={region.id}
                    shapes={region.shapes}
                    height={slabHeight(amount, max, selected)}
                    color={color}
                    onHover={(id) => onHover(id)}
                    onSelect={() => onSelect(region.id)}
                    regionId={region.id}
                  />
                )
              })}
            </group>
          </group>
          <OrbitControls
            ref={controls}
            makeDefault
            enablePan={false}
            enableDamping
            dampingFactor={0.12}
            rotateSpeed={0.35}
            zoomSpeed={0.55}
            minPolarAngle={0.55}
            maxPolarAngle={0.95}
            minDistance={340}
            maxDistance={900}
            target={[...CAMERA_HOME.target]}
          />
        </Canvas>
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {spots.map((spot) => (
          <span
            key={spot.id}
            ref={(node) => {
              if (node) labelNodes.current.set(spot.id, node)
              else labelNodes.current.delete(spot.id)
            }}
            className="pointer-events-auto absolute top-0 left-0 whitespace-nowrap"
            style={{ visibility: 'hidden', whiteSpace: 'nowrap' }}
          >
            <Button
              variant="soft"
              size="inline"
              className={cn(
                '!h-auto !w-max !rounded-full !px-2 !py-0.5 !font-semibold !whitespace-nowrap shadow-sm',
                SMALL.has(spot.key) ? '!text-[10px]' : '!text-[12px]',
                spot.selected || spot.hovered ? '!bg-deep !text-white' : '!bg-white/95 !text-deep',
              )}
              style={{ whiteSpace: 'nowrap' }}
              onPointerEnter={() => onHover(spot.id)}
              onPointerLeave={() => onHover(null)}
              onClick={(event) => {
                event.stopPropagation()
                onSelect(spot.id)
              }}
            >
              {spot.name}
            </Button>
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] whitespace-nowrap text-muted shadow-sm">
        <span>{t('republicDash.legendLow')}</span>
        <span
          className="h-1.5 w-16 rounded-full"
          style={{ background: `linear-gradient(90deg, ${heat(0.05)}, ${heat(1)})` }}
        />
        <span>{t('republicDash.legendHigh')}</span>
      </div>
      <Button
        variant="soft"
        size="sm"
        className="absolute right-3 bottom-3 z-20 !bg-white/95 !whitespace-nowrap"
        onClick={resetView}
      >
        {t('republicDash.resetView')}
      </Button>
    </div>
  )
}

function AimCamera() {
  const camera = useThree((state) => state.camera)
  useEffect(() => {
    camera.lookAt(...CAMERA_HOME.target)
  }, [camera])
  return null
}

function RegionSlab({
  shapes,
  height,
  color,
  regionId,
  onHover,
  onSelect,
}: {
  shapes: Shape[]
  height: number
  color: string
  regionId: number
  onHover: (id: number | null) => void
  onSelect: () => void
}) {
  const geometries = useMemo(
    () =>
      shapes.map(
        (shape) =>
          new ExtrudeGeometry(shape, {
            depth: height,
            bevelEnabled: false,
            curveSegments: 2,
          }),
      ),
    [shapes, height],
  )

  useEffect(() => {
    return () => {
      geometries.forEach((geometry) => geometry.dispose())
    }
  }, [geometries])

  const point = (event: ThreeEvent<PointerEvent>, cursor: string) => {
    const canvas = event.nativeEvent.target
    if (canvas instanceof HTMLElement) canvas.style.cursor = cursor
  }

  return (
    <group>
      {geometries.map((geometry, index) => (
        <mesh
          key={index}
          geometry={geometry}
          onPointerOver={(event) => {
            event.stopPropagation()
            point(event, 'pointer')
            onHover(regionId)
          }}
          onPointerOut={(event) => {
            point(event, '')
            onHover(null)
          }}
          onClick={(event) => {
            event.stopPropagation()
            onSelect()
          }}
        >
          <meshStandardMaterial color={color} roughness={0.78} metalness={0.03} />
        </mesh>
      ))}
    </group>
  )
}
