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
  defaultLength: number | null;
  defaultWidth: number | null;
  defaultDepth: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Интерфейс для создания продукта (соответствует CreateProductDto из бэкенда)
 */
export interface CreateProductInput {
  name: string;
  code: string; // Changed from optional to required based on user's snippet
  category: string;
  description?: string;
  basePrice: number;
  unit: string;
  defaultLength?: number;
  defaultWidth?: number;
  defaultDepth?: number;
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

export interface OperationMaterial {
  materialId: number;
  consumptionFormula: string;
  unit?: string;
}

export interface RouteStep {
  id: number;
  stepNumber: number;
  operationId: number;
  isRequired: boolean;
  materials: OperationMaterial[];
}

export interface TechnologicalRoute {
  id: number;
  productId: number;
  name: string;
  description?: string;
  isActive: boolean;
  steps: RouteStep[];
}

export interface CreateOperationMaterialInput {
  materialId: number;
  consumptionFormula: string;
  unit?: string;
}

export interface CreateRouteStepInput {
  stepNumber: number;
  operationId: number;
  isRequired: boolean;
  materials?: CreateOperationMaterialInput[];
}

export interface CreateTechnologicalRouteInput {
  productId: number;
  name: string;
  description?: string;
  steps: CreateRouteStepInput[];
}