const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    console.log('🔍 Testing query...');

    const userCount = await prisma.user.count();
    console.log(`📊 Number of users in database: ${userCount}`);

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
