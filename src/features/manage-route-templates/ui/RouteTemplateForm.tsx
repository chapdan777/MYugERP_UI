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
  Chip,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

// DnD Kit imports
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
import type { RouteTemplate, CreateRouteTemplateInput } from '../model/types';
import type { CreateRouteStepInput } from '../../manage-products/model/types';

interface RouteTemplateFormProps {
  /** Открыт ли диалог */
  open: boolean;
  /** Существующий шаблон для редактирования */
  template?: RouteTemplate | null;
  /** Обработчик сохранения */
  onSave: (input: CreateRouteTemplateInput) => Promise<void>;
  /** Обработчик закрытия */
  onClose: () => void;
}

/** Вспомогательный компонент для отдельного шага с поддержкой DND */
interface SortableStepItemProps {
  id: string;
  index: number;
  step: CreateRouteStepInput;
  operations: any[];
  onOperationChange: (index: number, id: number) => void;
  onConditionChange: (index: number, formula: string) => void;
  onRemove: (index: number) => void;
}

const SortableStepItem: React.FC<SortableStepItemProps> = ({
  id,
  index,
  step,
  operations,
  onOperationChange,
  onConditionChange,
  onRemove,
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

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      variant="outlined"
      sx={{
        p: 1.5,
        mb: 1,
        display: 'flex',
        gap: 1.5,
        alignItems: 'center',
        bgcolor: isDragging ? 'action.hover' : 'background.paper',
      }}
    >
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

      <IconButton size="small" color="error" onClick={() => onRemove(index)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
};

/** Начальное состояние шага */
const emptyStep: CreateRouteStepInput = {
  stepNumber: 1,
  operationId: 0,
  isRequired: true,
  conditionFormula: null,
  materials: [],
};

/**
 * Модальная форма для создания и редактирования шаблонов маршрутов
 */
export const RouteTemplateForm: React.FC<RouteTemplateFormProps> = ({
  open,
  template,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<(CreateRouteStepInput & { feId: string })[]>([]);
  const [saving, setSaving] = useState(false);

  const { operations } = useOperations();

  // Настройка сенсоров для DND
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Небольшой порог чтобы отличить клик от начала перетаскивания
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || '');
      // Сортируем шаги по stepNumber при загрузке и добавляем временные ID для DND
      const sortedSteps = [...template.steps].sort((a, b) => a.stepNumber - b.stepNumber);
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
      setName('');
      setDescription('');
      setSteps([]);
    }
  }, [template, open]);

  /** Добавление нового шага */
  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      { ...emptyStep, stepNumber: prev.length + 1, feId: uuidv4() },
    ]);
  };

  /** Удаление шага */
  const handleRemoveStep = (index: number) => {
    setSteps((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, stepNumber: i + 1 }))
    );
  };

  /** Обновление операции шага */
  const handleStepOperationChange = (index: number, operationId: number) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, operationId } : s))
    );
  };

  /** Обновление формулы условия шага */
  const handleStepConditionChange = (index: number, conditionFormula: string) => {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, conditionFormula: conditionFormula || null } : s
      )
    );
  };

  /** Завершение перетаскивания */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((s) => s.feId === active.id);
        const newIndex = items.findIndex((s) => s.feId === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Пересчитываем stepNumber после изменения порядка
        return newItems.map((s, i) => ({ ...s, stepNumber: i + 1 }));
      });
    }
  };

  /** Сохранение шаблона */
  const handleSubmit = async () => {
    if (!name.trim() || steps.length === 0) return;

    setSaving(true);
    try {
      // Гарантируем корректный порядок номеров перед сохранением
      const finalSteps = steps.map((s, i) => ({ ...s, stepNumber: i + 1 }));
      
      await onSave({
        productId: 0,
        name: name.trim(),
        description: description.trim() || undefined,
        isTemplate: true,
        steps: finalSteps,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // Мемоизируем ID для DND
  const stepIds = useMemo(() => steps.map((s) => s.feId), [steps]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {template ? 'Редактировать шаблон маршрута' : 'Создать шаблон маршрута'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Название шаблона"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            size="small"
          />
          <TextField
            label="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
            size="small"
          />

          {/* Секция шагов */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Шаги маршрута ({steps.length})
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddStep}
                variant="outlined"
              >
                Добавить шаг
              </Button>
            </Box>

            {steps.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                Нажмите «Добавить шаг» чтобы начать
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
                  />
                ))}
              </SortableContext>
            </DndContext>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving || !name.trim() || steps.length === 0}
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
