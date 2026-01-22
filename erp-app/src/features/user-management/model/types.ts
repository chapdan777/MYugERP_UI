/**
 * @file Типы данных для управления пользователями
 * @description Определяет интерфейсы и типы для работы с пользователями
 */

/**
 * Тип ролей пользователя
 */
export type UserRole = 'admin' | 'manager' | 'worker' | 'client';

/**
 * Интерфейс пользователя
 */
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

/**
 * Интерфейс для создания пользователя
 */
export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  metadata?: Record<string, any>;
}

/**
 * Интерфейс для обновления пользователя
 */
export interface UpdateUserInput {
  fullName?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  metadata?: Record<string, any>;
}