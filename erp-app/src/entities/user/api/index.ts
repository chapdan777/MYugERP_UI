/**
 * API хуки для работы с пользователями
 */
import useSWR from 'swr';
import { apiClient, swrFetcher, type PaginatedResponse, type PaginationParams } from '@shared/api';
import type { User, CreateUserDto, UpdateUserDto, LoginCredentials, AuthResponse } from '../model';

/**
 * Хук для получения текущего пользователя
 */
export const useCurrentUser = () => {
  return useSWR<User>('/auth/me', swrFetcher, {
    revalidateOnFocus: false,
  });
};

/**
 * Хук для получения списка пользователей
 */
export const useUsers = (params?: PaginationParams & { role?: string }) => {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.search) searchParams.set('search', params.search);
  if (params?.role) searchParams.set('role', params.role);

  const queryString = searchParams.toString();
  const url = queryString ? `/users?${queryString}` : '/users';

  return useSWR<PaginatedResponse<User>>(url, swrFetcher);
};

/**
 * Хук для получения пользователя по ID
 */
export const useUser = (id: number | null) => {
  return useSWR<User>(id ? `/users/${id}` : null, swrFetcher);
};

/**
 * Функция входа в систему
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

/**
 * Функция выхода из системы
 */
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

/**
 * Функция создания пользователя
 */
export const createUser = async (data: CreateUserDto): Promise<User> => {
  const response = await apiClient.post<User>('/users', data);
  return response.data;
};

/**
 * Функция обновления пользователя
 */
export const updateUser = async (id: number, data: UpdateUserDto): Promise<User> => {
  const response = await apiClient.put<User>(`/users/${id}`, data);
  return response.data;
};

/**
 * Функция удаления пользователя
 */
export const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(`/users/${id}`);
};
