/**
 * siHutang — Database Seed
 *
 * Creates 2 users:
 * - Owner (PIN: 123456)
 * - Karyawan (PIN: 111111)
 *
 * ECC security: PINs are bcrypt-hashed before storing.
 */

import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 Seeding database...');

  // Hash PINs
  const ownerPinHash = await bcrypt.hash('123456', SALT_ROUNDS);
  const employeePinHash = await bcrypt.hash('111111', SALT_ROUNDS);

  // Create Owner
  const owner = await prisma.user.upsert({
    where: { id: 'seed-owner' },
    update: {
      pin: ownerPinHash,
    },
    create: {
      id: 'seed-owner',
      name: 'Owner',
      pin: ownerPinHash,
      role: 'OWNER',
    },
  });

  // Create Employee
  const employee = await prisma.user.upsert({
    where: { id: 'seed-employee' },
    update: {
      pin: employeePinHash,
    },
    create: {
      id: 'seed-employee',
      name: 'Karyawan',
      pin: employeePinHash,
      role: 'EMPLOYEE',
    },
  });

  console.log('✅ Users created:');
  console.log(`   Owner: ${owner.name} (PIN: 123456)`);
  console.log(`   Karyawan: ${employee.name} (PIN: 111111)`);

  // Create sample suppliers
  const supplier1 = await prisma.supplier.upsert({
    where: { id: 'seed-supplier-1' },
    update: {},
    create: {
      id: 'seed-supplier-1',
      name: 'PT Sumber Makmur',
      phone: '021-5551234',
      address: 'Jl. Industri No. 15, Jakarta Barat',
      notes: 'Supplier gula dan tepung',
    },
  });

  const supplier2 = await prisma.supplier.upsert({
    where: { id: 'seed-supplier-2' },
    update: {},
    create: {
      id: 'seed-supplier-2',
      name: 'UD Berkah Jaya',
      phone: '0812-3456-7890',
      address: 'Jl. Pasar Baru No. 8, Tangerang',
      notes: 'Supplier minyak goreng dan beras',
    },
  });

  console.log('✅ Suppliers created:');
  console.log(`   ${supplier1.name}`);
  console.log(`   ${supplier2.name}`);

  // Create sample items
  const item1 = await prisma.item.upsert({
    where: { id: 'seed-item-1' },
    update: {},
    create: {
      id: 'seed-item-1',
      name: 'Gula Pasir',
      unit: 'kg',
      pricePerUnit: 15000,
      supplierId: supplier1.id,
    },
  });

  const item2 = await prisma.item.upsert({
    where: { id: 'seed-item-2' },
    update: {},
    create: {
      id: 'seed-item-2',
      name: 'Tepung Terigu Segitiga Biru',
      unit: 'kg',
      pricePerUnit: 12000,
      supplierId: supplier1.id,
    },
  });

  const item3 = await prisma.item.upsert({
    where: { id: 'seed-item-3' },
    update: {},
    create: {
      id: 'seed-item-3',
      name: 'Minyak Goreng Bimoli',
      unit: 'liter',
      pricePerUnit: 18000,
      supplierId: supplier2.id,
    },
  });

  const item4 = await prisma.item.upsert({
    where: { id: 'seed-item-4' },
    update: {},
    create: {
      id: 'seed-item-4',
      name: 'Beras Premium',
      unit: 'kg',
      pricePerUnit: 14000,
      supplierId: supplier2.id,
    },
  });

  console.log('✅ Items created:');
  console.log(`   ${item1.name} (${item1.unit}) - Rp ${item1.pricePerUnit}`);
  console.log(`   ${item2.name} (${item2.unit}) - Rp ${item2.pricePerUnit}`);
  console.log(`   ${item3.name} (${item3.unit}) - Rp ${item3.pricePerUnit}`);
  console.log(`   ${item4.name} (${item4.unit}) - Rp ${item4.pricePerUnit}`);

  // Create sample transactions
  const now = new Date();
  const daysAgo = (days: number) =>
    new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  await prisma.transaction.createMany({
    data: [
      {
        id: 'seed-txn-1',
        type: 'PURCHASE',
        amount: 1500000,
        quantity: 100,
        description: 'Gula Pasir 100kg',
        date: daysAgo(10),
        supplierId: supplier1.id,
        itemId: item1.id,
      },
      {
        id: 'seed-txn-2',
        type: 'PURCHASE',
        amount: 600000,
        quantity: 50,
        description: 'Tepung Terigu 50kg',
        date: daysAgo(8),
        supplierId: supplier1.id,
        itemId: item2.id,
      },
      {
        id: 'seed-txn-3',
        type: 'PAYMENT',
        amount: 750000,
        description: 'Angsuran pertama',
        method: 'Transfer BCA',
        date: daysAgo(5),
        supplierId: supplier1.id,
      },
      {
        id: 'seed-txn-4',
        type: 'PURCHASE',
        amount: 1800000,
        quantity: 100,
        description: 'Minyak Goreng 100 liter',
        date: daysAgo(7),
        supplierId: supplier2.id,
        itemId: item3.id,
      },
      {
        id: 'seed-txn-5',
        type: 'PURCHASE',
        amount: 1400000,
        quantity: 100,
        description: 'Beras Premium 100kg',
        date: daysAgo(6),
        supplierId: supplier2.id,
        itemId: item4.id,
      },
      {
        id: 'seed-txn-6',
        type: 'PAYMENT',
        amount: 1500000,
        description: 'Bayar sebagian',
        method: 'Tunai',
        date: daysAgo(3),
        supplierId: supplier2.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Sample transactions created');
  console.log('');
  console.log('📊 Summary:');
  console.log('   PT Sumber Makmur: Hutang Rp 1.350.000 (Beli 2.100.000 - Bayar 750.000)');
  console.log('   UD Berkah Jaya:   Hutang Rp 1.700.000 (Beli 3.200.000 - Bayar 1.500.000)');
  console.log('');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
