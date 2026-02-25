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
    Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { ProductionDepartment } from '../model/types';
import { GROUPING_STRATEGY_LABELS } from '../model/types';
import { useDepartments, useDeleteDepartment } from '../model/departments.hooks';

interface DepartmentsTableProps {
    onEdit: (department: ProductionDepartment) => void;
}

export const DepartmentsTable: React.FC<DepartmentsTableProps> = ({ onEdit }) => {
    const { departments, isLoading } = useDepartments();
    const { deleteDepartment } = useDeleteDepartment();

    const handleDelete = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить этот участок?')) {
            try {
                await deleteDepartment(id);
            } catch (error) {
                console.error('Ошибка удаления участка:', error);
            }
        }
    };

    if (isLoading) {
        return <Typography>Загрузка...</Typography>;
    }

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="departments table">
                <TableHead>
                    <TableRow>
                        <TableCell>Код</TableCell>
                        <TableCell>Название</TableCell>
                        <TableCell>Стратегия группировки</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell align="right">Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {departments.map((department) => (
                        <TableRow
                            key={department.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {department.code}
                            </TableCell>
                            <TableCell>{department.name}</TableCell>
                            <TableCell>
                                {GROUPING_STRATEGY_LABELS[department.groupingStrategy]}
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={department.isActive ? 'Активен' : 'Неактивен'}
                                    color={department.isActive ? 'success' : 'default'}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell align="right">
                                <IconButton
                                    aria-label="edit"
                                    onClick={() => onEdit(department)}
                                    size="small"
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    aria-label="delete"
                                    onClick={() => handleDelete(department.id)}
                                    size="small"
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {departments.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                Нет данных
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
