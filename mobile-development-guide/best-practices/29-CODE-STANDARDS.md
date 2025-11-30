# Code Standards & Conventions

**Purpose:** Consistent, maintainable, scalable code
**Complexity:** ⭐⭐ (Basic)

---

## Overview

Bu doküman, React Native projesinde tutarlı kod yazımı için standartları tanımlar.

---

## Folder Structure

```
src/
├── core/                    # Core utilities
│   ├── api/
│   │   ├── client.ts       # Axios instance
│   │   └── interceptors.ts
│   ├── storage/
│   │   ├── asyncStorage.ts
│   │   └── secureStorage.ts
│   └── socket/
│       └── client.ts
├── features/                # Feature modules
│   ├── auth/
│   │   ├── screens/        # UI components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   └── index.ts        # Public API
│   ├── feed/
│   └── messaging/
├── shared/                  # Shared code
│   ├── components/         # Reusable UI
│   ├── hooks/              # Shared hooks
│   ├── utils/              # Utilities
│   └── constants/          # Constants
├── navigation/              # Navigation
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── types.ts
├── theme/                   # Design system
│   ├── colors.ts
│   ├── spacing.ts
│   └── typography.ts
└── App.tsx
```

---

## Naming Conventions

### Files

```typescript
// ✅ DO: PascalCase for components
UserProfile.tsx;
LoginScreen.tsx;
PostCard.tsx;

// ✅ DO: camelCase for utilities/services
authService.ts;
tokenManager.ts;
apiClient.ts;

// ✅ DO: kebab-case for tests
UserProfile.test.tsx;
auth - service.test.ts;

// ❌ DON'T: Inconsistent naming
user_profile.tsx;
login - screen.tsx;
PostCard.js;
```

### Variables & Functions

```typescript
// ✅ DO: Descriptive names
const isAuthenticated = true;
const handleSubmit = () => {};
const getUserProfile = async () => {};

// ❌ DON'T: Abbreviations
const isAuth = true;
const hdlSub = () => {};
const getUsrProf = async () => {};

// ✅ DO: Boolean prefix
const isLoading = false;
const hasError = false;
const canEdit = true;

// ❌ DON'T: Unclear booleans
const loading = false;
const error = false;
const edit = true;
```

### Components

```typescript
// ✅ DO: PascalCase
const UserProfile: React.FC = () => {};
const PostCard: React.FC<PostCardProps> = () => {};

// ❌ DON'T: camelCase
const userProfile: React.FC = () => {};
const postCard: React.FC<PostCardProps> = () => {};
```

### Hooks

```typescript
// ✅ DO: use prefix
const useAuth = () => {};
const useFeed = () => {};
const useDebounce = () => {};

// ❌ DON'T: No use prefix
const auth = () => {};
const feed = () => {};
```

---

## TypeScript

### Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Type Definitions

```typescript
// ✅ DO: Explicit types
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

const user: User = {
  id: '1',
  name: 'John',
  email: 'john@example.com',
  createdAt: new Date()
};

// ❌ DON'T: any type
const user: any = { ... };

// ✅ DO: Type inference when obvious
const count = 0; // inferred as number
const name = 'John'; // inferred as string

// ✅ DO: Generic types
const getItem = <T>(key: string): T | null => {
  // ...
};

// ✅ DO: Union types
type Status = 'idle' | 'loading' | 'success' | 'error';

// ✅ DO: Optional properties
interface UserProfile {
  bio?: string;
  avatar?: string;
}
```

---

## Component Structure

### Functional Components

```typescript
// ✅ DO: Consistent structure
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@theme/ThemeContext";

interface UserProfileProps {
  userId: string;
  onEdit?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, onEdit }) => {
  // 1. Hooks
  const theme = useTheme();
  const [user, setUser] = useState<User | null>(null);

  // 2. Effects
  useEffect(() => {
    fetchUser();
  }, [userId]);

  // 3. Handlers
  const fetchUser = async () => {
    const data = await userService.getUser(userId);
    setUser(data);
  };

  const handleEdit = () => {
    onEdit?.();
  };

  // 4. Render
  if (!user) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user.name}</Text>
      <Button title="Edit" onPress={handleEdit} />
    </View>
  );
};

// 5. Styles
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
```

