import { createContext } from 'react';

export interface AuthContextType {
  authenticated: boolean;
  login: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  authenticated: false,
  login: async () => {}
});

export default AuthContext; 