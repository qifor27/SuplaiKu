require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkDb() {
  try {
    console.log('Connecting to database:', process.env.DATABASE_URL.split('@')[1]); // Only show host
    
    const owner = await prisma.user.findUnique({
      where: { id: 'seed-owner' }
    });
    
    if (owner) {
      console.log('Owner found!');
      const isMatch = await bcrypt.compare('123456', owner.pin);
      console.log('Is 123456 correct?', isMatch);
    } else {
      console.log('Owner NOT found in the database. Seeding might have failed or hit a different DB.');
    }
  } catch (e) {
    console.error('Error connecting to DB:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();
