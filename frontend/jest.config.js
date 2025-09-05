// Jest configuration for a Vite + React (ESM) project
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpe?g|webp)$': '<rootDir>/__mocks__/fileMock.js',
    'lucide-react': '<rootDir>/__mocks__/lucide-react.js',
    '^axios$': '<rootDir>/__mocks__/axios.js',
    '^html2canvas$': '<rootDir>/__mocks__/html2canvas.js',
    '^jspdf$': '<rootDir>/__mocks__/jspdf.js'
  },
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { configFile: './babel.config.cjs' }]
  },
  transformIgnorePatterns: ['/node_modules/'],
  testMatch: ['<rootDir>/src/**/*.test.[jt]sx'],
  extensionsToTreatAsEsm: ['.jsx', '.tsx'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node']
};


