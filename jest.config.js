export default {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  rootDir: '.',
  verbose: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
