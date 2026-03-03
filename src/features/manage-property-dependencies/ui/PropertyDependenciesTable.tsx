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
    Tooltip,
    Typography,
    Chip
} from '@mui/material';
import { Delete as DeleteIcon, ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import type { PropertyDependency } from '../model/types';
import { useProperties } from '../../manage-properties/model/property.hooks';

interface PropertyDependenciesTableProps {
    dependencies: PropertyDependency[];
    onDelete: (id: number) => void;
    onCopy?: (dependency: PropertyDependency) => void;
}

export const PropertyDependenciesTable: React.FC<PropertyDependenciesTableProps> = ({
    dependencies,
    onDelete,
    onCopy
}) => {
    const { properties } = useProperties();

    // Helper to get property name by ID
    const getPropertyName = (id: number) => {
        const prop = properties?.find((p: any) => Number(p.id) === id);
        return prop ? prop.name : `ID: ${id}`;
    };

    if (!dependencies || dependencies.length === 0) {
        return (
            <Typography variant="body1" sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                Зависимости не найдены
            </Typography>
        );
    }

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Исходное свойство</TableCell>
                        <TableCell>Значение</TableCell>
                        <TableCell>Тип связи</TableCell>
                        <TableCell>Целевое свойство</TableCell>
                        <TableCell>Целевое значение</TableCell>
                        <TableCell align="right">Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dependencies.map((dep) => (
                        <TableRow key={dep.id}>
                            <TableCell>{getPropertyName(dep.sourcePropertyId)}</TableCell>
                            <TableCell>
                                {dep.sourceValue ? (
                                    <Chip label={dep.sourceValue} size="small" variant="outlined" />
                                ) : (
                                    <Typography variant="caption" color="text.secondary">Любое</Typography>
                                )}
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={dep.dependencyType}
                                    color="primary"
                                    size="small"
                                    variant="filled"
                                />
                            </TableCell>
                            <TableCell>{getPropertyName(dep.targetPropertyId)}</TableCell>
                            <TableCell>
                                {dep.targetValue ? (
                                    <Chip label={dep.targetValue} size="small" variant="outlined" />
                                ) : (
                                    <Typography variant="caption" color="text.secondary">-</Typography>
                                )}
                            </TableCell>
                            <TableCell align="right">
                                {onCopy && (
                                    <Tooltip title="Копировать все связанные целевые свойства">
                                        <IconButton onClick={() => onCopy(dep)} color="primary" size="small" sx={{ mr: 1 }}>
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <Tooltip title="Удалить зависимость">
                                    <IconButton onClick={() => onDelete(dep.id)} color="error" size="small">
                                        <DeleteIcon />
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
