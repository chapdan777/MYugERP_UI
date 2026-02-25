/**
 * @file Типы данных для управления свойствами
 * @description Определяет интерфейсы и типы для работы с дополнительными свойствами
 */

/**
 * Тип данных свойства
 */
export type PropertyDataType = 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date';

/**
 * Интерфейс свойства
 */
export interface Property {
  id: number;
  code: string;
  name: string;
  description?: string;
  dataType: PropertyDataType;
  possibleValues?: string[];
  defaultValue?: string;
  isRequired: boolean;
  isEditable: boolean;
  isActive: boolean;
  displayOrder: number;
  variableName?: string;
  targetEntity: 'product' | 'order' | 'user';
  createdAt: string;
  updatedAt: string;
}

/**
 * Интерфейс для создания свойства
 */
export interface CreatePropertyInput {
  code: string;
  name: string;
  description?: string;
  variableName?: string;
  dataType: PropertyDataType;
  possibleValues?: string[];
  defaultValue?: string;
  isRequired: boolean;
  isEditable?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  targetEntity: 'product' | 'order' | 'user';
}

/**
 * Интерфейс для обновления свойства
 */
export interface UpdatePropertyInput {
  code?: string;
  name?: string;
  description?: string;
  variableName?: string;
  dataType?: PropertyDataType;
  possibleValues?: string[];
  defaultValue?: string;
  isRequired?: boolean;
  isEditable?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  targetEntity?: 'product' | 'order' | 'user';
}