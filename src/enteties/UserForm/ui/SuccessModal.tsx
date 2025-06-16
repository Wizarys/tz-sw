import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  isUpdate: boolean;
  buttonClassName?: string;
}

export default function SuccessModal({
  open,
  onClose,
  isUpdate,
  buttonClassName
}: SuccessModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="success-dialog-title"
      PaperProps={{
        sx: { p: '15px' }
      }}
    >
      <DialogTitle id="success-dialog-title">
        Успешно!
      </DialogTitle>
      <DialogContent>
        {isUpdate ? 'Данные пользователя обновлены' : 'Новый пользователь добавлен'}
      </DialogContent>
      <DialogActions>
        <Button
          className={buttonClassName}
          onClick={onClose}
          color="primary"
          variant="contained"
          autoFocus
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}