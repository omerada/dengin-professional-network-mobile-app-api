# Context API Patterns

**Version:** 1.0
**Last Updated:** 2024-11-30
**Complexity:** ⭐⭐ (Medium)

---

## 1. Overview

React Context API patterns for global state, theme management, localization ve app-wide configuration.

---

## 2. Theme Context

**src/contexts/ThemeContext.tsx:**

```typescript
import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useColorScheme } from "react-native";
import { useUIStore } from "@stores/uiStore";

type ThemeMode = "light" | "dark" | "system";

interface Theme {
  mode: ThemeMode;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  typography: {
    h1: { fontSize: number; fontWeight: string };
    h2: { fontSize: number; fontWeight: string };
    h3: { fontSize: number; fontWeight: string };
    body: { fontSize: number; fontWeight: string };
    caption: { fontSize: number; fontWeight: string };
  };
}

const lightTheme: Theme = {
  mode: "light",
  colors: {
    primary: "#007AFF",
    secondary: "#5856D6",
    background: "#FFFFFF",
    surface: "#F2F2F7",
    text: "#000000",
    textSecondary: "#8E8E93",
    border: "#C6C6C8",
    error: "#FF3B30",
    success: "#34C759",
    warning: "#FF9500",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: "bold" },
    h2: { fontSize: 24, fontWeight: "bold" },
    h3: { fontSize: 20, fontWeight: "600" },
    body: { fontSize: 16, fontWeight: "normal" },
    caption: { fontSize: 14, fontWeight: "normal" },
  },
};

const darkTheme: Theme = {
  ...lightTheme,
  mode: "dark",
  colors: {
    primary: "#0A84FF",
    secondary: "#5E5CE6",
    background: "#000000",
    surface: "#1C1C1E",
    text: "#FFFFFF",
    textSecondary: "#8E8E93",
    border: "#38383A",
    error: "#FF453A",
    success: "#32D74B",
    warning: "#FF9F0A",
  },
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const themeMode = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  const isDark = useMemo(() => {
    if (themeMode === "system") {
      return systemColorScheme === "dark";
    }
    return themeMode === "dark";
  }, [themeMode, systemColorScheme]);

  const theme = useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  const value = useMemo(
    () => ({
      theme,
      isDark,
      setThemeMode: setTheme,
    }),
    [theme, isDark, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

// Usage
const MyComponent = () => {
  const { theme, isDark, setThemeMode } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>
        Current mode: {isDark ? "Dark" : "Light"}
      </Text>
    </View>
  );
};
```

---

## 3. Localization Context

**src/contexts/LocalizationContext.tsx:**

```typescript
import React, { createContext, useContext, useMemo } from "react";
import { useUIStore } from "@stores/uiStore";

type Language = "tr" | "en";

interface Translations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    loading: string;
    error: string;
  };
  auth: {
    login: string;
    register: string;
    logout: string;
    email: string;
    password: string;
  };
  // ... more translation keys
}

const translations: Record<Language, Translations> = {
  tr: {
    common: {
      save: "Kaydet",
      cancel: "İptal",
      delete: "Sil",
      edit: "Düzenle",
      loading: "Yükleniyor...",
      error: "Bir hata oluştu",
    },
    auth: {
      login: "Giriş Yap",
      register: "Kayıt Ol",
      logout: "Çıkış Yap",
      email: "E-posta",
      password: "Şifre",
    },
  },
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      loading: "Loading...",
      error: "An error occurred",
    },
    auth: {
      login: "Login",
      register: "Register",
      logout: "Logout",
      email: "Email",
      password: "Password",
    },
  },
};

interface LocalizationContextType {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(
  undefined
);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const language = useUIStore((state) => state.language);
  const setLanguage = useUIStore((state) => state.setLanguage);

  const t = useMemo(() => translations[language], [language]);

  const value = useMemo(
    () => ({
      language,
      t,
      setLanguage,
    }),
    [language, t, setLanguage]
  );

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useLocalization must be used within LocalizationProvider");
  }
  return context;
};

// Usage
const LoginScreen = () => {
  const { t } = useLocalization();

  return (
    <View>
      <Text>{t.auth.login}</Text>
      <Button title={t.common.save} />
    </View>
  );
};
```

