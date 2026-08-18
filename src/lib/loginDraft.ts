const LOGIN_DRAFT_KEY = 'eav_login_draft'

export type LoginDraft = {
  login: string
  password: string
}

/** Logout auth sessiyani o‘chiradi, lekin draft qoladi (shu tab). */
export function saveLoginDraft(login: string, password: string) {
  try {
    sessionStorage.setItem(
      LOGIN_DRAFT_KEY,
      JSON.stringify({ login, password } satisfies LoginDraft),
    )
  } catch {
    // quota / private mode
  }
}

export function getLoginDraft(): LoginDraft {
  try {
    const raw = sessionStorage.getItem(LOGIN_DRAFT_KEY)
    if (!raw) return { login: '', password: '' }
    const parsed = JSON.parse(raw) as Partial<LoginDraft>
    return {
      login: typeof parsed.login === 'string' ? parsed.login : '',
      password: typeof parsed.password === 'string' ? parsed.password : '',
    }
  } catch {
    return { login: '', password: '' }
  }
}
