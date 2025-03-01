import { User } from '../types';

const USER_STORAGE_KEY = 'auth_user';
const TOKEN_STORAGE_KEY = 'auth_token';

export const storeUser = (user: User): void => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const getStoredUser = (): User | null => {
  const userJson = localStorage.getItem(USER_STORAGE_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

export const clearStoredUser = (): void => {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const storeToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};