import api, { setToken, clearToken } from "./api";

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone: string | null;
  governorate: string | null;
  address: string | null;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", { email, password });
    const data = response.data;
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  register: async (payload: {
    fullName: string;
    email: string;
    password?: string;
    phone?: string;
    governorate?: string;
    address?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", payload);
    const data = response.data;
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  logout: (): void => {
    clearToken();
  },
};
