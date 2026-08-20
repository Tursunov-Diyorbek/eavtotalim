import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Copy, Eye, EyeOff, LogIn, RefreshCw } from 'lucide-react'
import {
  HttpError,
  fetchUserPassword,
  loginRequest,
  regenerateUserCredentials,
} from '@/api'
import { Button, ConfirmDialog, Modal, Skeleton, notify } from '@/components/ui'
import { getHomePathByRole } from '@/config/access'
import { useAuth } from '@/features/auth'
import { asFio } from '@/lib/apiPage'
import { saveAuthSession } from '@/lib/authStorage'
import type { StudentItem } from '@/types/student'

type StudentAccessModalProps = {
  open: boolean
  onClose: () => void
  student: Pick<
    StudentItem,
    'id' | 'user_id' | 'last_name' | 'first_name' | 'middle_name'
  > | null
}

/** Eski ShowPasswordRN + SignIn: login/parol va avtomatik kirish. */
export function StudentAccessModal({
  open,
  onClose,
  student,
}: StudentAccessModalProps) {
  const { t } = useTranslation()
  const { setSessionFromLogin } = useAuth()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [regenerateOpen, setRegenerateOpen] = useState(false)
  const [credentials, setCredentials] = useState<{
    username?: string | null
    password?: string | null
  } | null>(null)

  const passwordMutation = useMutation({
    mutationFn: () => fetchUserPassword(String(student?.user_id)),
    onSuccess: (data) => setCredentials(data),
    onError: (err: Error) => {
      setCredentials(null)
      notify.error(err.message || t('common.loadError'))
    },
  })

  const regenerateMutation = useMutation({
    mutationFn: () =>
      regenerateUserCredentials({
        user_id: student?.user_id ?? null,
        profession_id: student?.user_id == null ? student?.id ?? null : null,
        profession_type: student?.user_id == null ? 'student' : null,
      }),
    onSuccess: (data) => {
      setCredentials(data)
      notify.success(t('common.saved'))
    },
    onError: (err: Error) => notify.error(err.message || t('common.loadError')),
  })

  const loginMutation = useMutation({
    mutationFn: async () => {
      const username = credentials?.username?.trim()
      const password = credentials?.password
      if (!username || !password) {
        throw new Error(t('students.showPage.noCredentials'))
      }
      return loginRequest(username, password)
    },
    onSuccess: async (data) => {
      saveAuthSession(data)
      const me = await setSessionFromLogin(data.access_token)
      notify.success(t('students.showPage.autoLoginOk'))
      onClose()
      window.location.assign(getHomePathByRole(me.user.role, me.user))
    },
    onError: (err: unknown) => {
      const message =
        err instanceof HttpError
          ? err.message
          : err instanceof Error
            ? err.message
            : t('login.errors.failed')
      notify.error(message)
    },
  })

  useEffect(() => {
    if (!open || !student) {
      setCredentials(null)
      setPasswordVisible(false)
      return
    }
    if (student.user_id != null) {
      passwordMutation.mutate()
    } else {
      setCredentials(null)
    }
    // student obyekti har renderda yangi — faqat id
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, student?.id, student?.user_id])

  const copyCredentials = async () => {
    try {
      await navigator.clipboard.writeText(
        `Login: ${credentials?.username ?? ''}\nParol: ${credentials?.password ?? ''}`,
      )
      notify.success(t('students.showPage.copiedCredentials'))
    } catch {
      notify.error(t('students.showPage.copyFailed'))
    }
  }

  const canLogin = Boolean(credentials?.username && credentials?.password)

  return (
    <>
      <Modal
        open={open && Boolean(student)}
        onClose={onClose}
        title={t('students.showPage.loginAccounts')}
        sizeClassName="max-w-md"
      >
        <p className="text-center font-display text-sm font-semibold uppercase text-deep">
          {asFio(student)}
        </p>
        <p className="mt-2 text-center text-sm text-muted">
          {t('students.showPage.loginWelcome')}
        </p>
        {passwordMutation.isPending ? (
          <div className="mt-4 space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-mist/80">
            <div className="px-4 py-3 text-sm">
              <span className="text-muted">{t('login.login')}: </span>
              <span className="font-semibold text-signal">
                {credentials?.username || '—'}
              </span>
            </div>
            <div className="flex items-center gap-2 border-t border-mist/80 px-4 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <span className="text-muted">{t('login.password')}: </span>
                <span className="font-semibold text-signal">
                  {passwordVisible ? credentials?.password || '—' : '••••••'}
                </span>
              </div>
              <Button
                variant="soft"
                size="sm"
                onClick={() => setPasswordVisible((v) => !v)}
              >
                {passwordVisible ? (
                  <EyeOff className="size-3.5" aria-hidden />
                ) : (
                  <Eye className="size-3.5" aria-hidden />
                )}
                {passwordVisible
                  ? t('login.hidePassword')
                  : t('login.showPassword')}
              </Button>
            </div>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void copyCredentials()}>
            <Copy className="size-3.5" aria-hidden />
            {t('students.showPage.copyCredentials')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            loading={regenerateMutation.isPending}
            onClick={() => setRegenerateOpen(true)}
          >
            <RefreshCw className="size-3.5" aria-hidden />
            {t('students.showPage.regenerateCredentials')}
          </Button>
        </div>
        <Button
          variant="primary"
          size="md"
          className="mt-3 w-full"
          disabled={!canLogin}
          loading={loginMutation.isPending}
          title={t('students.showPage.autoLoginTitle')}
          onClick={() => loginMutation.mutate()}
        >
          <LogIn className="size-4" aria-hidden />
          {t('students.showPage.autoLogin')}
        </Button>
      </Modal>

      <ConfirmDialog
        open={regenerateOpen}
        onClose={() => setRegenerateOpen(false)}
        title={t('students.showPage.regenerateTitle')}
        confirmLabel={t('students.showPage.regenerateCredentials')}
        onConfirm={() => {
          setRegenerateOpen(false)
          regenerateMutation.mutate()
        }}
        loading={regenerateMutation.isPending}
      />
    </>
  )
}
