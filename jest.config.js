module.exports = {
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['@swc/jest'],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^.+\\.module\\.css$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  transformIgnorePatterns: [
    '/node_modules/'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/e2e/'
  ],
};