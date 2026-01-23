export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    access_token: string;
    user: AuthUser;
  };
  message?: string;
}
