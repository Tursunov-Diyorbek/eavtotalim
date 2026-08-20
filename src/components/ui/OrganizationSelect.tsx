import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchOrganizationsList, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from '@/hooks'
import { asLangName, asText } from '@/lib/apiPage'
import type { OrganizationListItem } from '@/types/organization'
import { Select, type SelectOption, type SelectProps } from './Select'

export type OrganizationSelectValueKey = 'inn' | 'id' | 'name'

type OrganizationSelectProps = {
  value?: string
  onChange?: SelectProps['onChange']
  /** Eski `OrganizationFilterC`: default INN, `id` / `name` flaglari. */
  valueKey?: OrganizationSelectValueKey
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
  return inn === '—' ? '' : inn
}

function organizationTitle(item: OrganizationListItem, lang: string) {
  const name = asLangName(item.name, lang)
  if (name !== '—') return name
  const uz = asText(item.name_uz)
  if (uz !== '—') return uz
  return asText(item.title)
}

function OrganizationOptionLabel({
  inn,
  name,
}: {
  inn: string
  name: string
}) {
  return (
    <span className="block min-w-0 truncate">
      {inn ? <span className="font-medium text-rose">{inn}</span> : null}
      {inn && name ? ' - ' : null}
      {name ? <span className="text-ink">{name}</span> : inn ? '' : '—'}
    </span>
  )
}

/** Eski `OrganizationFilterC` — INN qizil, tashkilot nomi, «Barchasi». */
export function OrganizationSelect({
  value = '',
  onChange,
  valueKey = 'inn',
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

  const { data, isPending } = useQuery({
    queryKey: queryKeys.organizations.list(debouncedSearch),
    queryFn: () => fetchOrganizationsList(debouncedSearch),
    enabled: isAuthenticated,
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
        label: <OrganizationOptionLabel inn={innText} name={nameText} />,
      })
    }

    return list
  }, [items, pinned, current, valueKey, t, i18n.language])

  return (
    <Select
      size={size}
      searchable
      clearable={clearable}
      loading={isPending && items.length === 0}
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
