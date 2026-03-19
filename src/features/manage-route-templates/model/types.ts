/**
 * @file Типы для шаблонов маршрутов
 */
import type { RouteStep, CreateRouteStepInput } from '../../manage-products/model/types';

/**
 * Шаблон маршрута для отображения
 */
export interface RouteTemplate {
  id: number;
  productId: number;
  name: string;
  description?: string;
  isActive: boolean;
  isTemplate: boolean;
  steps: RouteStep[];
}

/**
 * Данные для создания шаблона
 */
export interface CreateRouteTemplateInput {
  productId: number;
  name: string;
  description?: string;
  isTemplate: boolean;
  steps: CreateRouteStepInput[];
}
