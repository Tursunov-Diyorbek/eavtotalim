import { useCallback, useState } from 'react'

/**
 * Filter `Select` optionlari sahifaga kirganda emas, dropdown birinchi ochilganda so‘ralsin:
 * `const [groupsEnabled, openGroups] = useOpenedOnce()` → query `enabled`, `<Select onOpen={openGroups} />`.
 */
export function useOpenedOnce(initial = false) {
  const [opened, setOpened] = useState(initial)
  const open = useCallback(() => setOpened(true), [])
  return [opened, open] as const
}
