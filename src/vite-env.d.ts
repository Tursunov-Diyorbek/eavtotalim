/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string
  readonly VITE_PATH_PREFIX?: string
  readonly VITE_PATH_PREFIX_V2?: string
  readonly VITE_PATH_PREFIX_FILE?: string
  readonly VITE_PATH_PREFIX_FILE_HOST?: string
  /** "true" | "false" */
  readonly VITE_IS_PROD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
