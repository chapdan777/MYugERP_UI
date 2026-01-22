/**
 * Форма характеристик материала заказа
 */
import { useState } from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { GlassCard } from '@shared/ui';
import type { OrderMaterialData } from '@entities/order';

interface OrderMaterialFormProps {
  /** Начальные значения формы */
  initialData?: Partial<OrderMaterialData>;
  /** Колбэк при изменении данных */
  onChange?: (data: OrderMaterialData) => void;
}

const materials = ['Ротанг', 'Ясень', 'Дуб', 'Бук', 'МДФ'];
const textures = ['Витая', 'Прямая', 'Ромб', 'Квадрат'];
const facadeModels = ['Ясень', 'Классика', 'Модерн', 'Прованс'];
const panelModels = ['Стандарт с рубашкой 1.5мм', 'Филенка гладкая', 'Филенка с фаской'];
const panelMaterials = ['Ясень', 'Дуб', 'МДФ', 'Шпон'];
const colors = ['Белый', 'Слоновая кость', 'Натуральный', 'Венге'];
const patinas = ['Золотая', 'Серебряная', 'Бронзовая', 'Без патины'];
const glossOptions = ['Легкий глянец', 'Матовый', 'Глянцевый', 'Полуглянец'];

/**
 * Форма характеристик материала
 */
export const OrderMaterialForm = ({ initialData, onChange }: OrderMaterialFormProps) => {
  const [formData, setFormData] = useState<OrderMaterialData>({
    material: initialData?.material || 'Ротанг',
    texture: initialData?.texture || 'Витая',
    facadeModel: initialData?.facadeModel || 'Ясень',
    additive: initialData?.additive || '-',
    thermalSeam: initialData?.thermalSeam || '+',
    panelModel: initialData?.panelModel || 'Стандарт с рубашкой 1.5мм',
    panelMaterial: initialData?.panelMaterial || 'Ясень',
    color: initialData?.color || 'Белый',
    patina: initialData?.patina || 'Золотая',
    gloss: initialData?.gloss || 'Легкий глянец',
    additionalParams: initialData?.additionalParams || 'Непрокрашенная пора',
    comment: initialData?.comment || 'Рамка без термошва! Нанесение патины стандартное не напылением!',
  });

  const handleChange = (field: keyof OrderMaterialData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange?.(newData);
  };

  return (
    <GlassCard sx={{ mb: 2 }}>
      <Grid container spacing={2}>
        {/* Левая колонка */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={1.5}>
            <Grid size={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ minWidth: 120, fontWeight: 500 }}>
                  Материал заказа
                </Typography>
                <TextField
                  select
                  size="small"
                  value={formData.material}
                  onChange={(e) => handleChange('material', e.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  {materials.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ minWidth: 120, fontWeight: 500 }}>
                  Модель фасада
                </Typography>
                <TextField
                  select
                  size="small"
                  value={formData.facadeModel}
                  onChange={(e) => handleChange('facadeModel', e.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  {facadeModels.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ minWidth: 120, fontWeight: 500 }}>
                  Модель филенки
                </Typography>
                <TextField
                  select
                  size="small"
                  value={formData.panelModel}
                  onChange={(e) => handleChange('panelModel', e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  {panelModels.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ minWidth: 120, fontWeight: 500 }}>
                  Цвет
                </Typography>
                <TextField
                  select
                  size="small"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  {colors.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ minWidth: 120, fontWeight: 500 }}>
                  Глянцевость
                </Typography>
                <TextField
                  select
                  size="small"
                  value={formData.gloss}
                  onChange={(e) => handleChange('gloss', e.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  {glossOptions.map((g) => (
                    <MenuItem key={g} value={g}>
                      {g}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Grid>
          </Grid>
        </Grid>

        {/* Правая колонка */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={1.5}>
            <Grid size={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ minWidth: 150, fontWeight: 500 }}>
                  Текстура
                </Typography>
                <TextField
                  select
                  size="small"
                  value={formData.texture}
                  onChange={(e) => handleChange('texture', e.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  {textures.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ minWidth: 150, fontWeight: 500 }}>
                  Присадка
                </Typography>
                <TextField
                  size="small"
                  value={formData.additive}
                  onChange={(e) => handleChange('additive', e.target.value)}
                  sx={{ width: 60 }}
                />
                <Typography variant="body2" sx={{ minWidth: 80, fontWeight: 500 }}>
                  Термошов
                </Typography>
                <IconButton size="small" color={formData.thermalSeam === '+' ? 'primary' : 'default'}>
                  {formData.thermalSeam === '+' ? <AddIcon /> : <RemoveIcon />}
                </IconButton>
              </Box>
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ minWidth: 150, fontWeight: 500 }}>
                  Материал филенки
                </Typography>
                <TextField
                  select
                  size="small"
                  value={formData.panelMaterial}
                  onChange={(e) => handleChange('panelMaterial', e.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  {panelMaterials.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ minWidth: 150, fontWeight: 500 }}>
                  Патина
                </Typography>
                <TextField
                  select
                  size="small"
                  value={formData.patina}
                  onChange={(e) => handleChange('patina', e.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  {patinas.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ minWidth: 150, fontWeight: 500 }}>
                  Доп. параметры отделки
                </Typography>
                <TextField
                  size="small"
                  value={formData.additionalParams}
                  onChange={(e) => handleChange('additionalParams', e.target.value)}
                  sx={{ flexGrow: 1 }}
                />
              </Box>
            </Grid>
          </Grid>
        </Grid>

        {/* Комментарий */}
        <Grid size={12}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mt: 1 }}>
            <Typography variant="body2" sx={{ minWidth: 120, fontWeight: 500 }}>
              Комментарий
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'warning.main',
                fontStyle: 'italic',
              }}
            >
              {formData.comment}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </GlassCard>
  );
};
