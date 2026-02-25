/**
 * @file Публичное API модуля управления операциями
 * @description Экспортирует компоненты и хуки для работы с операциями
 */

export { OperationsTable } from './ui/OperationsTable';
export { OperationForm } from './ui/OperationForm';
export {
    useOperations,
    useActiveOperations,
    useOperation,
    useCreateOperation,
    useUpdateOperation,
    useDeleteOperation,
} from './model/operations.hooks';
export type { Operation, CreateOperationDto, UpdateOperationDto, OperationCalculationType } from './model/types';
export { CALCULATION_TYPE_LABELS, CALCULATION_TYPES } from './model/types';
