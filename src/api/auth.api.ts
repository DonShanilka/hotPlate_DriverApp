import api from "./axios";

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

export const loginDriver = async (data: LoginData) => {
  const response = await api.post("/users/login", data);
  return response.data;
};

export const registerDriver = async (data: RegisterData) => {
  const response = await api.post("/users/register", data);
  return response.data;
};
