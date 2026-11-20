import { createApp } from './app';
import { env } from './config/env';
import { disconnectDatabase, initializeDatabase } from './database/prisma';

const app = createApp();

async function startServer() {
  console.log(`\n======================================================`);
  console.log(`🔧 [Optica Luxe API] Initializing in [${env.nodeEnv.toUpperCase()}] mode...`);
  console.log(`======================================================`);

  // Initialize DB connection (throws fatal error in production if PostgreSQL fails)
  await initializeDatabase();

  const server = app.listen(env.port, () => {
    console.log(`🚀 Server listening on port ${env.port}`);
    console.log(`🌐 Base URL: http://localhost:${env.port}`);
    console.log(`📡 Health Check: http://localhost:${env.port}/api/health`);
    console.log(`======================================================\n`);
  });

  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\n🛑 Received ${signal}. Gracefully shutting down Optica Luxe server...`);

    // Force close after 10s if hanging
    const forceExitTimeout = setTimeout(() => {
      console.error('⚠️ Forcefully exiting after shutdown timeout.');
      process.exit(1);
    }, 10000);

    server.close(async () => {
      clearTimeout(forceExitTimeout);
      await disconnectDatabase();
      console.log('✅ Server and Database connections closed cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err?.message || err);
  process.exit(1);
});
