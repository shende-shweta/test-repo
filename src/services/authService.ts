import axios from 'axios';
import type { LoginRequest, LoginResponse } from '../types/auth';

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await axios.post<LoginResponse>(
    `${process.env.REACT_APP_API_BASE_URL}/auth/login`,
    credentials
  );
  return response.data;
}
