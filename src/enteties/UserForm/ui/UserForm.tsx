import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { User } from "../types/User";
import {
  useMutation,
  useQueryClient,
  useInfiniteQuery
} from '@tanstack/react-query'
import {
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  FormHelperText,
  Box,
  Autocomplete,
} from "@mui/material";
import { getUsers, updateUserMutation } from "@/shared/query/queryFunctions";
import useLocalStorage from "use-local-storage";
import { useCallback, useEffect, useState } from "react";
import styles from "./UserForm.module.scss";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import BirthDatePicker from "./BirthDatePicker";
import NewUserModal from "./NewUserModal";
import SuccessModal from "./SuccessModal";

export default function UserForm({ initialData }: { initialData: User }) {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    trigger,
    setFocus
  } = useForm<User>({
    mode: "onBlur",
    shouldFocusError: true,
    defaultValues: initialData ? {
      id: initialData.id,
      name: initialData.name,
      birthDate: initialData.birthDate,
      gender: initialData.gender,
      school: '',
      schoolEndDate: '',
      role: initialData.role || ''
    } : undefined
  });

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inputUserValue, setInputUserValue] = useState("");
  const [inputUserGender, setInputUserGender] = useState<string | null>(null);
  const [storedUsers, setStoredUsers] = useLocalStorage<User[]>("users", []);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [newUserFormData, setNewUserFormData] = useState<User>({
    id: null,
    name: '',
    birthDate: '',
    gender: '',
    school: '',
    schoolEndDate: '',
    role: ''
  });

  dayjs.locale('ru');

  const queryClient = useQueryClient()

  const { data: users,
    fetchNextPage,
  } = useInfiniteQuery(
    {
      queryKey: ['users'],
      queryFn: getUsers,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage.page + 1,
    }
  )

  const addUserMutation = useMutation({
    mutationFn: updateUserMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  useEffect(() => {
    if (initialData) {
      setInputUserValue(initialData.name);
      setSelectedUserId(initialData.id);
      setInputUserGender(initialData.gender);
      reset({
        id: initialData.id,
        name: initialData.name,
        birthDate: initialData.birthDate,
        gender: initialData.gender,
        role: initialData.role || '',
        school: '',
        schoolEndDate: ''
      });
    }
  }, [initialData, reset]);

  const updateUser = (compoundData: User) => {
    addUserMutation.mutate(compoundData, {
      onSuccess: () => {
        setStoredUsers(prevUsers => {
          const existingIndex = prevUsers?.findIndex(user => user.id === selectedUserId) ?? -1;
          if (existingIndex !== -1) {
            const updatedUsers = [...(prevUsers || [])];
            updatedUsers[existingIndex] = compoundData;
            setIsSuccessModalOpen(true);
            return updatedUsers;
          } else {
            setIsSuccessModalOpen(true);
            return [compoundData, ...(prevUsers || [])];
          }
        });
      }
    });
  }

  const onSubmit: SubmitHandler<User> = async (data) => {
    const isValid = await trigger();
    if (!isValid) {
      if (errors.name) setFocus('name');
      else if (errors.gender) setFocus('gender');
      else if (errors.birthDate) setFocus('birthDate');
      else if (errors.role) setFocus('role');
      return;
    }

    const compoundData = {
      ...data,
      name: inputUserValue,
      id: selectedUserId,
    }

    updateUser(compoundData)
  };

  const handleCloseSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(false);
  }, []);

