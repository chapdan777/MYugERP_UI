/**
 * Базовый HTTP клиент для API запросов
 */
import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { config } from '@shared/config';

/**
 * Создание экземпляра axios с базовыми настройками
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: config.apiUrl,
    timeout: 30000, // Увеличенный таймаут до 30 секунд для медленных соединений
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Интерцептор запросов для добавления токена авторизации
  client.interceptors.request.use(
    (requestConfig: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('accessToken');
      if (token && requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
      return requestConfig;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Интерцептор ответов для обработки ошибок и обновления токена
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      // Логика повторных попыток для сетевых ошибок
      const originalRequest = error.config as InternalAxiosRequestConfig & { 
        _retry?: boolean; 
        _retryCount?: number 
      };
      
      // Повторяем только при сетевых ошибках (таймаут, ECONNABORTED) и не более 3 раз
      if ((error.code === 'ECONNABORTED' || error.message?.includes('timeout')) 
          && !originalRequest._retry && (originalRequest._retryCount || 0) < 3) {
        
        originalRequest._retry = true;
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        
        console.log(`🔁 Повторная попытка запроса (${originalRequest._retryCount}/3)...`);
        
        // Задержка перед повторной попыткой (увеличивается с каждой попыткой)
        await new Promise(resolve => setTimeout(resolve, 1000 * originalRequest._retryCount!));
        
        return client(originalRequest);
      }

      // Если получили 401 и это не повторный запрос

      // Если получили 401 и это не повторный запрос
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('Отсутствует refresh token');
          }

          const response = await axios.post<{ accessToken: string; refreshToken: string }>(
            `${config.apiUrl}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return client(originalRequest);
        } catch {
          // Ошибка обновления токена - перенаправляем на страницу входа
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

/**
 * Экземпляр API клиента для использования в приложении
 */
export const apiClient = createApiClient();

/**
 * Типизированный fetcher для SWR
 */
export const swrFetcher = async <T>(url: string): Promise<T> => {
  const response = await apiClient.get<T>(url);
  return response.data;
};
