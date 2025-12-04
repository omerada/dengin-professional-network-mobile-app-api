// __mocks__/@react-native-google-signin/google-signin.js

module.exports = {
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({
      user: {
        id: 'mock-google-id',
        email: 'test@gmail.com',
        name: 'Test User',
        photo: 'https://example.com/photo.jpg',
      },
      idToken: 'mock-id-token',
    }),
    signOut: jest.fn().mockResolvedValue(null),
    isSignedIn: jest.fn().mockResolvedValue(false),
    getCurrentUser: jest.fn().mockResolvedValue(null),
    revokeAccess: jest.fn().mockResolvedValue(null),
    getTokens: jest.fn().mockResolvedValue({
      accessToken: 'mock-access-token',
      idToken: 'mock-id-token',
    }),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: '12501',
    IN_PROGRESS: '12502',
    PLAY_SERVICES_NOT_AVAILABLE: '12503',
  },
  GoogleSigninButton: 'GoogleSigninButton',
};
