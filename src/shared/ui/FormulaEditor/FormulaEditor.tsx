import React, { useRef, useState } from 'react';
import {
    Box,
    TextField,
    Typography,
    Chip,
    Paper,
    Stack,
    Tooltip
} from '@mui/material';
import { Functions as FunctionsIcon } from '@mui/icons-material';

interface Variable {
    name: string;
    description?: string;
    value?: string | number; // Примерное значение для (будущего) предпросмотра
}

interface FormulaEditorProps {
    value: string;
    onChange: (value: string) => void;
    variables: Variable[];
    label?: string;
    error?: boolean;
    helperText?: string;
    placeholder?: string;
}

export const FormulaEditor: React.FC<FormulaEditorProps> = ({
    value,
    onChange,
    variables,
    label = 'Формула',
    error,
    helperText,
    placeholder = 'Например: H * W + 10'
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [cursorPos, setCursorPos] = useState<number | null>(null);

    const handleInsertVariable = (variableName: string) => {
        const text = value || '';
        const insertAt = cursorPos !== null ? cursorPos : text.length;

        const newValue =
            text.substring(0, insertAt) +
            variableName +
            text.substring(insertAt);

        onChange(newValue);

        // Возвращаем фокус и сдвигаем курсор
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                const newCursorPos = insertAt + variableName.length;
                inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
                setCursorPos(newCursorPos);
            }
        }, 0);
    };

    const handleSelect = (e: React.SyntheticEvent<HTMLDivElement, Event>) => {
        // Сохраняем позицию курсора при клике/выделении
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            setCursorPos(e.target.selectionStart);
        }
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            setCursorPos(e.target.selectionStart);
        }
    }

    const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            setCursorPos(e.target.selectionStart);
        }
    }

    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                <FunctionsIcon color="action" fontSize="small" />
                <Typography variant="subtitle2" color="text.secondary">
                    {label}
                </Typography>
            </Box>

            <TextField
                inputRef={inputRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onSelect={handleSelect as any}
                onClick={handleClick as any}
                onKeyUp={handleKeyUp as any}
                placeholder={placeholder}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                error={error}
                helperText={helperText}
                sx={{ mb: 2, fontFamily: 'monospace' }}
                inputProps={{
                    style: { fontFamily: 'monospace' }
                }}
            />

            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Доступные переменные:
            </Typography>

            <Stack direction="row" flexWrap="wrap" gap={1}>
                {variables.map((variable) => (
                    <Tooltip key={variable.name} title={variable.description || ''} arrow>
                        <Chip
                            label={variable.name}
                            onClick={() => handleInsertVariable(variable.name)}
                            size="small"
                            variant="outlined"
                            clickable
                            sx={{ fontFamily: 'monospace' }}
                        />
                    </Tooltip>
                ))}
            </Stack>
        </Paper>
    );
};
