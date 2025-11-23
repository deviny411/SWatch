const tsConfig = require('./tsconfig.json');
const tsConfigPaths = require('tsconfig-paths');

const baseUrl = './dist';
tsConfigPaths.register({
  baseUrl,
  paths: {
    '@shared/*': ['./shared/src/*'],
    '@/*': ['./backend/src/*']
  }
});

console.log('✅ TypeScript path mappings registered');
