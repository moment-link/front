export interface TokenRefreshData {
  accessToken: string;
  accessTokenExpiresIn: string;
}

export interface HostUser {
  id: number | string;
  email: string;
  name: string;
  status: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';