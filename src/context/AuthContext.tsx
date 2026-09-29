import { apiGet } from "@/lib/api/client";
import { setAuthUser } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/store/hooks";
import { User } from "@/types/auth.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  setUser: (user: unknown | null) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function unwrapUser(response: unknown): User | null {
  if (!response || typeof response !== "object") return null;
  const value = response as Record<string, unknown>;
  const candidate =
    value.user ?? value.profile ?? value.data ?? value.result ?? response;

  if (!candidate || typeof candidate !== "object") return null;
  const data = candidate as Record<string, unknown>;
  if (data.user && typeof data.user === "object") {
    return unwrapUser(data.user);
  }

  const firstName = data.first_name ?? data.firstName ?? data.firstname;
  const id = data._id ?? data.id ?? data.userId;
  const email = data.email;
  if (typeof firstName !== "string" || typeof email !== "string") return null;

  return {
    ...(data as Partial<User>),
    _id: typeof id === "string" ? id : "",
    first_name: firstName,
    last_name:
      typeof (data.last_name ?? data.lastName) === "string"
        ? String(data.last_name ?? data.lastName)
        : "",
    email,
    role: "DRIVER",
    status:
      data.status === "INACTIVE" || data.status === "BLOCKED"
        ? data.status
        : "ACTIVE",
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const [stored, token] = await Promise.all([
          AsyncStorage.getItem("user"),
          AsyncStorage.getItem("token"),
        ]);

        let storedUser: User | null = null;
        if (stored) {
          try {
            storedUser = unwrapUser(JSON.parse(stored));
          } catch {
            await AsyncStorage.removeItem("user");
          }
        }

        if (token) {
          try {
            const response = await apiGet<unknown>("/users/profile");
            const currentUser = unwrapUser(response);
            if (currentUser) {
              setUserState(currentUser);
              await AsyncStorage.setItem("user", JSON.stringify(currentUser));
              dispatch(setAuthUser(toReduxUser(currentUser)));
              return;
            }
          } catch {
            // Retain the last cached user when offline or when profile fetch fails.
          }
        }
        setUserState(storedUser);
        dispatch(setAuthUser(storedUser ? toReduxUser(storedUser) : null));
      } catch {
        setUserState(null);
        dispatch(setAuthUser(null));
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [dispatch]);

  const setUser = async (value: unknown | null) => {
    const user = unwrapUser(value);
    setUserState(user);
    dispatch(setAuthUser(user ? toReduxUser(user) : null));
    if (user) {
      await AsyncStorage.setItem("user", JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem("user");
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

function toReduxUser(user: User) {
  return {
    ...user,
    id: user._id,
    firstName: user.first_name,
    lastName: user.last_name,
  };
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
