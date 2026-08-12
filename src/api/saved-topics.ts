import { apiClient, apiClientV2 } from './client'
import type { ApiEnvelope } from './auth'
import type { SavedTopicItem } from '@/types'

function asTopicList(payload: unknown): SavedTopicItem[] {
  if (Array.isArray(payload)) return payload as SavedTopicItem[]
  if (payload && typeof payload === 'object') {
    const obj = payload as { data?: unknown }
    if (Array.isArray(obj.data)) return obj.data as SavedTopicItem[]
  }
  return []
}

/** Saqlangan mavzular ro‘yxati (v2, fallback v1). */
export async function fetchSavedTopics(): Promise<SavedTopicItem[]> {
  let v2List: SavedTopicItem[] | null = null

  try {
    const res = await apiClientV2.get<
      ApiEnvelope<SavedTopicItem[] | { data: SavedTopicItem[] }>
    >('/student-content/saved-topic/index')
    v2List = asTopicList(res.data)
    if (v2List.length > 0) return v2List
  } catch {
    /* v1 fallback */
  }

  try {
    const res = await apiClient.get<{
      status?: number
      data?: SavedTopicItem[]
    }>('/saved-topic')
    const v1 = Array.isArray(res.data) ? res.data : []
    if (v1.length > 0) return v1
  } catch {
    /* ignore */
  }

  return v2List ?? []
}

/** Mavzuni saqlash */
export async function saveStudentTopic(topicId: number | string): Promise<void> {
  const form = new FormData()
  form.append('topic_id', String(topicId))
  try {
    await apiClientV2.postForm('/student-content/saved-topic/store', form)
    return
  } catch {
    /* v1 fallback */
  }
  await apiClient.postForm('/saved-topic', form)
}

export type UnsaveStudentTopicArgs = {
  topicId: number | string
  /** v1 yozuv id — `GET /saved-topic` dagi `id` */
  savedId?: number | string | null
}

/**
 * Saqlanganlardan olib tashlash.
 * Eski UI: v1 `DELETE /saved-topic/{savedId}` yoki v2 delete + topic_id.
 */
export async function unsaveStudentTopic({
  topicId,
  savedId,
}: UnsaveStudentTopicArgs): Promise<void> {
  const tid = String(topicId)
  const errors: unknown[] = []

  // 1) v1 — saqlangan yozuv id bo‘yicha (SaveSubjects)
  if (savedId != null && savedId !== '') {
    try {
      await apiClient.delete(`/saved-topic/${savedId}`)
      return
    } catch (e) {
      errors.push(e)
    }
  }

  // 2) v2 — JSON body (DELETE + FormData ko‘pincha serverda o‘qilmaydi)
  try {
    await apiClientV2.delete('/student-content/saved-topic/delete', {
      body: { topic_id: Number(tid) || tid },
    })
    return
  } catch (e) {
    errors.push(e)
  }

  // 3) v2 — query
  try {
    await apiClientV2.delete(
      `/student-content/saved-topic/delete?topic_id=${encodeURIComponent(tid)}`,
    )
    return
  } catch (e) {
    errors.push(e)
  }

  // 4) v2 — FormData (eski axios usuli)
  try {
    const form = new FormData()
    form.append('topic_id', tid)
    await apiClientV2.deleteForm('/student-content/saved-topic/delete', form)
    return
  } catch (e) {
    errors.push(e)
  }

  throw errors[errors.length - 1] ?? new Error('Unsave failed')
}
