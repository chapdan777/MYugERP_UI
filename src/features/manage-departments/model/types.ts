/**
 * @file Типы данных для управления производственными участками
 */

/**
 * Стратегия группировки позиций в задании
 */
export type GroupingStrategy = 'BY_ORDER' | 'BY_BATCH' | 'BY_MATERIAL';

/**
 * Метки для стратегий группировки
 */
export const GROUPING_STRATEGY_LABELS: Record<GroupingStrategy, string> = {
    'BY_ORDER': 'По заказам',
    'BY_BATCH': 'Партиями',
    'BY_MATERIAL': 'По материалу',
};

/**
 * Производственный участок
 */
export interface ProductionDepartment {
    id: number;
    code: string;
    name: string;
    description: string | null;
    groupingStrategy: GroupingStrategy;
    groupingPropertyId: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Связь участка с операцией
 */
export interface DepartmentOperation {
    id: number;
    departmentId: number;
    operationId: number;
    operationName?: string; // from backend join
    operationCode?: string; // from backend join
    priority: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * DTO для создания участка
 */
export interface CreateProductionDepartmentDto {
    code: string;
    name: string;
    description?: string | null;
    groupingStrategy?: GroupingStrategy;
    groupingPropertyId?: number | null;
    isActive?: boolean;
}

/**
 * DTO для обновления участка
 */
export interface UpdateProductionDepartmentDto {
    name?: string;
    description?: string | null;
    groupingStrategy?: GroupingStrategy;
    groupingPropertyId?: number | null;
    isActive?: boolean;
}

/**
 * DTO для добавления операции к участку
 */
export interface CreateDepartmentOperationDto {
    departmentId: number;
    operationId: number;
    priority?: number;
    isActive?: boolean;
}

/**
 * DTO для обновления связи операции с участком
 */
export interface UpdateDepartmentOperationDto {
    priority?: number;
    isActive?: boolean;
}
