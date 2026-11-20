/**
 * Dedicated PostgreSQL Integration Test Runner
 * Enforces presence of TEST_DATABASE_URL, validates test safety, and executes integration tests.
 */
import { spawn } from 'child_process';

const testDbUrl = process.env.TEST_DATABASE_URL;

if (!testDbUrl || !testDbUrl.trim()) {
  console.error('\n🛑 [FATAL] TEST_DATABASE_URL environment variable is required to run live PostgreSQL integration tests.');
  console.error('📋 Usage:');
  console.error('   TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/optica_test_db" npm run test:integration\n');
  process.exit(1);
}

// Safety check function: Guarantees integration tests NEVER run against production databases
function verifyTestDatabaseSafety(url: string): void {
  const lowercase = url.toLowerCase();
  if (!lowercase.startsWith('postgres://') && !lowercase.startsWith('postgresql://')) {
    console.error('\n🛑 [Safety Guard] TEST_DATABASE_URL must be a valid PostgreSQL connection string.\n');
    process.exit(1);
  }

  const dbNameMatch = lowercase.match(/\/([^/?]+)(\?|$)/);
  const dbName = dbNameMatch ? dbNameMatch[1] : '';

  if (!dbName.includes('test') && !dbName.includes('isolated')) {
    console.error(
      `\n🛑 [Safety Guard] Integration tests can ONLY run against databases containing 'test' or 'isolated' in their name (Found: "${dbName}"). Aborting to protect non-test data.\n`
    );
    process.exit(1);
  }

  if (dbName.includes('prod') || dbName.includes('production')) {
    console.error('\n🛑 [Safety Guard] Fatal: Database name contains "prod". Aborting immediately.\n');
    process.exit(1);
  }
}

verifyTestDatabaseSafety(testDbUrl);

// Never print connection URLs or credentials to logs
console.log('🚀 Running Live PostgreSQL Integration & Concurrency Tests against verified test database.');

// Set DATABASE_URL to TEST_DATABASE_URL so Express app and Prisma services share the exact same test connection
const childEnv = {
  ...process.env,
  DATABASE_URL: testDbUrl,
  NODE_ENV: 'test',
};

const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['vitest', 'run', 'tests/postgres-concurrency.integration.test.ts'],
  { stdio: 'inherit', env: childEnv }
);

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`🛑 Integration tests process was terminated by signal: ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
