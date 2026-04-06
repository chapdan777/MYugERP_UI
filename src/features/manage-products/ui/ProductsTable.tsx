import React, { useState, useMemo } from 'react';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ContentCopy as CopyIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { Snackbar, Alert, CircularProgress } from '@mui/material';
import { useProducts, useCloneProduct } from '../model/product.hooks';
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
  const { cloneProduct } = useCloneProduct();
  
  // Состояние фильтров
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  const [isCloning, setIsCloning] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Получаем уникальные категории для фильтра
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return Array.from(cats).sort();
  }, [products]);

  // Логика фильтрации
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Фильтр по поиску
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Фильтр по категории
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      // Фильтр по статусу
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'active' && product.isActive) || 
        (statusFilter === 'inactive' && !product.isActive);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setPage(0);
  };

  const handleClone = async (productId: number) => {
    setIsCloning(productId);
    try {
      await cloneProduct(productId);
      setSnackbar({
        open: true,
        message: 'Изделие успешно скопировано',
        severity: 'success',
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Ошибка при копировании изделия',
        severity: 'error',
      });
    } finally {
      setIsCloning(null);
    }
  };

  // Обрезаем данные для пагинации
  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={24} sx={{ mr: 2 }} />
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
      {/* Панель фильтров */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Поиск"
          placeholder="Название или артикул..."
          size="small"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
          sx={{ flexGrow: 1, minWidth: '200px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: '150px' }}>
          <InputLabel id="category-filter-label">Категория</InputLabel>
          <Select
            labelId="category-filter-label"
            value={categoryFilter}
            label="Категория"
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
          >
            <MenuItem value="all">Все категории</MenuItem>
            {categories.map(cat => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: '120px' }}>
          <InputLabel id="status-filter-label">Статус</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label="Статус"
            onChange={(e) => { setStatusFilter(e.target.value as any); setPage(0); }}
          >
            <MenuItem value="all">Все</MenuItem>
            <MenuItem value="active">Активен</MenuItem>
            <MenuItem value="inactive">Неактивен</MenuItem>
          </Select>
        </FormControl>

        {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all') && (
          <Button 
            size="small" 
            startIcon={<ClearIcon />} 
            onClick={handleClearFilters}
            color="inherit"
          >
            Сбросить
          </Button>
        )}
      </Paper>

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
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
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    {products.length === 0 
                      ? 'Нет данных о номенклатуре' 
                      : 'Ничего не найдено по заданным фильтрам'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => (
                <TableRow
                  key={product.id}
                  hover
                  onClick={() => onView?.(product)}
                  sx={{
                    cursor: 'pointer',
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
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
                            onClick={(e) => { e.stopPropagation(); onView(product); }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {onEdit && (
                        <Tooltip title="Редактировать">
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {onDelete && (
                        <Tooltip title="Удалить">
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Копировать">
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleClone(product.id); }}
                          disabled={isCloning !== null}
                          color="primary"
                        >
                          {isCloning === product.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <CopyIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
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
        count={filteredProducts.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Строк на странице:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} из ${count !== -1 ? count : `больше чем ${to}`}`
        }
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
export default ProductsTable;