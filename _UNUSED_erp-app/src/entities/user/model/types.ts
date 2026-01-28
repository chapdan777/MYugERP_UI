/**
 * Типы для сущности пользователя
 */

/** Роли пользователей в системе */
export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer';

/**
 * Пользователь системы
 */
export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * DTO для создания пользователя
 */
export interface CreateUserDto {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
}

/**
 * DTO для обновления пользователя
 */
export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  role?: UserRole;
  phone?: string;
  isActive?: boolean;
}

/**
 * Данные для входа в систему
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Ответ на успешную аутентификацию
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
