// __mocks__/@invertase/react-native-apple-authentication.js

const appleAuth = {
  performRequest: jest.fn(),
  getCredentialStateForUser: jest.fn(),
  isSupported: true,
  Operation: {
    LOGIN: 1,
    REFRESH: 2,
    LOGOUT: 3,
    IMPLICIT: 4,
  },
  Scope: {
    EMAIL: 0,
    FULL_NAME: 1,
  },
  State: {
    REVOKED: 0,
    AUTHORIZED: 1,
    NOT_FOUND: 2,
    TRANSFERRED: 3,
  },
};

export default appleAuth;
export { appleAuth };

export const AppleAuthRequestOperation = {
  LOGIN: 1,
  REFRESH: 2,
  LOGOUT: 3,
  IMPLICIT: 4,
};

export const AppleAuthRequestScope = {
  EMAIL: 0,
  FULL_NAME: 1,
};

export const AppleAuthCredentialState = {
  REVOKED: 0,
  AUTHORIZED: 1,
  NOT_FOUND: 2,
  TRANSFERRED: 3,
};
