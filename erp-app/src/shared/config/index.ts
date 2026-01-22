/**
 * Конфигурация приложения
 */
export const config = {
  /** Базовый URL API сервера */
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3003/api',

  /** URL WebSocket сервера */
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3003/ws',

  /** Размер страницы по умолчанию для пагинации */
  defaultPageSize: 20,

  /** Версия приложения */
  appVersion: '1.0.0',

  /** Название приложения */
  appName: 'МАССИВ-ЮГ ERP',
} as const;