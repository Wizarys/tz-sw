import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import BirthDatePicker from "./BirthDatePicker";
import styles from "./UserForm.module.scss";
import { Control, FieldErrors } from "react-hook-form";
import { User } from "../types/User";

interface NewUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  newUserFormData: User;
  setNewUserFormData: React.Dispatch<React.SetStateAction<User>>;
  control: Control<User>;
  errors: FieldErrors<User>;
}

const NewUserModal: React.FC<NewUserModalProps> = ({
  open,
  onClose,
  onSubmit,
  newUserFormData,
  setNewUserFormData,
  control,
  errors,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
    fullWidth
    PaperProps={{
      sx: { p: "15px" },
    }}
  >
    <DialogTitle>Добавить нового пользователя</DialogTitle>
    <DialogContent>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
        <TextField
          label="ФИО"
          value={newUserFormData.name}
          onChange={(e) =>
            setNewUserFormData({ ...newUserFormData, name: e.target.value })
          }
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel>Пол</InputLabel>
          <Select
            value={newUserFormData.gender}
            onChange={(e) =>
              setNewUserFormData({
                ...newUserFormData,
                gender: e.target.value,
              })
            }
            label="Пол"
          >
            <MenuItem value="male">Мужчина</MenuItem>
            <MenuItem value="female">Женщина</MenuItem>
          </Select>
        </FormControl>
        <BirthDatePicker control={control} errors={errors} />
        <FormControl fullWidth>
          <InputLabel>Роль</InputLabel>
          <Select
            value={newUserFormData.role}
            onChange={(e) =>
              setNewUserFormData({
                ...newUserFormData,
                role: e.target.value,
              })
            }
            label="Роль"
          >
            <MenuItem value="doctor">Доктор</MenuItem>
            <MenuItem value="med">Медсестра/Медбрат</MenuItem>
            <MenuItem value="admin">Админ</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button className={styles.cancelButton} onClick={onClose}>
        Отмена
      </Button>
      <Button
        className={styles.primaryButton}
        onClick={onSubmit}
        variant="contained"
        color="primary"
      >
        Добавить
      </Button>
    </DialogActions>
  </Dialog>
);

export default NewUserModal;