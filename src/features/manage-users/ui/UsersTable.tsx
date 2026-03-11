/**
 * @file Таблица пользователей
 * @description Компонент для отображения списка пользователей с возможностью редактирования
 */

import React, { useState } from 'react';
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
  Typography,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { User, UserRole } from '../model/types';
import { useUsers, useDeleteUser } from '../model/user.hooks';

interface UsersTableProps {
  onEdit: (user: User) => void;
  loading?: boolean;
}

const UsersTable: React.FC<UsersTableProps> = ({ onEdit }) => {
  const { users, isLoading, isError } = useUsers();
  const { deleteUser } = useDeleteUser();
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      setDeletingUserId(userId);
      await deleteUser(userId);
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      alert('Ошибка при удалении пользователя');
    } finally {
      setDeletingUserId(null);
    }
  };

  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'manager': return 'Менеджер';
      case 'worker': return 'Работник';
      case 'client': return 'Клиент';
      default: return role;
    }
  };

  const getRoleColor = (role: UserRole): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'primary';
      case 'worker': return 'info';
      case 'client': return 'success';
      default: return 'default';
    }
  };

  if (isError) {
    return <Typography color="error">Ошибка загрузки пользователей</Typography>;
  }

  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ФИО</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Роль</TableCell>
            <TableCell>Статус</TableCell>
            <TableCell align="right">Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading || deletingUserId ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                {isLoading ? 'Загрузка пользователей...' : 'Удаление...'}
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Нет пользователей
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user.id}
                hover
                onClick={() => onEdit(user)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={getRoleLabel(user.role)}
                    size="small"
                    color={getRoleColor(user.role)}
                  />
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <Chip label="Активен" size="small" color="success" />
                  ) : (
                    <Chip label="Неактивен" size="small" color="default" />
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onEdit(user); }}
                    disabled={!!deletingUserId}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); handleDelete(user.id); }}
                    disabled={!!deletingUserId}
                  >
                    <DeleteIcon
                      fontSize="small"
                      color={deletingUserId === user.id ? 'disabled' : 'error'}
                    />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UsersTable;