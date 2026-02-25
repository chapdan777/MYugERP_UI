/**
 * @file Типы данных для управления производственными операциями
 * @description Определяет интерфейсы и типы для работы с операциями
 */

/**
 * Тип расчёта производственной операции
 */
export type OperationCalculationType =
    | 'PER_PIECE'
    | 'PER_SQM'
    | 'PER_LM'
    | 'PER_PERIMETER'
    | 'FIXED';

/**
 * Словарь отображаемых названий типов расчёта
 */
export const CALCULATION_TYPE_LABELS: Record<OperationCalculationType, string> = {
    'PER_PIECE': 'За штуку',
    'PER_SQM': 'За м²',
    'PER_LM': 'За погонный метр',
    'PER_PERIMETER': 'За периметр',
    'FIXED': 'Фиксированная',
};

/**
 * Массив типов расчёта для селектов
 */
export const CALCULATION_TYPES = [
    'PER_PIECE',
    'PER_SQM',
    'PER_LM',
    'PER_PERIMETER',
    'FIXED',
] as const;

/**
 * Производственная операция
 */
export interface Operation {
    id: number;
    code: string;
    name: string;
    description: string | null;
    calculationType: OperationCalculationType;
    defaultTimePerUnit: number;
    defaultRatePerUnit: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * DTO для создания операции
 */
export interface CreateOperationDto {
    code: string;
    name: string;
    description?: string | null;
    calculationType?: OperationCalculationType;
    defaultTimePerUnit?: number;
    defaultRatePerUnit?: number;
    isActive?: boolean;
}

/**
 * DTO для обновления операции
 */
export interface UpdateOperationDto {
    name?: string;
    description?: string | null;
    calculationType?: OperationCalculationType;
    defaultTimePerUnit?: number;
    defaultRatePerUnit?: number;
    isActive?: boolean;
}
