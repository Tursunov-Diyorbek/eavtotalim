export { routes, APP_NAME, type AppRoute } from './routes'
export {
  env,
  PATH_PREFIX,
  PATH_PREFIX_V2,
  PATH_PREFIX_FILE,
  IS_PROD,
} from './env'
export {
  PAGE_ACCESS,
  ROLE_CODE,
  getHomePathByRole,
  getFirstAllowedPath,
  type PageAccessKey,
} from './access'
export { MAIN_NAV, NAV_TONE, type NavItem, type NavTone } from './nav'
export { ROLE_META, TONE_CLASS, getRoleMeta, type RoleTone } from './roles'
