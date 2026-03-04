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
    Chip,
    Box,
    Collapse
} from '@mui/material';
import {
    Delete as DeleteIcon,
    ContentCopy as ContentCopyIcon,
    Edit as EditIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';
import type { PropertyDependency } from '../model/types';
import { useProperties } from '../../manage-properties/model/property.hooks';

interface PropertyDependenciesTableProps {
    dependencies: PropertyDependency[];
    onDelete: (id: number) => void;
    onCopy?: (dependency: PropertyDependency) => void;
    onEdit?: (dependency: PropertyDependency) => void;
    isTargetView?: boolean;
}

// Group dependencies by Source Property ID and Source Value
const groupDependencies = (dependencies: PropertyDependency[], isTargetView: boolean) => {
    if (isTargetView) return []; // In target view, we might just show flat list or group by target

    const groups: Record<string, PropertyDependency[]> = {};

    dependencies.forEach(dep => {
        const key = `${dep.sourcePropertyId}_${dep.sourceValue || 'ANY'}`;
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(dep);
    });

    return Object.values(groups);
};

const GroupedRow = ({
    group,
    getPropertyName,
    onDelete,
    onCopy,
    onEdit
}: {
    group: PropertyDependency[];
    getPropertyName: (id: number) => string;
    onDelete: (id: number) => void;
    onCopy?: (dep: PropertyDependency) => void;
    onEdit?: (dep: PropertyDependency) => void;
}) => {
    const [open, setOpen] = React.useState(true); // Default open for visibility
    const sourceProp = group[0];

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' }, bgcolor: 'action.hover' }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    <Typography variant="subtitle2">
                        {getPropertyName(sourceProp.sourcePropertyId)}
                    </Typography>
                </TableCell>
                <TableCell>
                    {sourceProp.sourceValue ? (
                        <Chip label={sourceProp.sourceValue} size="small" color="primary" variant="outlined" />
                    ) : (
                        <Typography variant="caption" color="text.secondary">Любое значение</Typography>
                    )}
                </TableCell>
                <TableCell colSpan={2}>
                    <Typography variant="body2" color="text.secondary">
                        {group.length} целевых свойств(а)
                    </Typography>
                </TableCell>
                <TableCell align="right">
                    {onCopy && (
                        <Tooltip title="Копировать это правило (все цели)">
                            <IconButton onClick={() => onCopy(sourceProp)} color="primary" size="small" sx={{ mr: 1 }}>
                                <ContentCopyIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, ml: 4 }}>
                            <Table size="small" aria-label="targets">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Целевое свойство</TableCell>
                                        <TableCell>Тип связи</TableCell>
                                        <TableCell>Целевое значение</TableCell>
                                        <TableCell align="right">Действия</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {group.map((dep) => (
                                        <TableRow key={dep.id}>
                                            <TableCell>{getPropertyName(dep.targetPropertyId)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={dep.dependencyType}
                                                    color="default"
                                                    size="small"
                                                    variant="filled"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {dep.targetValue ? (
                                                    <Chip label={dep.targetValue} size="small" variant="outlined" />
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">-</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                {onEdit && (
                                                    <Tooltip title="Редактировать одну цель">
                                                        <IconButton onClick={() => onEdit(dep)} color="primary" size="small" sx={{ mr: 1 }}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="Удалить одну цель">
                                                    <IconButton onClick={() => onDelete(dep.id)} color="error" size="small">
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

export const PropertyDependenciesTable: React.FC<PropertyDependenciesTableProps> = ({
    dependencies,
    onDelete,
    onCopy,
    onEdit,
    isTargetView = false
}) => {
    const { properties } = useProperties();

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

    // Target view remains flat
    if (isTargetView) {
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
                                    <Chip label={dep.dependencyType} color="primary" size="small" variant="filled" />
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
                                    {onEdit && (
                                        <Tooltip title="Редактировать зависимость">
                                            <IconButton onClick={() => onEdit(dep)} color="primary" size="small" sx={{ mr: 1 }}>
                                                <EditIcon />
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
    }

    // Source view uses grouped rows
    const grouped = groupDependencies(dependencies, false);

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell width={50} />
                        <TableCell>Исходное свойство</TableCell>
                        <TableCell>Исходное значение</TableCell>
                        <TableCell colSpan={2}>Сводка целей</TableCell>
                        <TableCell align="right">Действия с правилом</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {grouped.map((group, index) => (
                        <GroupedRow
                            key={index}
                            group={group}
                            getPropertyName={getPropertyName}
                            onDelete={onDelete}
                            onCopy={onCopy}
                            onEdit={onEdit}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
