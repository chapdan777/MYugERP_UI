/**
 * @file Типы данных для справочника статусов заказ-нарядов
 */

/**
 * Статус заказ-наряда
 */
export interface WorkOrderStatus {
    id: number;
    code: string;
    name: string;
    color: string;
    sortOrder: number;
    isInitial: boolean;
    isFinal: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * DTO для создания статуса
 */
export interface CreateWorkOrderStatusDto {
    code: string;
    name: string;
    color?: string;
    sortOrder?: number;
    isInitial?: boolean;
    isFinal?: boolean;
    isActive?: boolean;
}

/**
 * DTO для обновления статуса
 */
export interface UpdateWorkOrderStatusDto {
    name?: string;
    color?: string;
    sortOrder?: number;
    isInitial?: boolean;
    isFinal?: boolean;
    isActive?: boolean;
}
