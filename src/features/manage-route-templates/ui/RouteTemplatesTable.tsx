/**
 * @file Таблица шаблонов маршрутов
 */
import React from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  Box,
  CircularProgress,
  alpha,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { RouteTemplate } from '../model/types';

interface RouteTemplatesTableProps {
  /** Список шаблонов */
  templates: RouteTemplate[];
  /** Индикатор загрузки */
  isLoading: boolean;
  /** Обработчик редактирования */
  onEdit: (template: RouteTemplate) => void;
  /** Обработчик удаления */
  onDelete: (id: number) => void;
}

/**
 * Таблица для отображения шаблонов технологических маршрутов
 */
export const RouteTemplatesTable: React.FC<RouteTemplatesTableProps> = ({
  templates,
  isLoading,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (templates.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        Шаблоны маршрутов ещё не созданы
      </Typography>
    );
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Название</TableCell>
          <TableCell>Описание</TableCell>
          <TableCell align="center">Шагов</TableCell>
          <TableCell align="center">Операции</TableCell>
          <TableCell align="right">Действия</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {templates.map((template) => (
          <TableRow key={template.id} hover>
            <TableCell>{template.id}</TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={600}>
                {template.name}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" color="text.secondary">
                {template.description || '—'}
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Chip label={template.steps.length} size="small" variant="outlined" />
            </TableCell>
            <TableCell align="center">
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                {template.steps.map((step) => (
                  <Chip
                    key={step.id}
                    label={`Оп.${step.operationId}`}
                    size="small"
                    color={step.conditionFormula ? 'warning' : 'default'}
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      px: 0.5,
                      // Adding a subtle background based on the chip color
                      backgroundColor: (theme) => {
                        const color = step.conditionFormula ? theme.palette.warning.main : theme.palette.text.disabled;
                        return alpha(color, 0.08);
                      },
                      borderColor: (theme) => {
                        const color = step.conditionFormula ? theme.palette.warning.main : theme.palette.divider;
                        return alpha(color, 0.4);
                      },
                      '& .MuiChip-label': {
                        px: 1,
                      }
                    }}
                  />
                ))}
              </Box>
            </TableCell>
            <TableCell align="right">
              <Tooltip title="Редактировать">
                <IconButton size="small" onClick={() => onEdit(template)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Удалить">
                <IconButton size="small" color="error" onClick={() => onDelete(template.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
