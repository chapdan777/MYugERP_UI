/// <reference types="vite/client" />

/**
 * Типы переменных окружения приложения
 */
interface ImportMetaEnv {
  /** URL API сервера */
  readonly VITE_API_URL: string;
  /** URL WebSocket сервера */
  readonly VITE_WS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
