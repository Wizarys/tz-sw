import { Controller, Control, FieldErrors } from "react-hook-form";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Box } from "@mui/material";
import dayjs from 'dayjs';
import { User } from "../types/User";
import styles from "./UserForm.module.scss";

interface BirthDatePickerProps {
  control: Control<User>;
  errors: FieldErrors<User>;
}

export default function BirthDatePicker({ control, errors }: BirthDatePickerProps) {
  return (
    <Box sx={{ flex: 1 }}>
      <p className={styles.inputTopLabel}>Дата рождения <span className={styles.asterisk}>*</span></p>
      <Controller
        name="birthDate"
        control={control}
        rules={{
          required: "Обязательное поле",
          validate: (value) => {
            if (!value) return true;
            const birthDate = dayjs(value);
            const today = dayjs();
            const age = today.diff(birthDate, 'year');
            return age >= 18 || "Возраст должен быть не менее 18 лет";
          }
        }}
        render={({ field }) => (
          <DatePicker
            {...field}
            value={field.value ? dayjs(field.value) : null}
            onChange={(newValue) => {
              field.onChange(newValue ? newValue.format('YYYY-MM-DD') : null);
            }}
            format="DD.MM.YYYY"
            slotProps={{
              textField: {
                placeholder: "00.00.0000",
                error: !!errors.birthDate,
                helperText: errors.birthDate?.message,
                fullWidth: true
              }
            }}
          />
        )}
      />
    </Box>
  );
};
