/** GET /v2/api/announces/my-announces */

export type AnnounceItem = {
  id: number
  is_read?: number | null
  announce?: {
    id?: number
    title?: string | null
    body?: string | null
    important?: number | null
  } | null
}
