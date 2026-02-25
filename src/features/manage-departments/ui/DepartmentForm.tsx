import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    MenuItem,
    Box,
} from '@mui/material';
import {
    GROUPING_STRATEGY_LABELS,
} from '../model/types';
import type {
    ProductionDepartment,
    CreateProductionDepartmentDto,
    UpdateProductionDepartmentDto,
    GroupingStrategy,
} from '../model/types';
import { DepartmentOperationsList } from './DepartmentOperationsList';

interface DepartmentFormProps {
    open: boolean;
    department?: ProductionDepartment | null;
    onSave: (dto: CreateProductionDepartmentDto | UpdateProductionDepartmentDto, id?: number) => Promise<void>;
    onClose: () => void;
}

interface FormValues {
    code: string;
    name: string;
    description: string;
    groupingStrategy: GroupingStrategy;
    isActive: boolean;
}

const DEFAULT_VALUES: FormValues = {
    code: '',
    name: '',
    description: '',
    groupingStrategy: 'BY_ORDER',
    isActive: true, // Default to active
};

export const DepartmentForm: React.FC<DepartmentFormProps> = ({
    open,
    department,
    onSave,
    onClose,
}) => {
    const [formData, setFormData] = React.useState<FormValues>(DEFAULT_VALUES);

    useEffect(() => {
        if (department) {
            setFormData({
                code: department.code,
                name: department.name,
                description: department.description || '',
                groupingStrategy: department.groupingStrategy,
                isActive: department.isActive,
            });
        } else {
            setFormData(DEFAULT_VALUES);
        }
    }, [department, open]); // Reset when opening/changing department

    const handleChange = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { value: unknown }>) => {
        const value = field === 'isActive'
            ? (e.target as HTMLInputElement).checked
            : e.target.value;

        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const dto = {
            ...formData,
            description: formData.description || null,
            groupingPropertyId: undefined
        };

        if (department) {
            await onSave(dto as UpdateProductionDepartmentDto, department.id);
        } else {
            await onSave(dto as CreateProductionDepartmentDto);
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {department ? 'Редактирование участка' : 'Создание нового участка'}
            </DialogTitle>
            <form onSubmit={onSubmit}>
                <DialogContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <TextField
                            name="code"
                            value={formData.code}
                            onChange={handleChange('code')}
                            label="Код"
                            fullWidth
                            required
                            disabled={!!department}
                        />
                        <TextField
                            name="name"
                            value={formData.name}
                            onChange={handleChange('name')}
                            label="Название"
                            fullWidth
                            required
                        />
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        <TextField
                            name="description"
                            value={formData.description}
                            onChange={handleChange('description')}
                            label="Описание"
                            fullWidth
                            multiline
                            rows={3}
                        />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 2 }}>
                        <TextField
                            select
                            name="groupingStrategy"
                            value={formData.groupingStrategy}
                            onChange={handleChange('groupingStrategy')}
                            label="Стратегия группировки"
                            fullWidth
                            required
                        >
                            {(Object.keys(GROUPING_STRATEGY_LABELS) as GroupingStrategy[]).map((key) => (
                                <MenuItem key={key} value={key}>
                                    {GROUPING_STRATEGY_LABELS[key]}
                                </MenuItem>
                            ))}
                        </TextField>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive}
                                        onChange={handleChange('isActive')}
                                        name="isActive"
                                    />
                                }
                                label="Активен"
                            />
                        </Box>
                    </Box>

                    {/* Operations Management Section - Only visible when editing an existing department */}
                    {department && (
                        <>
                            <DepartmentOperationsList departmentId={department.id} />
                        </>
                    )}

                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Отмена</Button>
                    <Button type="submit" variant="contained">
                        Сохранить
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
