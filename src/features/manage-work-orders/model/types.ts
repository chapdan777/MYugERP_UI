/**
 * @file Типы данных для управления заказ-нарядами (ЗН)
 * @description Определяет интерфейсы и типы для работы с ЗН
 */

/**
 * Статусы заказ-наряда
 */
export type WorkOrderStatus =
    | 'PLANNED'
    | 'ASSIGNED'
    | 'IN_PROGRESS'
    | 'QUALITY_CHECK'
    | 'COMPLETED'
    | 'CANCELLED';

/**
 * Позиция заказ-наряда (Item)
 */
export interface WorkOrderItemResponseDto {
    id: number;
    orderItemId: number;
    productId: number;
    productName: string;
    operationId: number;
    operationName: string;
    quantity: number;
    unit: string;
    estimatedHours: number;
    pieceRate: number;
    actualHours: number | null;
    calculatedMaterials?: {
        materials: any[];
        dimensions?: {
            width: number;
            height: number;
            depth: number;
        };
    };
}

/**
 * Заказ-наряд (Work Order)
 */
export interface WorkOrderResponseDto {
    id: number;
    workOrderNumber: string;
    orderId: number;
    orderNumber: string;
    departmentId: number;
    departmentName: string;
    operationId: number;
    operationName: string;
    status: string; // Dynamic status from dictionary
    priority: number;
    effectivePriority: number;
    priorityOverride: number | null;
    priorityOverrideReason: string | null;
    deadline: string | null; // ISO Date string
    assignedAt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    items: WorkOrderItemResponseDto[];
    totalEstimatedHours: number;
    totalActualHours: number | null;
    totalPieceRatePayment: number;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Параметры фильтрации списка ЗН
 */
export interface WorkOrderListQuery {
    orderId?: number;
    departmentId?: number;
    status?: string;
    minPriority?: number;
    maxPriority?: number;
}
