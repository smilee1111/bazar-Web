module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>'],
    testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                jsx: 'react-jsx',
                esModuleInterop: true,
            },
        }],
    },
    collectCoverageFrom: [
        'components/**/*.{ts,tsx}',
        'app/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/__tests__/**',
    ],
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
    testPathIgnorePatterns: ['/node_modules/', '/.next/'],
    moduleDirectories: ['node_modules', '<rootDir>'],
};
