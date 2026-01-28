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

    const { dependencies, isLoading: isLoadingDependencies, mutate } = usePropertyDependencies(
        selectedPropertyId ? Number(selectedPropertyId) : null
    );

    const { createDependency, deleteDependency } = usePropertyDependencyMutations();

    const handleDelete = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить эту зависимость?')) {
            try {
                await deleteDependency(id);
                mutate();
            } catch (error) {
                console.error('Failed to delete dependency:', error);
                alert('Ошибка при удалении зависимости');
            }
        }
    };

    const handleCreateSuccess = () => {
        setShowForm(false);
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
                            onClick={() => setShowForm(true)}
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
                                    />
                                </LocalTabPanel>

                                <LocalTabPanel value={activeTab} index={1}>
                                    <PropertyDependenciesTable
                                        dependencies={dependencies?.asTarget || []}
                                        onDelete={handleDelete}
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
                onClose={() => setShowForm(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Создание новой зависимости</DialogTitle>
                <DialogContent>
                    <PropertyDependencyForm
                        initialSourcePropertyId={typeof selectedPropertyId === 'number' ? selectedPropertyId : undefined}
                        createDependency={createDependency}
                        onSuccess={handleCreateSuccess}
                        onCancel={() => setShowForm(false)}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};
