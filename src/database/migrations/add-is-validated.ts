import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

/**
 * Migration: Ajouter isValidated=true aux terres existantes
 * Les terres existantes (créées avant le système de validation) sont considérées comme validées.
 */
async function migrate() {
  console.log('Starting migration: add isValidated to existing lands...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const landModel = app.get<Model<any>>(getModelToken('Land'));

  // Mettre à jour toutes les terres qui n'ont pas le champ isValidated
  const result = await landModel.updateMany(
    { isValidated: { $exists: false } },
    { $set: { isValidated: true } },
  );

  console.log(`Updated ${result.modifiedCount} lands with isValidated=true`);

  // Aussi mettre à jour les terres qui ont isValidated=null
  const resultNull = await landModel.updateMany(
    { isValidated: null },
    { $set: { isValidated: true } },
  );

  console.log(`Updated ${resultNull.modifiedCount} lands with isValidated=null to true`);

  const total = await landModel.countDocuments({});
  const validated = await landModel.countDocuments({ isValidated: true });
  const pending = await landModel.countDocuments({ isValidated: false });

  console.log(`\nSummary:`);
  console.log(`  Total lands: ${total}`);
  console.log(`  Validated: ${validated}`);
  console.log(`  Pending validation: ${pending}`);

  await app.close();
  console.log('\nMigration completed.');
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
