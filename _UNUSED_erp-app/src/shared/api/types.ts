/**
 * Общие типы для API ответов
 */

/**
 * Обёртка ответа API
 */
export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

/**
 * Пагинированный ответ API
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

/**
 * Метаданные пагинации
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

/**
 * Ответ об ошибке API
 */
export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  details?: unknown;
  timestamp: string;
  path: string;
}

/**
 * Параметры пагинации для запросов
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}
