import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {
  PATH_PREFIX,
  PATH_PREFIX_V2,
} from './src/utils/appvariables.js'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

function apiProxyTarget(baseUrl: string): { target: string; secure: boolean } {
  try {
    const parsed = new URL(baseUrl)
    return {
      target: parsed.origin,
      secure: parsed.protocol === 'https:',
    }
  } catch {
    return { target: 'http://back.intalim.uz', secure: false }
  }
}

const v1Proxy = apiProxyTarget(PATH_PREFIX)
const v2Proxy = apiProxyTarget(PATH_PREFIX_V2)
/** Deploy bridge va Vite — bir xil appvariables origin. */
const bridgeBackend = v2Proxy.target

function buildHtaccess(): string {
  return `# Generated from appvariables — API → api-bridge.php → ${bridgeBackend}
# SSLProxyEngine ishlatilmaydi (shared Apache 500).
# Lokal \`npm run dev\` bu faylni ishlatmaydi (Vite proxy).

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteRule ^v2/api/(.*)$ api-bridge.php?__path=v2/api/$1 [L,QSA]
  RewriteRule ^api/(.*)$ api-bridge.php?__path=api/$1 [L,QSA]

  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`
}

function buildApiBridgePhp(backendOrigin: string): string {
  const templatePath = path.join(rootDir, 'scripts', 'api-bridge.php.template')
  const template = fs.readFileSync(templatePath, 'utf8')
  return template.replaceAll('__BACKEND__', backendOrigin)
}

const proxy = {
  '/v2/api': {
    target: v2Proxy.target,
    changeOrigin: true,
    secure: v2Proxy.secure,
  },
  '/api': {
    target: v1Proxy.target,
    changeOrigin: true,
    secure: v1Proxy.secure,
  },
} as const

/** Buildda `.htaccess` + `api-bridge.php` ni appvariables origin bilan yozadi. */
function deployProxyFromAppvariables(): Plugin {
  return {
    name: 'deploy-proxy-from-appvariables',
    closeBundle() {
      const outDir = path.resolve(rootDir, 'dist')
      if (!fs.existsSync(outDir)) return

      const htaccess = buildHtaccess()
      const bridge = buildApiBridgePhp(bridgeBackend)

      fs.writeFileSync(path.join(outDir, '.htaccess'), htaccess, 'utf8')
      fs.writeFileSync(path.join(outDir, 'api-bridge.php'), bridge, 'utf8')
      fs.writeFileSync(path.join(rootDir, 'public', '.htaccess'), htaccess, 'utf8')
      fs.writeFileSync(path.join(rootDir, 'public', 'api-bridge.php'), bridge, 'utf8')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), deployProxyFromAppvariables()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  server: {
    proxy: { ...proxy },
  },
  preview: {
    proxy: { ...proxy },
  },
})
