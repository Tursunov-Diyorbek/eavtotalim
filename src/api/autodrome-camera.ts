import { apiClientV2 } from './client'
import type { ApiEnvelope } from './auth'
import type { AutodromeCameraStatusResult } from '@/types'

/** O‘quvchi — avtodrom kamerasidagi holat. */
export async function fetchAutodromeCameraStatus(): Promise<AutodromeCameraStatusResult> {
  const res = await apiClientV2.get<ApiEnvelope<AutodromeCameraStatusResult>>(
    '/my-profile/autodrome-camera-status',
  )
  return res.data
}
