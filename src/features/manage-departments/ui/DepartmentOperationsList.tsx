import React, { useState } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Chip,
    Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useDepartmentOperations, useCreateDepartmentOperation, useDeleteDepartmentOperation, useUpdateDepartmentOperation } from '../model/department-operations.hooks';
import { useActiveOperations } from '../../manage-operations';
import type { CreateDepartmentOperationDto } from '../model/types';

interface DepartmentOperationsListProps {
    departmentId: number;
}

export const DepartmentOperationsList: React.FC<DepartmentOperationsListProps> = ({ departmentId }) => {
    const { departmentOperations, isLoading: isLoadingLinks } = useDepartmentOperations(departmentId);
    const { operations: allOperations, isLoading: isLoadingOps } = useActiveOperations();

    const { createDepartmentOperation } = useCreateDepartmentOperation();
    const { deleteDepartmentOperation } = useDeleteDepartmentOperation();
    const { updateDepartmentOperation } = useUpdateDepartmentOperation();

    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [selectedOperationId, setSelectedOperationId] = useState<number | ''>('');
    const [priority, setPriority] = useState<number>(5);

    const handleAddOperation = async () => {
        if (selectedOperationId) {
            try {
                const dto: CreateDepartmentOperationDto = {
                    departmentId,
                    operationId: Number(selectedOperationId),
                    priority,
                    isActive: true
                };
                await createDepartmentOperation(dto);
                setOpenAddDialog(false);
                setSelectedOperationId('');
                setPriority(5);
            } catch (error) {
                console.error('Failed to add operation to department', error);
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Remove this operation from department?')) {
            try {
                await deleteDepartmentOperation(id, departmentId);
            } catch (error) {
                console.error('Failed to delete operation from department', error);
            }
        }
    };

    const handlePriorityChange = async (id: number, newPriority: number) => {
        if (newPriority >= 1 && newPriority <= 10) {
            try {
                await updateDepartmentOperation(id, departmentId, { priority: newPriority });
            } catch (error) {
                console.error('Failed to update priority', error);
            }
        }
    }

    // Filter out operations that are already linked
    const availableOperations = allOperations.filter(
        op => !departmentOperations.some(link => link.operationId === op.id)
    );

    if (isLoadingLinks || isLoadingOps) {
        return <Typography>Loading operations...</Typography>;
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Operations</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    onClick={() => setOpenAddDialog(true)}
                    disabled={availableOperations.length === 0}
                >
                    Add Operation
                </Button>
            </Box>

            <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                <List>
                    {departmentOperations.length === 0 ? (
                        <ListItem>
                            <ListItemText secondary="No operations linked to this department" />
                        </ListItem>
                    ) : (
                        departmentOperations.map((link) => (
                            <ListItem key={link.id} divider>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {link.operationName || `Operation #${link.operationId}`}
                                            <Chip
                                                label={link.operationCode}
                                                size="small"
                                                variant="outlined"
                                                sx={{ ml: 1 }}
                                            />
                                        </Box>
                                    }
                                    secondary={`Priority: ${link.priority}`}
                                />

                                <ListItemSecondaryAction>
                                    <TextField
                                        type="number"
                                        size="small"
                                        label="Priority"
                                        value={link.priority}
                                        onChange={(e) => handlePriorityChange(link.id, Number(e.target.value))}
                                        sx={{ width: 80, mr: 2 }}
                                        inputProps={{ min: 1, max: 10 }}
                                    />
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(link.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))
                    )}
                </List>
            </Paper>

            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
                <DialogTitle>Add Operation to Department</DialogTitle>
                <DialogContent sx={{ minWidth: 400, pt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel>Operation</InputLabel>
                            <Select
                                value={selectedOperationId}
                                label="Operation"
                                onChange={(e) => setSelectedOperationId(Number(e.target.value))}
                            >
                                {availableOperations.map((op) => (
                                    <MenuItem key={op.id} value={op.id}>
                                        {op.name} ({op.code})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Priority (1-10)"
                            type="number"
                            value={priority}
                            onChange={(e) => setPriority(Number(e.target.value))}
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                            inputProps={{ min: 1, max: 10 }}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddOperation} variant="contained" disabled={!selectedOperationId}>
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
