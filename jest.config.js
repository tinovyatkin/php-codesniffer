module.exports = {
  clearMocks: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text', 'json', 'cobertura', 'lcov'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts?(x)'],
  coverageProvider: 'v8',
  moduleFileExtensions: ['ts', 'js'],
  testRunner: 'jest-circus/runner',
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.sonarlint/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
    '<rootDir>/.vscode/',
  ],
};
