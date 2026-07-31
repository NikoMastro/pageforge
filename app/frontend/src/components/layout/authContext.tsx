import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { pageforgeApi } from "../../api";

interface IAPUser {
  email: string;
  id: string;
}

type AuthContextValue = {
  user: IAPUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IAPUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    console.info('Sign-out is managed by IAP at the edge; no client action taken.');
  }, []);

  useEffect(() => {
    // Fetch IAP user info from backend
    // Note: If users reach this point, they're already authenticated by IAP at the load balancer
    const fetchIAPUser = async () => {
      try {
        const data = await pageforgeApi.getIAPUserInfo();
        setUser({ email: data.email, id: data.id });
      } catch (error) {
        console.error('Failed to fetch IAP user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIAPUser();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signOut,
    }),
    [user, loading, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const RequireAllowed: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Since IAP protects at load balancer level, just render children immediately
  // User info will populate in the background
  return <>{children}</>;
};
