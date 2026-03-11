/**
 * @file Таблица статусов заказ-нарядов
 */

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    CircularProgress,
    Typography,
    Box,
    Tooltip,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import type { WorkOrderStatus } from '../model/types';

interface StatusesTableProps {
    statuses: WorkOrderStatus[];
    isLoading: boolean;
    onEdit: (status: WorkOrderStatus) => void;
    onDelete: (id: number) => void;
    onMoveUp: (status: WorkOrderStatus) => void;
    onMoveDown: (status: WorkOrderStatus) => void;
}

/**
 * Таблица статусов заказ-нарядов
 */
export const StatusesTable: React.FC<StatusesTableProps> = ({
    statuses,
    isLoading,
    onEdit,
    onDelete,
    onMoveUp,
    onMoveDown,
}) => {
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (statuses.length === 0) {
        return (
            <Typography color="text.secondary" sx={{ p: 2 }}>
                Нет статусов для отображения
            </Typography>
        );
    }

    // Сортируем по sortOrder
    const sortedStatuses = [...statuses].sort((a, b) => a.sortOrder - b.sortOrder);

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell width={80}>Порядок</TableCell>
                        <TableCell>Код</TableCell>
                        <TableCell>Название</TableCell>
                        <TableCell align="center">Цвет</TableCell>
                        <TableCell align="center">Флаги</TableCell>
                        <TableCell align="center">Статус</TableCell>
                        <TableCell align="center">Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedStatuses.map((status, index) => (
                        <TableRow
                            key={status.id}
                            hover
                            onClick={() => onEdit(status)}
                            sx={{ cursor: 'pointer' }}
                        >
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <IconButton
                                        size="small"
                                        disabled={index === 0}
                                        onClick={(e) => { e.stopPropagation(); onMoveUp(status); }}
                                    >
                                        <ArrowUpIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        disabled={index === sortedStatuses.length - 1}
                                        onClick={(e) => { e.stopPropagation(); onMoveDown(status); }}
                                    >
                                        <ArrowDownIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                    {status.code}
                                </Typography>
                            </TableCell>
                            <TableCell>{status.name}</TableCell>
                            <TableCell align="center">
                                <Box
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: '4px',
                                        backgroundColor: status.color,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        mx: 'auto',
                                    }}
                                    title={status.color}
                                />
                            </TableCell>
                            <TableCell align="center">
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                    {status.isInitial && (
                                        <Chip label="Начальный" size="small" color="info" variant="outlined" />
                                    )}
                                    {status.isFinal && (
                                        <Chip label="Конечный" size="small" color="warning" variant="outlined" />
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell align="center">
                                <Chip
                                    label={status.isActive ? 'Активен' : 'Неактивен'}
                                    color={status.isActive ? 'success' : 'default'}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell align="center">
                                <Tooltip title="Редактировать">
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(status); }}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Удалить">
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={(e) => { e.stopPropagation(); onDelete(status.id); }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
