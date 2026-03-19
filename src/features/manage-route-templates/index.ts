/**
 * @file Публичный API фичи manage-route-templates
 */
export { RouteTemplatesTable } from './ui/RouteTemplatesTable';
export { RouteTemplateForm } from './ui/RouteTemplateForm';
export { useRouteTemplates, useCreateRouteTemplate, useUpdateRouteTemplate, useDeleteRouteTemplate } from './model/hooks';
export type { RouteTemplate, CreateRouteTemplateInput } from './model/types';
