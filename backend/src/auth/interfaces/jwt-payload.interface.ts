export interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  role: string;
}

export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string;
  role: string;
}
