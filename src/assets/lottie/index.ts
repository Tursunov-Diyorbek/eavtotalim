import tariff from './tariff.json'
import info from './info.json'
import outOfLimit from './out-of-limit.json'
import fillingDocument from './filling-document.json'
import applyDocument from './apply-document.json'
import smsConfirmation from './sms-confirmation.json'
import login from './login.json'
import roadEmblem from './road-emblem.json'
import tableLoader from './table-loader.json'
import message from './message.json'
/** Kenyang Bersama Studio, Lottie Simple License — https://lottiefiles.com/free-animation/new-message-notification-BoatheccpQ */
import newMessage from './new-message.json'

/** Eski `assets/images/lottie` — yangi loyiha uchun. */
export const lottieAnimations = {
  tariff,
  info,
  outOfLimit,
  fillingDocument,
  applyDocument,
  smsConfirmation,
  login,
  roadEmblem,
  tableLoader,
  message,
  newMessage,
} as const

export type LottieAnimationKey = keyof typeof lottieAnimations