---

## 4. Config Context

**src/contexts/ConfigContext.tsx:**

```typescript
import React, { createContext, useContext, useMemo } from "react";
import { ENV } from "@config/env";

interface AppConfig {
  apiUrl: string;
  wsUrl: string;
  environment: "development" | "staging" | "production";
  features: {
    biometric: boolean;
    notifications: boolean;
    analytics: boolean;
  };
  limits: {
    maxImageSize: number;
    maxVideoSize: number;
    maxImageCount: number;
  };
}

const config: AppConfig = {
  apiUrl: ENV.API_URL,
  wsUrl: ENV.WS_URL,
  environment: ENV.NODE_ENV,
  features: {
    biometric: true,
    notifications: true,
    analytics: ENV.NODE_ENV === "production",
  },
  limits: {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxVideoSize: 50 * 1024 * 1024, // 50MB
    maxImageCount: 5,
  },
};

const ConfigContext = createContext<AppConfig | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const value = useMemo(() => config, []);
  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
};

export const useConfig = (): AppConfig => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within ConfigProvider");
  }
  return context;
};
```

---

## 5. Combined Providers

**src/contexts/index.tsx:**

```typescript
import React from "react";
import { ThemeProvider } from "./ThemeContext";
import { LocalizationProvider } from "./LocalizationContext";
import { ConfigProvider } from "./ConfigContext";

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ConfigProvider>
      <LocalizationProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </LocalizationProvider>
    </ConfigProvider>
  );
};

// Usage in App.tsx
import { AppProviders } from "@contexts";

export default function App() {
  return (
    <AppProviders>
      <Navigation />
    </AppProviders>
  );
}
```

---

## 6. Advanced Pattern: Context with Reducer

**src/contexts/CartContext.tsx:**

```typescript
import React, { createContext, useContext, useReducer, useMemo } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }

      return {
        ...state,
        items: [...state.items, action.payload],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case "CLEAR_CART":
      return {
        items: [],
        total: 0,
      };

    default:
      return state;
  }
};

interface CartContextType extends CartState {
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
  });

  const value = useMemo(
    () => ({
      ...state,
      addItem: (item: CartItem) =>
        dispatch({ type: "ADD_ITEM", payload: item }),
      removeItem: (id: string) =>
        dispatch({ type: "REMOVE_ITEM", payload: id }),
      updateQuantity: (id: string, quantity: number) =>
        dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
    }),
    [state]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
```

---

## 7. Performance Optimization

**Split contexts to avoid unnecessary re-renders:**

```typescript
// Bad: Single context with all state
const AppContext = createContext({
  user: null,
  theme: "light",
  language: "tr",
  setUser: () => {},
  setTheme: () => {},
  setLanguage: () => {},
});

// Good: Separate contexts
const UserContext = createContext({ user: null, setUser: () => {} });
const ThemeContext = createContext({ theme: "light", setTheme: () => {} });
const LanguageContext = createContext({
  language: "tr",
  setLanguage: () => {},
});
```

**Memoize context value:**

```typescript
export const MyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState(initialState);

  // Bad: New object on every render
  // const value = { state, setState };

  // Good: Memoized value
  const value = useMemo(() => ({ state, setState }), [state]);

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
};
```

---

## 8. Summary

### Features:

- ✅ Theme context with light/dark mode
- ✅ Localization context for i18n
- ✅ Config context for app settings
- ✅ Combined providers pattern
- ✅ Context with reducer (advanced state)
- ✅ Performance optimization
- ✅ Type-safe contexts with TypeScript

**Result:** Clean, type-safe global state management with Context API.
