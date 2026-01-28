/**
 * @file Таблица номенклатуры
 * @description Компонент для отображения списка продуктов в виде таблицы
 */

import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useProducts } from '../model/product.hooks';
import type { Product } from '../model/types';

interface ProductsTableProps {
  /** Callback редактирования продукта */
  onEdit?: (product: Product) => void;
  /** Callback удаления продукта */
  onDelete?: (productId: number) => void;
  /** Callback просмотра деталей продукта */
  onView?: (product: Product) => void;
}

/**
 * Таблица номенклатуры
 */
export const ProductsTable: React.FC<ProductsTableProps> = ({
  onEdit,
  onDelete,
  onView,
}) => {
  const { products, isLoading, isError, error } = useProducts();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Логирование для отладки
  console.log('ProductsTable:', { products, isLoading, isError, error });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Обрезаем данные для пагинации
  const paginatedProducts = products.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Загрузка номенклатуры...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography color="error">
          Ошибка загрузки: {error?.message || 'Неизвестная ошибка'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="таблица номенклатуры">
          <TableHead>
            <TableRow>
              <TableCell>Наименование</TableCell>
              <TableCell>Артикул</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell>Ед. изм</TableCell>
              <TableCell align="right">Цена</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary">
                    Нет данных о номенклатуре
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => (
                <TableRow
                  key={product.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {product.name}
                      </Typography>
                      {product.description && (
                        <Typography variant="caption" color="text.secondary">
                          {product.description.substring(0, 50)}
                          {product.description.length > 50 ? '...' : ''}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={product.code || '—'} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={product.category || 'Не указана'} 
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={product.unit} 
                      size="small" 
                      color="secondary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      {product.basePrice.toLocaleString('ru-RU', {
                        style: 'currency',
                        currency: 'RUB',
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={product.isActive ? 'Активен' : 'Неактивен'} 
                      size="small"
                      color={product.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      {onView && (
                        <Tooltip title="Просмотр">
                          <IconButton 
                            size="small" 
                            onClick={() => onView(product)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {onEdit && (
                        <Tooltip title="Редактировать">
                          <IconButton 
                            size="small" 
                            onClick={() => onEdit(product)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {onDelete && (
                        <Tooltip title="Удалить">
                          <IconButton 
                            size="small" 
                            onClick={() => onDelete(product.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={products.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Строк на странице:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} из ${count !== -1 ? count : `больше чем ${to}`}`
        }
      />
    </Box>
  );
};