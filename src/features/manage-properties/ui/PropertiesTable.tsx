/**
 * @file Таблица дополнительных свойств
 * @description Компонент для отображения списка свойств в виде таблицы с возможностью сортировки и фильтрации
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
  IconButton,
  Tooltip,
  Chip,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Archive as ArchiveIcon, Unarchive as UnarchiveIcon } from '@mui/icons-material';
import type { Property } from '../model/types';

interface PropertiesTableProps {
  properties: Property[];
  loading?: boolean;
  onEdit: (property: Property) => void;
  onToggleStatus: (property: Property) => void;
  additionalActions?: {
    icon: React.ReactNode;
    tooltip: string;
    onClick: (property: Property) => void;
    condition?: (property: Property) => boolean;
  }[];
}

export const PropertiesTable: React.FC<PropertiesTableProps> = ({
  properties,
  loading = false,
  onEdit,
  onToggleStatus,
  additionalActions = []
}) => {

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Название</TableCell>
            <TableCell>Код</TableCell>
            <TableCell>Тип данных</TableCell>
            <TableCell>Обязательное</TableCell>
            <TableCell>Статус</TableCell>
            <TableCell align="right">Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : properties.length > 0 ? (
            properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell>{property.name}</TableCell>
                <TableCell>{property.code}</TableCell>
                <TableCell>
                  <Chip
                    label={property.dataType.toUpperCase()}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {property.isRequired ? (
                    <Chip label="Да" size="small" color="primary" variant="outlined" />
                  ) : (
                    <Chip label="Нет" size="small" variant="outlined" />
                  )}
                </TableCell>
                <TableCell>
                  {property.isActive ? (
                    <Chip label="Активно" size="small" color="success" variant="outlined" />
                  ) : (
                    <Chip label="Неактивно" size="small" color="default" variant="outlined" />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Редактировать">
                    <IconButton
                      onClick={() => onEdit(property)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={property.isActive ? "Деактивировать" : "Активировать"}>
                    <IconButton
                      onClick={() => onToggleStatus(property)}
                      color={property.isActive ? "default" : "primary"}
                    >
                      {property.isActive ? <ArchiveIcon /> : <UnarchiveIcon />}
                    </IconButton>
                  </Tooltip>

                  {/* Дополнительные действия */}
                  {additionalActions.map((action, index) => {
                    if (action.condition && !action.condition(property)) {
                      return null;
                    }
                    return (
                      <Tooltip key={index} title={action.tooltip}>
                        <IconButton
                          onClick={() => action.onClick(property)}
                          color="secondary"
                        >
                          {action.icon}
                        </IconButton>
                      </Tooltip>
                    );
                  })}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Нет дополнительных свойств
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
