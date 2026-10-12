import { useTranslation } from 'react-i18next'
import { UZ_MAP_VIEWBOX, UZ_REGIONS } from './uzbekistan-map-data'
import type { RegionDailyRow } from '@/types/republic-dashboard'

const LOW: [number, number, number] = [234, 244, 248]
const HIGH: [number, number, number] = [30, 83, 108]
const SMALL = new Set(['tashkentCity', 'andijan', 'namangan', 'fergana', 'syrdarya'])

function heat(t: number) {
  const clamped = Math.min(1, Math.max(0, t))
  const rgb = LOW.map((value, index) =>
    Math.round(value + (HIGH[index] - value) * clamped),
  )
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
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
  const byId = new Map(rows.map((row) => [row.region.id, row]))
  const max = rows.reduce((peak, row) => Math.max(peak, row.active_students_count), 0)

  return (
    <div className="relative h-full min-h-0">
      <svg
        viewBox={UZ_MAP_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        className="block h-full w-full"
        role="img"
        aria-label={t('republicDash.mapLabel')}
      >
        <rect width="800" height="520" fill="#f4f8fb" />
        {UZ_REGIONS.map((region) => {
          const row = byId.get(region.id)
          const amount = row?.active_students_count ?? 0
          const selected = selectedId === region.id
          const hovered = hoverId === region.id
          const fill = !row
            ? '#e7eef3'
            : selected
              ? '#0f2430'
              : hovered
                ? '#2f7ea0'
                : heat(max ? Math.sqrt(amount / max) : 0)
          return (
            <path
              key={region.id}
              d={region.d}
              fill={fill}
              stroke={selected ? '#7ec8e3' : '#ffffff'}
              strokeWidth={selected ? 2.4 : 1.4}
              strokeLinejoin="round"
              className="cursor-pointer transition-[fill] duration-150"
              onMouseEnter={() => onHover(region.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(region.id)}
            >
              <title>{t(`republicDash.regions.${region.label.key}`)}</title>
            </path>
          )
        })}
        {UZ_REGIONS.map((region) => {
          const selected = selectedId === region.id
          const size = SMALL.has(region.label.key) ? 10 : 12
          return (
            <text
              key={`label-${region.id}`}
              x={region.label.x}
              y={region.label.y}
              textAnchor="middle"
              fill={selected ? '#ffffff' : '#0f2430'}
              stroke={selected ? '#0f2430' : '#f4f8fb'}
              strokeWidth={3}
              paintOrder="stroke"
              fontSize={size}
              fontWeight={650}
              className="pointer-events-none select-none"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {t(`republicDash.regions.${region.label.key}`)}
            </text>
          )
        })}
      </svg>
      <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] text-muted shadow-sm">
        <span>{t('republicDash.legendLow')}</span>
        <span
          className="h-1.5 w-16 rounded-full"
          style={{ background: `linear-gradient(90deg, ${heat(0.05)}, ${heat(1)})` }}
        />
        <span>{t('republicDash.legendHigh')}</span>
      </div>
    </div>
  )
}
