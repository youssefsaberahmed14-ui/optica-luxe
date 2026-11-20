/**
 * Dedicated PostgreSQL Integration Test Runner
 * Enforces presence of TEST_DATABASE_URL and executes integration tests.
 */
import { spawn } from 'child_process';

const testDbUrl = process.env.TEST_DATABASE_URL;

if (!testDbUrl) {
  console.error('\n🛑 [FATAL] TEST_DATABASE_URL environment variable is required to run live PostgreSQL integration tests.');
  console.error('📋 Usage:');
  console.error('   TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/optica_test_db" npm run test:integration\n');
  process.exit(1);
}

console.log('🚀 Running Live PostgreSQL Integration & Concurrency Tests against:', testDbUrl);

const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['vitest', 'run', 'tests/postgres-concurrency.integration.test.ts'],
  { stdio: 'inherit', env: process.env }
);

child.on('exit', (code) => {
  process.exit(code || 0);
});
