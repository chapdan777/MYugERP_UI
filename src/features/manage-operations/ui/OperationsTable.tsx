/**
 * @file Таблица производственных операций
 * @description Отображает список операций с возможностью редактирования и удаления
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
    alpha,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Operation } from '../model/types';
import { CALCULATION_TYPE_LABELS } from '../model/types';

interface OperationsTableProps {
    /** Список операций */
    operations: Operation[];
    /** Флаг загрузки */
    isLoading: boolean;
    /** Обработчик редактирования операции */
    onEdit: (operation: Operation) => void;
    /** Обработчик удаления операции */
    onDelete: (id: number) => void;
}

/**
 * Компонент таблицы производственных операций
 */
export const OperationsTable: React.FC<OperationsTableProps> = ({
    operations,
    isLoading,
    onEdit,
    onDelete,
}) => {
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (operations.length === 0) {
        return (
            <Typography color="text.secondary" sx={{ p: 2 }}>
                Нет операций для отображения
            </Typography>
        );
    }

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Код</TableCell>
                        <TableCell>Название</TableCell>
                        <TableCell>Тип расчёта</TableCell>
                        <TableCell align="right">Норма (мин)</TableCell>
                        <TableCell align="right">Расценка (₽)</TableCell>
                        <TableCell align="center">Статус</TableCell>
                        <TableCell align="center">Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {operations.map((operation) => (
                        <TableRow
                            key={operation.id}
                            hover
                            onClick={() => onEdit(operation)}
                            sx={{ cursor: 'pointer' }}
                        >
                            <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                    {operation.code}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2">{operation.name}</Typography>
                                {operation.description && (
                                    <Typography variant="caption" color="text.secondary">
                                        {operation.description}
                                    </Typography>
                                )}
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={CALCULATION_TYPE_LABELS[operation.calculationType]}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        fontWeight: 500,
                                        backgroundColor: (theme) => alpha(theme.palette.divider, 0.05),
                                        borderColor: (theme) => alpha(theme.palette.divider, 0.3),
                                    }}
                                />
                            </TableCell>
                            <TableCell align="right">
                                {operation.defaultTimePerUnit.toFixed(1)}
                            </TableCell>
                            <TableCell align="right">
                                {operation.defaultRatePerUnit.toFixed(2)}
                            </TableCell>
                            <TableCell align="center">
                                <Chip
                                    label={operation.isActive ? 'Активна' : 'Неактивна'}
                                    color={operation.isActive ? 'success' : 'default'}
                                    size="small"
                                    sx={{
                                        fontWeight: 600,
                                        backgroundColor: (theme) =>
                                            operation.isActive
                                                ? alpha(theme.palette.success.main, 0.1)
                                                : alpha(theme.palette.text.disabled, 0.1),
                                        borderColor: (theme) =>
                                            operation.isActive
                                                ? alpha(theme.palette.success.main, 0.4)
                                                : alpha(theme.palette.divider, 0.4),
                                    }}
                                />
                            </TableCell>
                            <TableCell align="center">
                                <Tooltip title="Редактировать">
                                    <IconButton
                                        size="small"
                                        onClick={(e) => { e.stopPropagation(); onEdit(operation); }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Удалить">
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={(e) => { e.stopPropagation(); onDelete(operation.id); }}
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
