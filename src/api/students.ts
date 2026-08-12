import type { ApiListResponse, Student } from '@/types'

/** Mock until backend is ready — later: apiClient.get('/students') */
const mockStudents: Student[] = [
  {
    id: '1',
    fullName: 'Ali Valiyev',
    phone: '+998901112233',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    fullName: 'Dilnoza Karimova',
    status: 'exam_ready',
    createdAt: new Date().toISOString(),
  },
]

export async function fetchStudents(): Promise<ApiListResponse<Student>> {
  return { data: mockStudents, total: mockStudents.length }
}
