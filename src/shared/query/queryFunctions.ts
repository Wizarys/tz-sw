import { User } from "@/enteties/UserForm/types/User";

const API_ADDRESS = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_REQUES_API_KEY;

const getUsers = async ({pageParam}: {pageParam: number}) => {
    const result = await fetch(`${API_ADDRESS}/users?per_page=8&page=${pageParam}`, {
        headers: {
            'x-api-key': API_KEY as string
        }
    })
    const json = await result.json();
    return json;
}

const updateUserMutation = async (user: User) => {
      const response = await fetch(`${API_ADDRESS}/users/${user.id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'x-api-key': API_KEY as string 
        },
        body: JSON.stringify(user),
      });
      if (!response.ok) {
        throw new Error('Failed to add user');
      }
      return response.json();
    }

const deleteUserMutation = async (userId: number) => {
    const response = await fetch(`${API_ADDRESS}/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'x-api-key': API_KEY as string
        }
    });
    if (!response.ok) {
        throw new Error('Failed to delete user');
    }
    return { success: true };
}

export { getUsers, updateUserMutation, deleteUserMutation }
