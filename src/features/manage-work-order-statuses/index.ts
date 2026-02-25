/**
 * @file Публичное API модуля управления статусами ЗН
 */

export { StatusesTable } from './ui/StatusesTable';
export { StatusForm } from './ui/StatusForm';
export {
    useWorkOrderStatuses,
    useCreateWorkOrderStatus,
    useUpdateWorkOrderStatus,
    useDeleteWorkOrderStatus,
} from './model/statuses.hooks';
export type { WorkOrderStatus, CreateWorkOrderStatusDto, UpdateWorkOrderStatusDto } from './model/types';
