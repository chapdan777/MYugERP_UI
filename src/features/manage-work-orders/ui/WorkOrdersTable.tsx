import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    Typography,
    Box,
    alpha,
} from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../../../shared/ui';
import type { WorkOrderResponseDto } from '../model/types';

interface WorkOrdersTableProps {
    workOrders: WorkOrderResponseDto[];
    isLoading: boolean;
    getStatusColor?: (statusCode: string) => string;
    getStatusName?: (statusCode: string) => string;
}

const getPriorityColor = (priority: number): string => {
    if (priority >= 9) return '#ef4444';
    if (priority >= 7) return '#f97316';
    if (priority >= 5) return '#eab308';
    return '#22c55e';
};

export const WorkOrdersTable: React.FC<WorkOrdersTableProps> = ({
    workOrders,
    isLoading,
    getStatusColor,
    getStatusName,
}) => {
    const navigate = useNavigate();

    if (isLoading) {
        return <Typography sx={{ color: 'text.secondary', p: 3 }}>Загрузка...</Typography>;
    }

    if (workOrders.length === 0) {
        return (
            <GlassCard>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography sx={{ color: 'text.secondary' }}>Нет активных заказ-нарядов</Typography>
                </Box>
            </GlassCard>
        );
    }

    return (
        <GlassCard sx={{ p: 0, overflow: 'hidden' }}>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>№ ЗН</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Заказ</TableCell>
                            <TableCell>Участок / Операция</TableCell>
                            <TableCell align="center">Приоритет</TableCell>
                            <TableCell>Дедлайн</TableCell>
                            <TableCell align="right">Стоимость</TableCell>
                            <TableCell align="right" sx={{ width: 60 }}></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {workOrders.map((wo) => {
                            const color = getStatusColor ? getStatusColor(wo.status) : '#808080';
                            const name = getStatusName ? getStatusName(wo.status) : wo.status;
                            const prioColor = getPriorityColor(wo.effectivePriority);

                            return (
                                <TableRow
                                    key={wo.id}
                                    hover
                                    onClick={() => navigate(`/work-orders/${wo.id}`)}
                                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                                >
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                            {wo.workOrderNumber}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={name}
                                            size="small"
                                            sx={{
                                                backgroundColor: alpha(color, 0.1),
                                                color: color,
                                                fontWeight: 600,
                                                fontSize: '0.7rem',
                                                border: `1px solid ${alpha(color, 0.3)}`,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {wo.orderNumber}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                            {wo.departmentName}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            {wo.operationName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            size="small"
                                            label={wo.effectivePriority}
                                            sx={{
                                                backgroundColor: alpha(prioColor, 0.1),
                                                color: prioColor,
                                                fontWeight: 700,
                                                fontSize: '0.75rem',
                                                minWidth: 32,
                                                height: 24,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {wo.deadline ? new Date(wo.deadline).toLocaleDateString('ru-RU') : '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        {wo.totalPieceRatePayment > 0 ? (
                                            <Typography variant="body2" sx={{ color: '#22c55e', fontWeight: 600 }}>
                                                {wo.totalPieceRatePayment.toLocaleString('ru-RU')} ₽
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>—</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Открыть детали">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => { e.stopPropagation(); navigate(`/work-orders/${wo.id}`); }}
                                                sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                                            >
                                                <ViewIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </GlassCard>
    );
};
