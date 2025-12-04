// __mocks__/react-native-fs.js

module.exports = {
  DocumentDirectoryPath: '/mock/document/path',
  CachesDirectoryPath: '/mock/cache/path',
  TemporaryDirectoryPath: '/mock/temp/path',
  ExternalDirectoryPath: '/mock/external/path',
  readFile: jest.fn().mockResolvedValue('mock-file-content'),
  writeFile: jest.fn().mockResolvedValue(undefined),
  exists: jest.fn().mockResolvedValue(true),
  unlink: jest.fn().mockResolvedValue(undefined),
  mkdir: jest.fn().mockResolvedValue(undefined),
  stat: jest.fn().mockResolvedValue({
    size: 1024,
    isFile: () => true,
    isDirectory: () => false,
    mtime: new Date(),
    ctime: new Date(),
  }),
  copyFile: jest.fn().mockResolvedValue(undefined),
  moveFile: jest.fn().mockResolvedValue(undefined),
  readDir: jest.fn().mockResolvedValue([]),
  downloadFile: jest.fn().mockReturnValue({
    promise: Promise.resolve({ statusCode: 200 }),
  }),
  uploadFiles: jest.fn().mockReturnValue({
    promise: Promise.resolve({ statusCode: 200 }),
  }),
};
