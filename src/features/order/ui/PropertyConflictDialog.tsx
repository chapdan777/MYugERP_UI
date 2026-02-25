import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';


interface PropertyConflictDialogProps {
    open: boolean;
    onClose: () => void;
    onAddNote: () => void;
    onMoveSection: () => void; // Placeholder for now
    conflictMessage: string;
}

export const PropertyConflictDialog = ({ open, onClose, onAddNote, conflictMessage }: PropertyConflictDialogProps) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Обнаружено расхождение свойств</DialogTitle>
            <DialogContent>
                <Typography variant="body1" paragraph>
                    {conflictMessage}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Вы изменили свойство позиции, и оно теперь отличается от свойств секции.
                    Выберите действие:
                </Typography>
            </DialogContent>
            <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 2, alignItems: 'stretch' }}>
                <Button variant="contained" onClick={onAddNote}>
                    Добавить примечание к позиции
                </Button>
                {/* 
                <Button variant="outlined" onClick={onMoveSection} disabled>
                    Перенести в другую секцию (В разработке)
                </Button>
                */}
                <Button variant="text" onClick={onClose} color="inherit">
                    Отмена
                </Button>
            </DialogActions>
        </Dialog>
    );
};