const handleScroll = useCallback((event: React.UIEvent<HTMLUListElement>) => {
  const listboxNode = event.currentTarget;
  const position = listboxNode.scrollTop + listboxNode.clientHeight;
  if (listboxNode.scrollHeight - position <= 1) {
    fetchNextPage();
  }
}, [fetchNextPage]);

  const handleOpenNewUserModal = () => {
    setIsNewUserModalOpen(true);
  };

  const handleCloseNewUserModal = () => {
    setIsNewUserModalOpen(false);
  };

  const handleNewUserSubmit = () => {
    updateUser(newUserFormData)
    setIsNewUserModalOpen(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        component="form"
        className={styles.userForm}
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: 2, width: { xs: '100%', sm: 745 }, m: "auto", mt: 5, mb: 5 }}
      >
        <p className={styles.title}>Регистрация</p>
        <p className={styles.fieldTitle}>О себе</p>
        <Box>
          <p className={styles.inputTopLabel}>ФИО <span className={styles.asterisk}>*</span></p>
          <Controller
            name="name"
            control={control}
            rules={{ required: "Обязательное поле" }}
            render={({ field }) => (
              <Autocomplete
                {...field}
                onInputChange={(_, value) => {
                  setInputUserValue(value);
                  field.onChange(value);
                }}
                onChange={(_, option) => {
                  setSelectedUserId(option?.id)
                }}
                options={users?.pages.flatMap(page => page.data) || []}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Введите ФИО"
                    variant="outlined"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    inputRef={(input) => {
                      field.ref(input);
                      params.inputProps.ref = input;
                    }}
                  />
                )}
                value={inputUserValue}
                getOptionKey={(option) => option.id}
                getOptionLabel={(option) =>
                  typeof option === "string"
                    ? option
                    : `${option.first_name} ${option.last_name}`
                }
                renderOption={(props, option) => {
                  const isInLocalStorage = storedUsers?.some(user => user.id === option.id);
                  const { key, ...otherProps } = props;
                  return (
                    <li
                      key={key}
                      {...otherProps}
                      style={{
                        ...otherProps.style,
                        color: isInLocalStorage ? '#9e9e9e' : 'inherit',
                        cursor: isInLocalStorage ? 'not-allowed' : 'pointer',
                        opacity: isInLocalStorage ? 0.7 : 1
                      }}
                      onClick={(e) => {
                        if (!isInLocalStorage) {
                          otherProps.onClick?.(e);
                        }
                      }}
                    >
                      {`${option.first_name} ${option.last_name}`}
                    </li>
                  );
                }}
                slotProps={{
                  listbox: {
                    style: { maxHeight: 200, overflow: 'auto' },
                    onScroll: handleScroll,
                  }
                }}
                noOptionsText={
                  <Button
                    onClick={handleOpenNewUserModal}
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Добавить нового пользователя
                  </Button>
                }
              />
            )}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ flex: 1 }} >
            <p className={styles.inputTopLabel}>Пол <span className={styles.asterisk}>*</span></p>
            <FormControl error={!!errors.gender} sx={{ width: '100%' }}>
              <Controller
                name="gender"
                control={control}
                defaultValue=""
                rules={{ required: "Обязательное поле" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    onChange={(e) => {
                      setInputUserGender(e.target.value);
                      field.onChange(e.target.value);
                    }}
                    displayEmpty
                    inputRef={field.ref}
                  >
                    <MenuItem disabled value="">
                      <em className={styles.disabled}>Выберите пол</em>
                    </MenuItem>
                    <MenuItem value="male">Мужчина</MenuItem>
                    <MenuItem value="female">Женщина</MenuItem>
                  </Select>
                )}
              />
              <FormHelperText>{errors.gender?.message}</FormHelperText>
            </FormControl>
          </Box>

          <BirthDatePicker control={control} errors={errors} />
        </Box>

        <FormControl error={!!errors.role} sx={{ minWidth: 120, flex: 1 }}>
          <p className={styles.inputTopLabel}>Роль <span className={styles.asterisk}>*</span></p>
          <Controller
            name="role"
            control={control}
            defaultValue=""
            rules={{ required: "Обязательное поле" }}
            render={({ field }) => (
              <Select
                {...field}
                displayEmpty
                inputRef={field.ref}
              >
                <MenuItem disabled value="">
                  <em className={styles.disabled}>Выберите роль</em>
                </MenuItem>
                <MenuItem value="Доктор">Доктор</MenuItem>
                <MenuItem value="Медсестра/Медбрат">{
                  inputUserGender === null ? 'Медсестра/Медбрат' :
                    inputUserGender === 'male' ? 'Медбрат' : 'Медсестра'
                }</MenuItem>
                <MenuItem value="Админ">Админ</MenuItem>
              </Select>
            )}
          />
          <FormHelperText>{errors.role?.message}</FormHelperText>
        </FormControl>

        <p className={styles.fieldTitle}>Образование</p>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ flex: 1 }}>
            <p className={styles.inputTopLabel}>ВУЗ</p>
            <TextField
              placeholder="Выберите ВУЗ"
              sx={{ width: '100%' }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <p className={styles.inputTopLabel}>Дата окончания</p>
            <TextField
              placeholder="00.00.0000"
              type="date"
              sx={{ width: '100%' }}
            />
          </Box>
        </Box>

        <p className={styles.fieldTitle}>Работа</p>
        <p className={styles.inputTopLabel}>Место работы</p>
        <TextField
          placeholder="Место работы"
          sx={{ flex: 1 }}
        />

        <TextField
          placeholder="Должностные обязанности"
          multiline
          rows={4}
          sx={{ flex: 1 }}
        />

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            className={styles.primaryButton}
            type="submit"
            variant="contained"
            fullWidth={false}
            sx={{ minWidth: 182, width: { xs: '100%', sm: 'initial' } }}
          >
            Сохранить
          </Button>
        </Box>
      </Box>

      <NewUserModal
        open={isNewUserModalOpen}
        onClose={handleCloseNewUserModal}
        onSubmit={handleNewUserSubmit}
        newUserFormData={newUserFormData}
        setNewUserFormData={setNewUserFormData}
        control={control}
        errors={errors}
      />

      <SuccessModal
        open={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        isUpdate={!!selectedUserId}
        buttonClassName={styles.primaryButton}
      />
    </LocalizationProvider>
  );
}
