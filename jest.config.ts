import type { Config } from 'jest'
const config: Config = {
  testEnvironment: 'jsdom',
  transform: { 
    '^.+\\.(ts|tsx)$': [ 
      'ts-jest', 
      { 
        tsconfig: {
          jsx: 'react-jsx',
        }
      } 
    ] 
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testPathIgnorePatterns: ['<rootDir>/tests/', '<rootDir>/.next/', '<rootDir>/node_modules/'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}', '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
}
export default config