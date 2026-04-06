import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import BuildIcon from '@mui/icons-material/Build';

// DnD Kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';

import { useOperations } from '../../manage-operations';
import type { Operation } from '../../manage-operations/model/types';
import type { CreateRouteStepInput } from '../model/types';
import { ProductMaterialsDialog } from './ProductMaterialsDialog';

interface ProductRouteStepsDialogProps {
  open: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  properties: { propertyId: number; property: { name: string; variableName?: string }; value: string }[];
  // Existing route data (if any)
  routeData: { id: number; name: string; description?: string; steps: CreateRouteStepInput[] } | null;
  // Submit handlers
  onSave: (name: string, description: string | undefined, steps: CreateRouteStepInput[]) => Promise<void>;
}

interface SortableStepItemProps {
  id: string;
  index: number;
  step: CreateRouteStepInput;
  operations: Operation[];
  onOperationChange: (index: number, id: number) => void;
  onConditionChange: (index: number, formula: string) => void;
  onRemove: (index: number) => void;
  onOpenMaterials: (index: number) => void;
}

const SortableStepItem: React.FC<SortableStepItemProps> = ({
  id,
  index,
  step,
  operations,
  onOperationChange,
  onConditionChange,
  onRemove,
  onOpenMaterials,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.6 : 1,
    position: 'relative' as const,
  };

  const materialsCount = step.materials?.length || 0;

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      variant="outlined"
      sx={{
        p: 1.5,
        mb: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        bgcolor: isDragging ? 'action.hover' : 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <Box
          {...attributes}
          {...listeners}
          sx={{
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            color: 'text.disabled',
            '&:hover': { color: 'primary.main' }
          }}
        >
          <DragIndicatorIcon />
        </Box>

        <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 24, color: 'text.secondary' }}>
          #{index + 1}
        </Typography>

        <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
          <InputLabel>Операция</InputLabel>
          <Select
            value={step.operationId || ''}
            onChange={(e) => onOperationChange(index, Number(e.target.value))}
            label="Операция"
          >
            {operations.map((op) => (
              <MenuItem key={op.id} value={op.id}>
                {op.code} — {op.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Условие"
          value={step.conditionFormula || ''}
          onChange={(e) => onConditionChange(index, e.target.value)}
          size="small"
          placeholder='например: material == "шпон"'
          sx={{ flex: 1 }}
        />

        <Button
          size="small"
          startIcon={<BuildIcon />}
          variant={materialsCount > 0 ? "contained" : "outlined"}
          color={materialsCount > 0 ? "primary" : "inherit"}
          onClick={() => onOpenMaterials(index)}
          onPointerDown={(e) => e.stopPropagation()} // Prevent DND drag start
        >
          Материалы ({materialsCount})
        </Button>

        <IconButton size="small" color="error" onClick={() => onRemove(index)} onPointerDown={(e) => e.stopPropagation()}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
};

const emptyStep: CreateRouteStepInput = {
  stepNumber: 1,
  operationId: 0,
  isRequired: true,
  conditionFormula: null,
  materials: [],
};

export const ProductRouteStepsDialog: React.FC<ProductRouteStepsDialogProps> = ({
  open,
  onClose,
  productId,
  productName,
  properties,
  routeData,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<(CreateRouteStepInput & { feId: string })[]>([]);
  const [saving, setSaving] = useState(false);
  
  // State for ProductMaterialsDialog integration
  const [materialsDialogOpen, setMaterialsDialogOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  const { operations } = useOperations();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (open) {
      if (routeData) {
        setName(routeData.name);
        setDescription(routeData.description || '');
        const sortedSteps = [...routeData.steps].sort((a, b) => a.stepNumber - b.stepNumber);
        setSteps(
          sortedSteps.map((s) => ({
            stepNumber: s.stepNumber,
            operationId: s.operationId,
            isRequired: s.isRequired,
            conditionFormula: s.conditionFormula || null,
            materials: s.materials?.map((m) => ({
              materialId: m.materialId,
              consumptionFormula: m.consumptionFormula,
              unit: m.unit,
            })) || [],
            feId: uuidv4(),
          }))
        );
      } else {
         setName(`Маршрут: ${productName}`);
         setDescription('');
         setSteps([]);
      }
    }
  }, [open, routeData, productName]);

  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      { ...emptyStep, stepNumber: prev.length + 1, feId: uuidv4() },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, stepNumber: i + 1 }))
    );
  };

  const handleStepOperationChange = (index: number, operationId: number) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, operationId } : s))
    );
  };

  const handleStepConditionChange = (index: number, conditionFormula: string) => {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, conditionFormula: conditionFormula || null } : s
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((s) => s.feId === active.id);
        const newIndex = items.findIndex((s) => s.feId === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((s, i) => ({ ...s, stepNumber: i + 1 }));
      });
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || steps.length === 0) return;

    setSaving(true);
    try {
      const finalSteps = steps.map((s, i) => ({
         stepNumber: i + 1,
         operationId: s.operationId,
         isRequired: s.isRequired,
         conditionFormula: s.conditionFormula,
         materials: s.materials,
      }));
      
      await onSave(name.trim(), description.trim() || undefined, finalSteps);
      onClose();
    } finally {
      setSaving(false);
    }
  };
  
  // Materials Dialog Integration
  const handleOpenMaterials = (index: number) => {
      setActiveStepIndex(index);
      setMaterialsDialogOpen(true);
  };
  
  const handleSaveMaterials = (materials: { materialId: string; formula: string; unit?: string }[]) => {
      if (activeStepIndex !== null) {
          setSteps(prev => prev.map((step, i) => {
              if (i === activeStepIndex) {
                  return {
                      ...step,
                      materials: materials.map(m => ({
                          materialId: parseInt(m.materialId),
                          consumptionFormula: m.formula,
                          unit: m.unit
                      }))
                  };
              }
              return step;
          }));
      }
      setMaterialsDialogOpen(false);
      setActiveStepIndex(null);
  };

  const stepIds = useMemo(() => steps.map((s) => s.feId), [steps]);

  // Transform current step's materials to the format expected by ProductMaterialsDialog
  const currentStepMaterials = useMemo(() => {
      if (activeStepIndex === null || !steps[activeStepIndex]) return [];
      const step = steps[activeStepIndex];
      return (step.materials || []).map((m, i) => ({
          id: Date.now() + i, // Temp UI ID
          materialId: m.materialId.toString(),
          formula: m.consumptionFormula,
          unit: m.unit,
          // materialName will be resolved inside ProductMaterialsDialog
      }));
  }, [activeStepIndex, steps]);

  return (
    <>
        <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
        <DialogTitle>
            Настройка этапов производства
        </DialogTitle>
        <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    label="Название маршрута"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                    size="small"
                />
                <TextField
                    label="Описание (необязательно)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    size="small"
                />
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                    Шаги маршрута ({steps.length})
                </Typography>
                <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddStep}
                    variant="contained"
                    color="primary"
                >
                    Добавить операцию
                </Button>
                </Box>

                {steps.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1 }}>
                    Маршрут пуст. Добавьте первую операцию.
                </Typography>
                )}

                <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                >
                <SortableContext
                    items={stepIds}
                    strategy={verticalListSortingStrategy}
                >
                    {steps.map((step, index) => (
                    <SortableStepItem
                        key={step.feId}
                        id={step.feId}
                        index={index}
                        step={step}
                        operations={operations}
                        onOperationChange={handleStepOperationChange}
                        onConditionChange={handleStepConditionChange}
                        onRemove={handleRemoveStep}
                        onOpenMaterials={handleOpenMaterials}
                    />
                    ))}
                </SortableContext>
                </DndContext>
            </Box>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} disabled={saving}>Отмена</Button>
            <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={saving || !name.trim() || steps.length === 0}
            >
            {saving ? 'Сохранение...' : 'Сохранить маршрут'}
            </Button>
        </DialogActions>
        </Dialog>
        
        <ProductMaterialsDialog
            open={materialsDialogOpen}
            onClose={() => setMaterialsDialogOpen(false)}
            productId={productId}
            productName={`${productName} (Шаг ${activeStepIndex !== null ? activeStepIndex + 1 : ''})`}
            properties={properties}
            // Overriding standard behavior to work as a nested editor
            isNestedMode={true}
            initialMaterials={currentStepMaterials}
            onSaveNested={handleSaveMaterials}
        />
    </>
  );
};
