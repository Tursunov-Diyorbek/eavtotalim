import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchAutodromesList, fetchOrganizationsList, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'
import { SEARCH_DEBOUNCE_MS, useDebouncedValue, useOpenedOnce } from '@/hooks'
import { asLangName, asText } from '@/lib/apiPage'
import { cn } from '@/lib/cn'
import type { OrganizationListItem } from '@/types/organization'
import { Select, type SelectOption, type SelectProps } from './Select'

export type OrganizationSelectValueKey = 'inn' | 'id' | 'name'

type OrganizationSelectProps = {
  value?: string
  onChange?: SelectProps['onChange']
  /** Eski `OrganizationFilterC`: default INN, `id` / `name` flaglari. */
  valueKey?: OrganizationSelectValueKey
  /** `organizations` — avtomaktablar (`/organizations/list`), `autodromes` — avtodromlar (`/autodromes/list`). */
  source?: 'organizations' | 'autodromes'
  className?: string
  triggerClassName?: string
  size?: SelectProps['size']
  name?: string
  id?: string
  disabled?: boolean
  clearable?: boolean
}

function optionValue(
  item: OrganizationListItem,
  valueKey: OrganizationSelectValueKey,
) {
  if (valueKey === 'id') return item.id == null ? '' : String(item.id)
  if (valueKey === 'name') {
    const name = asText(item.name)
    return name === '—' ? '' : name
  }
  const inn = asText(item.inn)
  if (inn !== '—') return inn
  const name = asText(item.name)
  return name === '—' ? '' : name
}

function organizationTitle(item: OrganizationListItem, lang: string) {
  const name = asLangName(item.name, lang)
  if (name !== '—') return name
  const uz = asText(item.name_uz)
  if (uz !== '—') return uz
  return asText(item.title)
}

/**
 * Tashkilot INN + nom. `stacked` (jadval katagi): nom tepada, INN ostida — `RegionDistrict` kabi.
 * Aks holda (select option) bitta qatorda: INN - nom. Uzun nom `truncate`, to‘liq matn `title` da.
 */
export function OrganizationLabel({
  inn,
  name,
  stacked = false,
  className,
}: {
  inn?: string | null
  name?: string | null
  stacked?: boolean
  className?: string
}) {
  const innText = inn?.trim() && inn.trim() !== '—' ? inn.trim() : ''
  const nameText = name?.trim() && name.trim() !== '—' ? name.trim() : ''
  if (stacked) {
    if (!innText && !nameText) return <span className="text-muted">—</span>
    return (
      <div className={cn('flex min-w-0 flex-col leading-tight', className)}>
        <span className="truncate text-ink" title={nameText || innText}>
          {nameText || innText}
        </span>
        {nameText && innText ? (
          <span className="mt-0.5 truncate text-[12px] font-medium text-rose">{innText}</span>
        ) : null}
      </div>
    )
  }
  return (
    <span
      className={cn('block min-w-0 truncate', className)}
      title={[innText, nameText].filter(Boolean).join(' - ') || undefined}
    >
      {innText ? <span className="font-medium text-rose">{innText}</span> : null}
      {innText && nameText ? ' - ' : null}
      {nameText ? <span className="text-ink">{nameText}</span> : innText ? '' : '—'}
    </span>
  )
}

/** Eski `OrganizationFilterC` — INN qizil, tashkilot nomi, «Barchasi». */
export function OrganizationSelect({
  value = '',
  onChange,
  valueKey = 'inn',
  source = 'organizations',
  className,
  triggerClassName,
  size = 'sm',
  name,
  id,
  disabled,
  clearable = true,
}: OrganizationSelectProps) {
  const { t, i18n } = useTranslation()
  const { isAuthenticated } = useAuth()
  const [search, setSearch] = useState('')
  const [pinned, setPinned] = useState<OrganizationListItem | null>(null)
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)
  const [opened, open] = useOpenedOnce(Boolean(value))

  const { data, isFetching } = useQuery({
    queryKey:
      source === 'autodromes'
        ? queryKeys.organizations.autodromes(debouncedSearch)
        : queryKeys.organizations.list(debouncedSearch),
    queryFn: () =>
      source === 'autodromes'
        ? fetchAutodromesList(debouncedSearch)
        : fetchOrganizationsList(debouncedSearch),
    enabled: isAuthenticated && opened,
    placeholderData: (prev) => prev,
  })

  const items = data ?? []
  const current = value ?? ''

  useEffect(() => {
    if (!current) {
      setPinned(null)
      return
    }
    const hit = items.find((item) => optionValue(item, valueKey) === current)
    if (hit) setPinned(hit)
  }, [current, items, valueKey])

  const options = useMemo<SelectOption[]>(() => {
    const seen = new Set<string>()
    const list: SelectOption[] = [
      {
        value: '',
        label: t('organizationSelect.all'),
        searchText: t('organizationSelect.all'),
      },
    ]

    const source = [...items]
    if (
      pinned &&
      current &&
      !source.some((item) => optionValue(item, valueKey) === current)
    ) {
      source.unshift(pinned)
    }

    for (const item of source) {
      const val = optionValue(item, valueKey)
      if (!val || seen.has(val)) continue
      seen.add(val)
      const inn = asText(item.inn)
      const title = organizationTitle(item, i18n.language)
      const innText = inn === '—' ? '' : inn
      const nameText = title === '—' ? '' : title
      list.push({
        value: val,
        searchText: `${innText} ${nameText}`.trim(),
        label: <OrganizationLabel inn={innText} name={nameText} />,
      })
    }

    return list
  }, [items, pinned, current, valueKey, t, i18n.language])

  return (
    <Select
      size={size}
      searchable
      clearable={clearable}
      onOpen={open}
      loading={isFetching && items.length === 0}
      menuMinWidth={320}
      className={className}
      triggerClassName={triggerClassName}
      name={name}
      id={id}
      disabled={disabled}
      value={current}
      onChange={onChange}
      onSearch={setSearch}
      placeholder={t('organizationSelect.placeholder')}
      searchPlaceholder={t('organizationSelect.placeholder')}
      options={options}
    />
  )
}
