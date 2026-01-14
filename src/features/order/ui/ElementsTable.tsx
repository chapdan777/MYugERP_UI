/**
 * Таблица элементов заказа (фасадные/карнизные элементы)
 */
import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import InputAdornment from '@mui/material/InputAdornment';
import StarIcon from '@mui/icons-material/Star';
import { GlassCard } from '@shared/ui';
import type { FacadeElement } from '@entities/order';

interface ElementsTableProps {
  /** Заголовок таблицы */
  title: string;
  /** Элементы таблицы */
  elements: FacadeElement[];
  /** Колбэк при изменении элементов */
  onChange?: (elements: FacadeElement[]) => void;
}

/**
 * Таблица элементов с возможностью редактирования
 */
export const ElementsTable = ({ title, elements: initialElements, onChange }: ElementsTableProps) => {
  const [elements, setElements] = useState<FacadeElement[]>(initialElements);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddElement = () => {
    const newElement: FacadeElement = {
      id: Date.now(),
      name: '',
      length: 0,
      width: 0,
      quantity: 1,
      comment: '',
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    onChange?.(newElements);
  };

  const handleRemoveElement = (id: number) => {
    const newElements = elements.filter((el) => el.id !== id);
    setElements(newElements);
    onChange?.(newElements);
  };

  const handleElementChange = (id: number, field: keyof FacadeElement, value: string | number) => {
    const newElements = elements.map((el) =>
      el.id === id ? { ...el, [field]: value } : el
    );
    setElements(newElements);
    onChange?.(newElements);
  };

  const filteredElements = elements.filter(
    (el) =>
      el.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchQuery === ''
  );

  return (
    <GlassCard>
      {/* Заголовок и действия */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 150 }}
          />
          <IconButton size="small">
            <FilterListIcon />
          </IconButton>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddElement}
          >
            Добавить
          </Button>
        </Box>
      </Box>

      {/* Строка быстрого добавления */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Название"
          sx={{ width: 150 }}
        />
        <TextField
          size="small"
          placeholder="Длина"
          type="number"
          sx={{ width: 80 }}
        />
        <TextField
          size="small"
          placeholder="Ширина"
          type="number"
          sx={{ width: 80 }}
        />
        <TextField
          size="small"
          placeholder="Кол-во"
          type="number"
          sx={{ width: 60 }}
        />
        <TextField
          size="small"
          placeholder="Комментарий"
          sx={{ flexGrow: 1 }}
        />
        <IconButton color="primary" size="small">
          <AddIcon />
        </IconButton>
      </Box>

      {/* Таблица */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Наименование</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: 80 }}>
                Длина
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: 80 }}>
                Ширина
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: 60 }}>
                Кол-во
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Комментарий</TableCell>
              <TableCell align="center" sx={{ width: 80 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredElements.map((element) => (
              <TableRow key={element.id} hover>
                <TableCell>
                  <TextField
                    size="small"
                    variant="standard"
                    value={element.name}
                    onChange={(e) => handleElementChange(element.id, 'name', e.target.value)}
                    fullWidth
                    slotProps={{
                      input: {
                        disableUnderline: true,
                      },
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <TextField
                    size="small"
                    variant="standard"
                    type="number"
                    value={element.length}
                    onChange={(e) => handleElementChange(element.id, 'length', Number(e.target.value))}
                    slotProps={{
                      input: {
                        disableUnderline: true,
                        sx: { textAlign: 'center' },
                      },
                    }}
                    sx={{ width: 60 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <TextField
                    size="small"
                    variant="standard"
                    type="number"
                    value={element.width}
                    onChange={(e) => handleElementChange(element.id, 'width', Number(e.target.value))}
                    slotProps={{
                      input: {
                        disableUnderline: true,
                        sx: { textAlign: 'center' },
                      },
                    }}
                    sx={{ width: 60 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <TextField
                    size="small"
                    variant="standard"
                    type="number"
                    value={element.quantity}
                    onChange={(e) => handleElementChange(element.id, 'quantity', Number(e.target.value))}
                    slotProps={{
                      input: {
                        disableUnderline: true,
                        sx: { textAlign: 'center' },
                      },
                    }}
                    sx={{ width: 40 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    variant="standard"
                    value={element.comment || ''}
                    onChange={(e) => handleElementChange(element.id, 'comment', e.target.value)}
                    fullWidth
                    slotProps={{
                      input: {
                        disableUnderline: true,
                      },
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" color="warning">
                    <StarIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveElement(element.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </GlassCard>
  );
};
