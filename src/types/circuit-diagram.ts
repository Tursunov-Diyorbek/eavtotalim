/** Avtodrom qo‘llanmasi (circuit diagram) */

export type AutodromeGuideItemType = 'text' | 'image' | 'video' | 'audio' | string

export type AutodromeGuideListItem = {
  id: number
  name?: string | null
  status?: number | boolean | null
  lang_id?: number | null
  edu_type_id?: number | null
  edu_type?: {
    id?: number
    short_name?: string | null
    name?: string | null
  } | null
}

export type AutodromeGuideContentItem = {
  id?: number
  type?: AutodromeGuideItemType | null
  content?: string | null
  file_path?: string | null
  sort_order?: number | null
  status?: number | boolean | null
  lang_id?: number | null
}

export type AutodromeGuideDetail = AutodromeGuideListItem & {
  items?: AutodromeGuideContentItem[] | null
}