### Memoization

```typescript
// ✅ DO: Memo for expensive renders
const PostCard = React.memo(({ post }: PostCardProps) => {
  return <View>{/* ... */}</View>;
});

// ✅ DO: Custom comparison
const PostCard = React.memo(
  ({ post }: PostCardProps) => {
    return <View>{/* ... */}</View>;
  },
  (prevProps, nextProps) => {
    return prevProps.post.id === nextProps.post.id;
  }
);

// ✅ DO: useMemo for expensive calculations
const sortedPosts = useMemo(() => {
  return posts.sort((a, b) => b.createdAt - a.createdAt);
}, [posts]);

// ✅ DO: useCallback for handlers
const handlePress = useCallback(() => {
  onPress(item.id);
}, [item.id, onPress]);
```

---

## Imports

### Order

```typescript
// ✅ DO: Group imports
// 1. React
import React, { useState, useEffect } from "react";

// 2. React Native
import { View, Text, StyleSheet } from "react-native";

// 3. Third-party
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";

// 4. Internal - absolute imports
import { apiClient } from "@core/api/client";
import { useAuth } from "@features/auth/hooks/useAuth";
import { Button } from "@shared/components/Button";

// 5. Internal - relative imports
import { PostCard } from "./PostCard";
import { styles } from "./styles";

// 6. Types
import type { Post } from "@features/feed/types";
```

### Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@core/*": ["core/*"],
      "@features/*": ["features/*"],
      "@shared/*": ["shared/*"],
      "@navigation/*": ["navigation/*"],
      "@theme/*": ["theme/*"]
    }
  }
}
```

```typescript
// ✅ DO: Use aliases
import { apiClient } from "@core/api/client";
import { Button } from "@shared/components/Button";

// ❌ DON'T: Relative paths from root
import { apiClient } from "../../../core/api/client";
import { Button } from "../../shared/components/Button";
```

---

## Error Handling

```typescript
// ✅ DO: Try-catch for async
const fetchUser = async () => {
  try {
    const user = await userService.getUser(userId);
    setUser(user);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    showErrorToast("Kullanıcı yüklenemedi");
  }
};

// ✅ DO: Type error
const fetchUser = async () => {
  try {
    const user = await userService.getUser(userId);
    setUser(user);
  } catch (error) {
    if (error instanceof ApiError) {
      showErrorToast(error.message);
    } else {
      showErrorToast("Bir hata oluştu");
    }
  }
};

// ✅ DO: Error boundaries for components
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error) {
    console.error("Error boundary caught:", error);
  }

  render() {
    return this.props.children;
  }
}
```

---

## Comments

```typescript
// ✅ DO: Explain why, not what
// Retry 3 times because network is unstable in tunnels
const MAX_RETRIES = 3;

// ❌ DON'T: Obvious comments
// Set max retries to 3
const MAX_RETRIES = 3;

// ✅ DO: JSDoc for public API
/**
 * Fetches user profile by ID
 * @param userId - Unique user identifier
 * @returns User profile or null if not found
 */
export const getUser = async (userId: string): Promise<User | null> => {
  // ...
};

// ✅ DO: TODO comments
// TODO: Add caching
// FIXME: Handle edge case when userId is empty
```

---

## Linting & Formatting

### ESLint

```json
// .eslintrc.js
module.exports = {
  extends: [
    '@react-native-community',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
```

### Prettier

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 80,
  "arrowParens": "always"
}
```

---

## Git Commit Messages

```bash
# ✅ DO: Conventional commits
feat: Add biometric authentication
fix: Resolve token refresh race condition
refactor: Extract validation logic to utils
docs: Update API documentation
test: Add unit tests for authService
chore: Update dependencies

# ❌ DON'T: Vague messages
Update files
Fix bug
WIP
asdfasdf

# ✅ DO: Detailed body
feat: Add biometric authentication

- Integrate react-native-biometrics
- Add Face ID/Touch ID support
- Store biometric preference in SecureStore

Closes #123
```

---

## Summary

✅ **Code Standards:**

- Consistent folder structure
- Clear naming conventions
- TypeScript strict mode
- Component structure pattern
- Import organization
- Error handling
- ESLint + Prettier

**Result:** Maintainable, scalable, team-friendly codebase
