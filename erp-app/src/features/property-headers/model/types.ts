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
 * Интерфейс элемента шапки свойств
 */
export interface PropertyHeaderItem {
  headerId: number;
  propertyId: number;
  value: string;
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
 * Интерфейс для добавления элемента в шапку
 */
export interface AddItemToHeaderInput {
  propertyId: number;
  value: string;
}