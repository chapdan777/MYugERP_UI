/**
 * @file Типы данных для управления номенклатурой
 * @description Определяет интерфейсы и типы для работы с продуктами/товарами
 */

/**
 * Интерфейс продукта (соответствует ProductResponseDto из бэкенда)
 */
export interface Product {
  id: number;
  name: string;
  code: string;
  category: string;
  description: string | null;
  basePrice: number;
  unit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Интерфейс для создания продукта (соответствует CreateProductDto из бэкенда)
 */
export interface CreateProductInput {
  name: string;
  code?: string;
  category: string;
  description?: string;
  basePrice: number;
  unit: string;
}

/**
 * Интерфейс для обновления продукта (соответствует UpdateProductRequestDto из бэкенда)
 */
export interface UpdateProductInput {
  name?: string;
  description?: string;
  basePrice?: number;
  unit?: string;
  category?: string;
}