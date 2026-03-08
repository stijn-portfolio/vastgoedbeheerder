export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }
  
  export interface AuthResponse {
    accessToken: string;
    user: User;
  }