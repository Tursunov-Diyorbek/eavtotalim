export const PATH_PREFIX_INTALIM_TEST_FILES =
  "https://back.eavtotalim.uz/test_files/";
export const PATH_PREFIX_FILE_WITHOUT_SLESH = "https://back.eavtotalim.uz";
export const PATH_PREFIX_TEST_FILE = "https://back.eavtotalim.uz/";
export const TELEGRAM_PATH = "https://t.me/Uzb1511";
export const NODEJS_SOCKET_URL = "https://socket.eavtotalim.uz/";

// Nusxa: cp src/utils/appvariables.example.js src/utils/appvariables.js
// Qaysi blok ochiq — `npm run dev` VA `npm run build` shu backend (Vite + .htaccess).
// HTTPS staging: env.ts → /api|/v2/api; build .htaccess appvariables originiga proxy.

//Frontend uchun prod

// export const PATH_PREFIX_FILE = "https://back.eavtotalim.uz/";
// export const PATH_PREFIX = "https://back.eavtotalim.uz/api";
// export const PATH_PREFIX_V2 = "https://back.eavtotalim.uz/v2/api";
// export const IS_PROD = true

//Frontend uchun dev

export const PATH_PREFIX_V2 = "http://back.intalim.uz/v2/api";
export const PATH_PREFIX = "http://back.intalim.uz/api";
export const PATH_PREFIX_FILE = "http://back.intalim.uz/";
export const IS_PROD = false;
