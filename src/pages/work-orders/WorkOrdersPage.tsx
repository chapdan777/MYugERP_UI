import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Chip, CircularProgress } from '@mui/material';
import { WorkOrdersTable } from '../../features/manage-work-orders/ui/WorkOrdersTable';
import { useWorkOrders } from '../../features/manage-work-orders/model/work-orders.hooks';
import { useWorkOrderStatuses } from '../../features/manage-work-order-statuses';

import { MainLayout } from '@widgets/layout';

export const WorkOrdersPage = () => {
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const { statuses, isLoading: isLoadingStatuses } = useWorkOrderStatuses();

    // Convert 'ALL' filter to undefined for API

    const { workOrders, isLoading, isError } = useWorkOrders({
        status: statusFilter === 'ALL' ? undefined : statusFilter as any,
    });

    const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
        setStatusFilter(newValue);
    };

    // Filter active statuses and sort by sortOrder
    const activeStatuses = statuses
        .filter(s => s.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);

    // Get status color for badge
    const getStatusColor = (statusCode: string): string => {
        const status = statuses.find(s => s.code === statusCode);
        return status?.color || '#808080';
    };

    // Count work orders by status
    const getStatusCount = (statusCode: string): number => {
        return workOrders.filter(wo => wo.status === statusCode).length;
    };

    // Get status name for display
    const getStatusName = (statusCode: string): string => {
        const status = statuses.find(s => s.code === statusCode);
        return status?.name || statusCode;
    };

    return (
        <MainLayout>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Заказ-наряды
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    {isLoadingStatuses ? (
                        <CircularProgress size={24} sx={{ m: 2 }} />
                    ) : (
                        <Tabs
                            value={statusFilter}
                            onChange={handleTabChange}
                            aria-label="work order status tabs"
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        Все
                                        <Chip size="small" label={workOrders.length} />
                                    </Box>
                                }
                                value="ALL"
                            />
                            {activeStatuses.map(status => (
                                <Tab
                                    key={status.id}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    backgroundColor: status.color,
                                                }}
                                            />
                                            {status.name}
                                            <Chip
                                                size="small"
                                                label={getStatusCount(status.code)}
                                                sx={{
                                                    minWidth: 28,
                                                    backgroundColor: statusFilter === status.code ? status.color : undefined,
                                                    color: statusFilter === status.code ? '#fff' : undefined,
                                                }}
                                            />
                                        </Box>
                                    }
                                    value={status.code}
                                />
                            ))}
                        </Tabs>
                    )}
                </Box>

                {isError && (
                    <Typography color="error">Ошибка загрузки данных</Typography>
                )}

                <WorkOrdersTable
                    workOrders={statusFilter === 'ALL' ? workOrders : workOrders.filter(wo => wo.status === statusFilter)}
                    isLoading={isLoading}
                    getStatusColor={getStatusColor}
                    getStatusName={getStatusName}
                />
            </Box>
        </MainLayout>
    );
};
