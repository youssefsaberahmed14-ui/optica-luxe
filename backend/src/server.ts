import { createApp } from './app';
import { env } from './config/env';
import { initializeDatabase, prisma } from './database/prisma';

const app = createApp();

async function startServer() {
  await initializeDatabase();

  const server = app.listen(env.port, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 [Optica Luxe API] Server listening on port ${env.port}`);
    console.log(`🌐 Base URL: http://localhost:${env.port}`);
    console.log(`📡 Health Check: http://localhost:${env.port}/api/health`);
    console.log(`🔐 Admin Default Login: ${env.adminDefault.email} / ${env.adminDefault.password}`);
    console.log(`======================================================\n`);
  });

  const shutdown = async () => {
    console.log('\n🛑 Gracefully shutting down Optica Luxe server...');
    server.close(async () => {
      await prisma.$disconnect();
      console.log('✅ Server and Database connections closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
