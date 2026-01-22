/**
 * @file Таблица шапок свойств
 * @description Компонент для отображения списка шапок свойств в виде таблицы
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  RadioButtonUnchecked as InactiveIcon,
  PlaylistAdd as AddItemIcon,
} from '@mui/icons-material';

import type { PropertyHeader } from '../model/types';

interface PropertyHeadersTableProps {
  headers: PropertyHeader[];
  onEdit: (header: PropertyHeader) => void;
  onDelete: (id: number) => void;
  onActivate: (id: number) => void;
  onDeactivate: (id: number) => void;
  onAddItem: (header: PropertyHeader) => void;
  loading?: boolean;
}

const PropertyHeadersTable: React.FC<PropertyHeadersTableProps> = ({
  headers,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onAddItem,
  loading = false,
}) => {
  if (loading) {
    return (
      <Typography variant="body2" color="text.secondary">
        Загрузка шапок свойств...
      </Typography>
    );
  }

  if (headers.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Шапки свойств не найдены
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="таблица шапок свойств">
        <TableHead>
          <TableRow>
            <TableCell>Название</TableCell>
            <TableCell>Тип заказа</TableCell>
            <TableCell>Описание</TableCell>
            <TableCell align="center">Статус</TableCell>
            <TableCell align="center">Дата создания</TableCell>
            <TableCell align="center">Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {headers.map((header) => (
            <TableRow
              key={header.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                <Typography fontWeight="medium">
                  {header.name}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={`Тип ${header.orderTypeId}`} 
                  size="small" 
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                {header.description || (
                  <Typography variant="body2" color="text.secondary">
                    Без описания
                  </Typography>
                )}
              </TableCell>
              <TableCell align="center">
                {header.isActive ? (
                  <Tooltip title="Активна">
                    <ActiveIcon color="success" />
                  </Tooltip>
                ) : (
                  <Tooltip title="Неактивна">
                    <InactiveIcon color="disabled" />
                  </Tooltip>
                )}
              </TableCell>
              <TableCell align="center">
                {new Date(header.createdAt).toLocaleDateString('ru-RU')}
              </TableCell>
              <TableCell align="center">
                <Tooltip title="Редактировать">
                  <IconButton 
                    size="small" 
                    onClick={() => onEdit(header)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Добавить элементы">
                  <IconButton 
                    size="small" 
                    onClick={() => onAddItem(header)}
                  >
                    <AddItemIcon />
                  </IconButton>
                </Tooltip>
                
                {header.isActive ? (
                  <Tooltip title="Деактивировать">
                    <IconButton 
                      size="small" 
                      onClick={() => onDeactivate(header.id)}
                      color="warning"
                    >
                      <InactiveIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Активировать">
                    <IconButton 
                      size="small" 
                      onClick={() => onActivate(header.id)}
                      color="success"
                    >
                      <ActiveIcon />
                    </IconButton>
                  </Tooltip>
                )}
                
                <Tooltip title="Удалить">
                  <IconButton 
                    size="small" 
                    onClick={() => onDelete(header.id)}
                    color="error"
                  >
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

export default PropertyHeadersTable;