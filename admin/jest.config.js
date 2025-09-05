export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpe?g|webp)$': '<rootDir>/__mocks__/fileMock.js',
    '^axios$': '<rootDir>/__mocks__/axios.js'
  },
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { configFile: './babel.config.cjs' }]
  },
  testMatch: ['<rootDir>/src/**/*.test.[jt]sx'],
  extensionsToTreatAsEsm: ['.jsx', '.tsx'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node']
};


