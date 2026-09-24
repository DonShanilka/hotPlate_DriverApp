import { apiPost } from "./client";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const loginDriver = (data: LoginData) =>
  apiPost<AuthResponse>("/users/login", data);
export const registerDriver = (data: RegisterData) =>
  apiPost<void>("/users/register", data);
