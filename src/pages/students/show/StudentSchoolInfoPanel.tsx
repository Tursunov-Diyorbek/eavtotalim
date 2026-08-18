import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil } from 'lucide-react'
import { Button, DetailList, Input, Panel, notify } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { useUpdateStudentSchoolInfoMutation } from '@/features/students'
import type { StudentItem } from '@/types/student'

export function StudentSchoolInfoPanel({ student }: { student: StudentItem }) {
  const { t } = useTranslation()
  const { hasPermission } = useAuth()
  const canEdit = hasPermission('update-student')
  const mutation = useUpdateStudentSchoolInfoMutation(String(student.id))
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    school_address: student.school_address ?? '',
    school_number: student.school_number ?? '',
    school_graduation_year: student.school_graduation_year
      ? String(student.school_graduation_year)
      : '',
    school_certificate_number: student.school_certificate_number ?? '',
  })

  useEffect(() => {
    setForm({
      school_address: student.school_address ?? '',
      school_number: student.school_number ?? '',
      school_graduation_year: student.school_graduation_year
        ? String(student.school_graduation_year)
        : '',
      school_certificate_number: student.school_certificate_number ?? '',
    })
  }, [student])

  const save = () => {
    const year = form.school_graduation_year.trim()
    mutation.mutate(
      {
        school_address: form.school_address.trim() || null,
        school_number: form.school_number.trim() || null,
        school_graduation_year: year ? Number(year) : null,
        school_certificate_number: form.school_certificate_number.trim() || null,
      },
      {
        onSuccess: () => {
          notify.success(t('common.saved'))
          setEditing(false)
        },
        onError: (err) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

  return (
    <Panel padding="md">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-deep">
        {t('students.showPage.schoolInfo')}
      </p>
      {editing ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label={t('students.showPage.schoolAddress')}
              value={form.school_address}
              maxLength={255}
              onChange={(e) => setForm((prev) => ({ ...prev, school_address: e.target.value }))}
            />
            <Input
              label={t('students.showPage.schoolNumber')}
              value={form.school_number}
              maxLength={100}
              onChange={(e) => setForm((prev) => ({ ...prev, school_number: e.target.value }))}
            />
            <Input
              label={t('students.showPage.schoolYear')}
              type="number"
              value={form.school_graduation_year}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, school_graduation_year: e.target.value }))
              }
            />
            <Input
              label={t('students.showPage.schoolCert')}
              value={form.school_certificate_number}
              maxLength={50}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, school_certificate_number: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(false)}
              disabled={mutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" loading={mutation.isPending} onClick={save}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <DetailList
            className="sm:grid-cols-2 lg:grid-cols-2"
            items={[
              {
                label: t('students.showPage.schoolAddress'),
                value: student.school_address || '—',
              },
              {
                label: t('students.showPage.schoolNumber'),
                value: student.school_number || '—',
              },
              {
                label: t('students.showPage.schoolYear'),
                value: student.school_graduation_year
                  ? String(student.school_graduation_year)
                  : '—',
              },
              {
                label: t('students.showPage.schoolCert'),
                value: student.school_certificate_number || '—',
              },
            ]}
          />
          {canEdit ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-3.5" aria-hidden />
              {t('common.edit')}
            </Button>
          ) : null}
        </>
      )}
    </Panel>
  )
}
