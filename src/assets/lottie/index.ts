import tariff from './tariff.json'
import info from './info.json'
import outOfLimit from './out-of-limit.json'
import fillingDocument from './filling-document.json'
import applyDocument from './apply-document.json'
import smsConfirmation from './sms-confirmation.json'
import login from './login.json'

/** Eski `assets/images/lottie` — yangi loyiha uchun. */
export const lottieAnimations = {
  tariff,
  info,
  outOfLimit,
  fillingDocument,
  applyDocument,
  smsConfirmation,
  login,
} as const

export type LottieAnimationKey = keyof typeof lottieAnimations
