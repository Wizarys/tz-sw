import React, { useEffect, useMemo, useState } from "react";
import styles from "./UserList.module.scss";
import useLocalStorage from "use-local-storage";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUserMutation } from "@/shared/query/queryFunctions";
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TextField,
    Typography,
} from "@mui/material";
import { User } from "@/enteties/UserForm/types/User";

type Order = "asc" | "desc";
type SortField = "fullName" | "gender" | "birthDate";

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ru-RU");

function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    content,
}: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    content: string;
}) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography>{content}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button onClick={onConfirm} color="error" variant="contained">
                    Удалить
                </Button>
            </DialogActions>
        </Dialog>
    );
}

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [sortField, setSortField] = useState<SortField>("fullName");
    const [order, setOrder] = useState<Order>("asc");
    const [search, setSearch] = useState("");    
    const [storedUsers, setStoredUsers] = useLocalStorage<User[]>("users", []);
    const [deleteUserState, setDeleteUser] = useState<User | null>(null);
    const [isDeleteSuccess, setIsDeleteSuccess] = useState(false);
    const queryClient = useQueryClient();

    function saveUsers(users: User[]) {
        setStoredUsers(users) 
    }

    useEffect(() => {
        setUsers(storedUsers);
    }, [storedUsers]);

    const filteredUsers = useMemo(() => {
        let result = users;
        if (search.trim()) {
            result = result.filter((u) =>
                u.name.toLowerCase().includes(search.trim().toLowerCase())
            );
        }
        result = [...result].sort((a, b) => {
            let aValue: string | number = "";
            let bValue: string | number = "";
            switch (sortField) {
                case "fullName":
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case "gender":
                    aValue = a.gender;
                    bValue = b.gender;
                    break;
                case "birthDate":
                    aValue = a.birthDate;
                    bValue = b.birthDate;
                    break;
            }
            if (aValue < bValue) return order === "asc" ? -1 : 1;
            if (aValue > bValue) return order === "asc" ? 1 : -1;
            return 0;
        });
        return result;
    }, [users, search, sortField, order]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setOrder(order === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setOrder("asc");
        }
    };

    const deleteUser = useMutation({
        mutationFn: (userId: string | null) => deleteUserMutation(Number(userId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            const updatedUsers = users.filter((u) => u.id !== deleteUserState?.id);
            setUsers(updatedUsers);
            saveUsers(updatedUsers);
            setDeleteUser(null);
            setIsDeleteSuccess(true);
        },
        onError: (error) => {
            console.error('Ошибка при удалении пользователя:', error);
        }
    });

    const handleDeleteUser = () => {
        if (deleteUserState) {
            deleteUser.mutate(deleteUserState.id);
        }
    };

    return (
        <Box p={2} className={styles.userList}>
            <Typography variant="h5" mb={2}>
                Список пользователей
            </Typography>
            <Box mb={2} display="flex" justifyContent="flex-end">
                <TextField
                    placeholder="Поиск по фамилии"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="small"
                />
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Аватар</TableCell>
                            <TableCell sortDirection={sortField === "fullName" ? order : false}>
                                <TableSortLabel
                                    active={sortField === "fullName"}
                                    direction={sortField === "fullName" ? order : "asc"}
                                    onClick={() => handleSort("fullName")}
                                >
                                    ФИО
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell sortDirection={sortField === "gender" ? order : false}>
                                <TableSortLabel
                                    active={sortField === "gender"}
                                    direction={sortField === "gender" ? order : "asc"}
                                    onClick={() => handleSort("gender")}
                                >
                                    Пол
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={sortField === "birthDate" ? order : false}>
                                <TableSortLabel
                                    active={sortField === "birthDate"}
                                    direction={sortField === "birthDate" ? order : "asc"}
                                    onClick={() => handleSort("birthDate")}
                                >
                                    Дата рождения
                                </TableSortLabel>
                            </TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <Avatar src={user.avatarUrl}>
                                    </Avatar>
                                </TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.gender === 'male' ? 'Мужчина' : 'Женщина'}</TableCell>
                                <TableCell>{formatDate(user.birthDate)}</TableCell>
                                <TableCell>
                                    <Link 
                                        to="/" 
                                        state={{ userData: user }}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <Button
                                            className={styles.tableButton}
                                            variant="contained"
                                            aria-label="edit"
                                        >
                                            Редактировать<br/> пользователя
                                        </Button>
                                    </Link>
                                    <Button
                                        className={styles.tableButtonRemove}
                                        variant="outlined"
                                        aria-label="delete"
                                        color="error"
                                        onClick={() => setDeleteUser(user)}
                                    >
                                        Удалить<br/> пользователя
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredUsers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    Нет пользователей
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <ConfirmDialog
                open={!!deleteUserState}
                onClose={() => setDeleteUser(null)}
                onConfirm={handleDeleteUser}
                title="Удалить пользователя?"
                content="Вы уверены, что хотите удалить пользователя? Это действие нельзя отменить."
            />

            <Dialog 
                open={isDeleteSuccess} 
                onClose={() => setIsDeleteSuccess(false)}
                PaperProps={{
                    sx: { p: '15px' }
                }}
            >
                <DialogTitle>
                    Успешно!
                </DialogTitle>
                <DialogContent>
                    Пользователь успешно удален
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setIsDeleteSuccess(false)} 
                        color="primary" 
                        variant="contained"
                        autoFocus
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserList;
