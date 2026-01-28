/**
 * Типы для сущности Property Header (Шапка свойств)
 */

/**
 * Интерфейс шапки свойств
 */
export interface PropertyHeader {
  id: number;
  name: string;
  orderTypeId: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Интерфейс элемента шапки свойств (только связь со свойством, без значения)
 */
export interface PropertyHeaderItem {
  headerId: number;
  propertyId: number;
  sortOrder?: number;
  createdAt: string;
}

/**
 * Интерфейс продукта в шапке свойств
 */
export interface PropertyHeaderProduct {
  headerId: number;
  productId: number;
  createdAt: string;
}

/**
 * Интерфейс для создания шапки свойств
 */
export interface CreatePropertyHeaderInput {
  name: string;
  orderTypeId: number;
  description?: string;
}

/**
 * Интерфейс для обновления шапки свойств
 */
export interface UpdatePropertyHeaderInput {
  name?: string;
  description?: string;
}

/**
 * Интерфейс для добавления элемента в шапку (только свойство)
 */
export interface AddItemToHeaderInput {
  propertyId: number;
  sortOrder?: number;
}

/**
 * Интерфейс для добавления продукта в шапку
 */
export interface AddProductToHeaderInput {
  productId: number;
}

/**
 * Интерфейс для обновления элемента шапки (сортровка)
 */
export interface UpdateItemInHeaderInput {
  sortOrder?: number;
}