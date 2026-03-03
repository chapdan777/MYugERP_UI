import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';

interface ConfirmDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** The title of the confirmation dialog */
    title: string;
    /** The main message text */
    content: string;
    /** Callback when user clicks Cancel or closes the dialog */
    onClose: () => void;
    /** Callback containing the async deletion logic when user clicks Confirm */
    onConfirm: () => Promise<void>;
    /** Optional explicit label for the confirm button */
    confirmText?: string;
    /** Optional explicit label for the cancel button */
    cancelText?: string;
}

/**
 * A reusable confirmation dialog for destructive actions (like deletion).
 * Handles loading states and errors automatically during the async onConfirm action.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title,
    content,
    onClose,
    onConfirm,
    confirmText = 'Удалить',
    cancelText = 'Отмена'
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await onConfirm();
            onClose(); // Automatically close on success
        } catch (err: any) {
            console.error('Confirmation action failed:', err);
            setError(err.response?.data?.message || err.message || 'Произошла ошибка при выполнении операции');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setError(null);
            onClose();
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-description"
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle id="confirm-dialog-title">
                    {title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-dialog-description">
                        {content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={isLoading} color="primary">
                        {cancelText}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        color="error"
                        variant="contained"
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                        autoFocus
                    >
                        {isLoading ? 'Удаление...' : confirmText}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Error Snackbar if the action fails directly within the dialog context */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
};
