import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name?: string;
  email: string;
  sports?: string[];
  region?: string;
  dob?: string;
  gender?: string;
  level?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Omit<User, 'id'>, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing user on mount
    const storedUser = localStorage.getItem('mock_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate finding a user (for this mock, we'll just "login" effectively any non-empty input, 
    // or you could check against a stored signup default? For now, let's keep it simple: 
    // If they login, we create a session for that email).
    const mockUser: User = { id: 'mock-id-' + Date.now(), email, name: 'User' };

    // If we wanted to be stricter, we'd only allow login if they signed up previously.
    // Let's implement that simple check using another localStorage key 'mock_db_users'
    const dbUsersStr = localStorage.getItem('mock_db_users');
    const dbUsers = dbUsersStr ? JSON.parse(dbUsersStr) : [];
    const foundUser = dbUsers.find((u: any) => u.email === email && u.password === password);

    if (foundUser) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _p, ...sessionUser } = foundUser;
      setUser(sessionUser);
      localStorage.setItem('mock_user', JSON.stringify(sessionUser));
    } else {
      setIsLoading(false);
      throw new Error("Invalid email or password");
    }

    setIsLoading(false);
  };

  const signup = async (userData: Omit<User, 'id'>, password: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if user exists
    const dbUsersStr = localStorage.getItem('mock_db_users');
    let dbUsers = dbUsersStr ? JSON.parse(dbUsersStr) : [];

    if (dbUsers.find((u: any) => u.email === userData.email)) {
      setIsLoading(false);
      throw new Error("User already exists");
    }

    const newUser = {
      id: 'mock-id-' + Date.now(),
      ...userData,
      password
    };
    dbUsers.push(newUser);
    localStorage.setItem('mock_db_users', JSON.stringify(dbUsers));

    // Auto login
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _p, ...sessionUser } = newUser;
    setUser(sessionUser);
    localStorage.setItem('mock_user', JSON.stringify(sessionUser));

    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUser(null);
    localStorage.removeItem('mock_user');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
