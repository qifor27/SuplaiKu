import 'dotenv/config';
import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Using DATABASE_URL:', process.env.DATABASE_URL);
  
  try {
    const owner = await prisma.user.findFirst({
      where: { role: 'OWNER' }
    });
    
    if (owner) {
      console.log('Owner Name:', owner.name);
      console.log('Owner ID:', owner.id);
      console.log('Role:', owner.role);
      
      const isMatch = await bcrypt.compare('123456', owner.pin);
      console.log('Password Match for 123456:', isMatch);
    } else {
      console.log('❌ Owner NOT found in the database!');
      
      // Let's check if ANY user exists
      const allUsers = await prisma.user.findMany();
      console.log(`Total users in DB: ${allUsers.length}`);
    }
  } catch (error) {
    console.error('Database Connection Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
