import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    Alert,
    CircularProgress
} from '@mui/material';
import { useProperties } from '../../manage-properties/model/property.hooks';
import { usePropertyDependencies, usePropertyDependencyMutations } from '../model/hooks';
import { PropertyDependenciesTable } from './PropertyDependenciesTable';
import { PropertyDependencyForm } from './PropertyDependencyForm';
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog';
import type { PropertyDependency } from '../model/types';

// Simple TabPanel component since I don't want to rely on shared one existance
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function LocalTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export const PropertyDependenciesManagementPage: React.FC = () => {
    const { properties } = useProperties();
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | ''>('');
    const [activeTab, setActiveTab] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [initialTargets, setInitialTargets] = useState<any[] | undefined>(undefined);
    const [editDependencyId, setEditDependencyId] = useState<number | undefined>(undefined);

    const { dependencies, isLoading: isLoadingDependencies, mutate } = usePropertyDependencies(
        selectedPropertyId ? Number(selectedPropertyId) : null
    );

    const { createDependency, updateDependency, deleteDependency } = usePropertyDependencyMutations();

    const handleCopy = (dep: any) => {
        // Находим все зависимости для того же исходного свойства и значения
        const relatedDeps = dependencies?.asSource?.filter((d: any) =>
            d.sourcePropertyId === dep.sourcePropertyId &&
            d.sourceValue === dep.sourceValue
        ) || [dep];

        const targetsToCopy = relatedDeps.map((d: any) => ({
            id: Date.now().toString() + Math.random().toString(),
            targetPropertyId: d.targetPropertyId,
            dependencyType: d.dependencyType,
            targetValue: d.targetValue || ''
        }));

        setInitialTargets(targetsToCopy);
        setEditDependencyId(undefined); // Ensure we are NOT in edit mode
        setShowForm(true);
    };

    const handleEdit = (dependencyOrGroup: PropertyDependency | PropertyDependency[]) => {
        let group: PropertyDependency[];
        if (Array.isArray(dependencyOrGroup)) {
            group = dependencyOrGroup;
        } else {
            group = [dependencyOrGroup];
        }

        const targetsToEdit = group.map(dep => ({
            id: String(dep.id),
            targetPropertyId: dep.targetPropertyId,
            dependencyType: dep.dependencyType,
            targetValue: dep.targetValue || ''
        }));

        setInitialTargets(targetsToEdit);
        setEditDependencyId(group[0].id);
        setShowForm(true);
    };

    const handleDelete = (id: number) => {
        setDeleteTargetId(id);
    };

    const confirmDelete = async () => {
        if (deleteTargetId !== null) {
            await deleteDependency(deleteTargetId);
            mutate();
            setDeleteTargetId(null);
        }
    };

    const handleCreateSuccess = () => {
        setShowForm(false);
        setEditDependencyId(undefined);
        mutate();
    };

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Управление связанными свойствами
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Выберите свойство, чтобы увидеть и настроить его зависимости.
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <FormControl sx={{ minWidth: 300 }}>
                        <InputLabel>Выберите свойство</InputLabel>
                        <Select
                            value={selectedPropertyId}
                            label="Выберите свойство"
                            onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
                        >
                            {properties
                                ?.filter((p: any) => p.isActive !== false && p.is_active !== false && p.is_active !== 0)
                                .map((prop: any) => (
                                    <MenuItem key={prop.id} value={prop.id}>
                                        {prop.name}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>

                    {selectedPropertyId && (
                        <Button
                            variant="contained"
                            onClick={() => {
                                setInitialTargets(undefined);
                                setEditDependencyId(undefined);
                                setShowForm(true);
                            }}
                        >
                            Добавить зависимость для этого свойства
                        </Button>
                    )}
                </Box>

                {selectedPropertyId ? (
                    <>
                        {isLoadingDependencies ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Box>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                                        <Tab label="Управляет другими (Исходное)" />
                                        <Tab label="Зависит от других (Целевое)" />
                                    </Tabs>
                                </Box>

                                <LocalTabPanel value={activeTab} index={0}>
                                    <PropertyDependenciesTable
                                        dependencies={dependencies?.asSource || []}
                                        onDelete={handleDelete}
                                        onCopy={handleCopy}
                                        onEdit={handleEdit}
                                    />
                                </LocalTabPanel>

                                <LocalTabPanel value={activeTab} index={1}>
                                    <PropertyDependenciesTable
                                        dependencies={dependencies?.asTarget || []}
                                        onDelete={handleDelete}
                                        onEdit={handleEdit}
                                        // Не даем копировать "как цель", так как там источник другой
                                        isTargetView={true}
                                    />
                                </LocalTabPanel>
                            </Box>
                        )}
                    </>
                ) : (
                    <Alert severity="info">
                        Пожалуйста, выберите свойство из списка выше для настройки зависимостей.
                    </Alert>
                )}
            </Paper>

            <Dialog
                open={showForm}
                onClose={() => { setShowForm(false); setInitialTargets(undefined); setEditDependencyId(undefined); }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {editDependencyId
                        ? 'Редактирование связи ДС'
                        : initialTargets
                            ? 'Копирование зависимости (Создание)'
                            : 'Создание новой зависимости'
                    }
                </DialogTitle>
                <DialogContent>
                    <PropertyDependencyForm
                        initialSourcePropertyId={typeof selectedPropertyId === 'number' ? selectedPropertyId : undefined}
                        initialTargets={initialTargets}
                        editDependencyId={editDependencyId}
                        createDependency={createDependency}
                        updateDependency={updateDependency}
                        onSuccess={handleCreateSuccess}
                        onCancel={() => { setShowForm(false); setInitialTargets(undefined); setEditDependencyId(undefined); }}
                    />
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleteTargetId !== null}
                title="Удаление связи ДС"
                content="Удалить эту зависимость? Дочернее свойство перестанет зависеть от выбранного значения."
                onClose={() => setDeleteTargetId(null)}
                onConfirm={confirmDelete}
            />
        </Box >
    );
};
