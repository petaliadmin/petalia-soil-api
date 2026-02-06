import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { CROPS_DATABASE } from '../../recommendations/data/crops.data';

// Types
interface UserDoc {
  _id: any;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  whatsapp?: string;
  role: string;
  avatar?: string;
  verified: boolean;
}

interface RangeValue {
  min: number;
  max: number;
}

interface CropDoc {
  id: string;
  name: string;
  icon: string;
  category: string;
  season: string;
  phRange: RangeValue;
  nitrogenRange: RangeValue;
  phosphorusRange: RangeValue;
  potassiumRange: RangeValue;
  moistureRange: RangeValue;
  preferredTextures: string[];
  preferredDrainage: string[];
  expectedYield: string;
  description?: string;
  imageUrl?: string;
}

interface LandDoc {
  title: string;
  description: string;
  surfaceHectares: number;
  type: string;
  price: number;
  priceUnit: string;
  status: string;
  location: {
    type: string;
    coordinates: number[];
  };
  address?: {
    city: string;
    region: string;
    commune: string;
    village?: string;
    fullAddress?: string;
    country: string;
  };
  soilParameters?: {
    ph: number;
    npk: {
      nitrogen: number;
      phosphorus: number;
      potassium: number;
    };
    texture: string;
    moisture: number;
    drainage: string;
    organicMatter?: number;
  };
  recommendedCrops?: Array<{
    name: string;
    suitability: string;
    icon?: string;
    season?: string;
    expectedYield?: string;
  }>;
  cultureHistory?: Array<{
    year: number;
    crop: string;
    yield?: string;
    notes?: string;
  }>;
  owner: any;
  images?: string[];
  thumbnail?: string;
  views?: number;
  favorites?: number;
}

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<UserDoc>>(getModelToken('User'));
  const cropModel = app.get<Model<CropDoc>>(getModelToken('Crop'));
  const landModel = app.get<Model<LandDoc>>(getModelToken('Land'));

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await userModel.deleteMany({});
  await cropModel.deleteMany({});
  await landModel.deleteMany({});

  // Create crops
  console.log('🌾 Creating crops...');
  const crops = await cropModel.insertMany(CROPS_DATABASE);
  console.log(`   ✅ Created ${crops.length} crops`);
  console.log(`      - Céréales: ${CROPS_DATABASE.filter(c => c.category === 'cereales').length}`);
  console.log(`      - Légumineuses: ${CROPS_DATABASE.filter(c => c.category === 'legumineuses').length}`);
  console.log(`      - Tubercules: ${CROPS_DATABASE.filter(c => c.category === 'tubercules').length}`);
  console.log(`      - Maraîchage: ${CROPS_DATABASE.filter(c => c.category === 'maraichage').length}`);
  console.log(`      - Cultures industrielles: ${CROPS_DATABASE.filter(c => c.category === 'industrielles').length}`);
  console.log(`      - Fruits: ${CROPS_DATABASE.filter(c => c.category === 'fruits').length}`);

  // Create users
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('S0l@ris2O25', 10);

  const users = await userModel.insertMany([
    {
      fullName: 'Admin Petalia',
      email: 'admin@petalia.sn',
      password: hashedPassword,
      phone: '+221 77 123 45 67',
      whatsapp: '+221 77 123 45 67',
      role: 'ADMIN',
      verified: true,
    },
    {
      fullName: 'Mamadou Diallo',
      email: 'mamadou.diallo@gmail.com',
      password: hashedPassword,
      phone: '+221 78 234 56 78',
      whatsapp: '+221 78 234 56 78',
      role: 'OWNER',
      verified: true,
    },
    {
      fullName: 'Fatou Ndiaye',
      email: 'fatou.ndiaye@gmail.com',
      password: hashedPassword,
      phone: '+221 76 345 67 89',
      whatsapp: '+221 76 345 67 89',
      role: 'OWNER',
      verified: true,
    },
    {
      fullName: 'Ibrahima Sow',
      email: 'ibrahima.sow@gmail.com',
      password: hashedPassword,
      phone: '+221 70 456 78 90',
      role: 'FARMER',
      verified: true,
    },
  ]);

  console.log(`   ✅ Created ${users.length} users`);

  const owner1 = users[1]._id;
  const owner2 = users[2]._id;

  // Create lands
  console.log('🌍 Creating lands...');

  const lands: LandDoc[] = [
    // Dakar Region
    {
      title: 'Terrain maraîcher à Sangalkam',
      description:
        "Excellente terre pour le maraîchage, proche de la route nationale. Accès à l'eau via puits. Idéale pour cultures de tomates, oignons et légumes.",
      surfaceHectares: 3.5,
      type: 'RENT',
      price: 350000,
      priceUnit: 'FCFA',
      status: 'AVAILABLE',
      location: {
        type: 'Point',
        coordinates: [-17.2167, 14.7833],
      },
      address: {
        city: 'Sangalkam',
        region: 'Dakar',
        commune: 'Sangalkam',
        village: 'Niague',
        fullAddress: 'Route de Niague, Sangalkam',
        country: 'Sénégal',
      },
      soilParameters: {
        ph: 6.5,
        npk: { nitrogen: 55, phosphorus: 35, potassium: 90 },
        texture: 'loamy',
        moisture: 45,
        drainage: 'good',
        organicMatter: 3.2,
      },
      recommendedCrops: [
        { name: 'Tomate', suitability: 'excellent', icon: '🍅', season: 'Nov-Mai', expectedYield: '30t/ha' },
        { name: 'Oignon', suitability: 'excellent', icon: '🧅', season: 'Oct-Avr', expectedYield: '25t/ha' },
        { name: 'Chou', suitability: 'good', icon: '🥬', season: 'Nov-Avr', expectedYield: '35t/ha' },
      ],
      cultureHistory: [
        { year: 2024, crop: 'Tomate', yield: '28 tonnes/ha', notes: 'Bonne récolte' },
        { year: 2023, crop: 'Oignon', yield: '22 tonnes/ha' },
      ],
      owner: owner1,
      images: [],
      views: 45,
      favorites: 12,
    },
    {
      title: 'Parcelle agricole à Diamniadio',
      description:
        "Grande parcelle près du nouvel aéroport. Sol fertile adapté aux cultures céréalières. Potentiel pour l'agriculture moderne.",
      surfaceHectares: 8.0,
      type: 'SALE',
      price: 24000000,
      priceUnit: 'FCFA',
      status: 'AVAILABLE',
      location: {
        type: 'Point',
        coordinates: [-17.1833, 14.7167],
      },
      address: {
        city: 'Diamniadio',
        region: 'Dakar',
        commune: 'Diamniadio',
        fullAddress: 'Zone rurale de Diamniadio',
        country: 'Sénégal',
      },
      soilParameters: {
        ph: 6.8,
        npk: { nitrogen: 40, phosphorus: 30, potassium: 70 },
        texture: 'sandy',
        moisture: 30,
        drainage: 'excellent',
        organicMatter: 2.5,
      },
      recommendedCrops: [
        { name: 'Arachide', suitability: 'excellent', icon: '🥜', season: 'Juin-Oct', expectedYield: '1.5t/ha' },
        { name: 'Mil', suitability: 'good', icon: '🌾', season: 'Juin-Oct', expectedYield: '1t/ha' },
      ],
      cultureHistory: [
        { year: 2024, crop: 'Arachide', yield: '1.4 tonnes/ha' },
      ],
      owner: owner1,
      images: [],
      views: 78,
      favorites: 23,
    },

    // Thiès Region
    {
      title: 'Terrain fruitier à Thiès',
      description:
        "Verger avec manguiers et agrumes établis. Sol riche et bien drainé. Système d'irrigation en place.",
      surfaceHectares: 5.0,
      type: 'RENT',
      price: 500000,
      priceUnit: 'FCFA',
      status: 'AVAILABLE',
      location: {
        type: 'Point',
        coordinates: [-16.9167, 14.8],
      },
      address: {
        city: 'Thiès',
        region: 'Thiès',
        commune: 'Thiès-Ouest',
        fullAddress: 'Route de Fandène, Thiès',
        country: 'Sénégal',
      },
      soilParameters: {
        ph: 6.3,
        npk: { nitrogen: 60, phosphorus: 40, potassium: 110 },
        texture: 'loamy',
        moisture: 50,
        drainage: 'good',
        organicMatter: 4.0,
      },
      recommendedCrops: [
        { name: 'Mangue', suitability: 'excellent', icon: '🥭', season: 'Mar-Juil', expectedYield: '12t/ha' },
        { name: 'Agrumes', suitability: 'excellent', icon: '🍊', season: 'Nov-Fév', expectedYield: '20t/ha' },
        { name: 'Papaye', suitability: 'good', icon: '🍈', season: 'Toute année', expectedYield: '40t/ha' },
      ],
      cultureHistory: [
        { year: 2024, crop: 'Mangue', yield: '11 tonnes/ha', notes: 'Variété Kent' },
        { year: 2023, crop: 'Mangue', yield: '10 tonnes/ha' },
      ],
      owner: owner2,
      images: [],
      views: 120,
      favorites: 45,
    },
    {
      title: 'Exploitation céréalière à Mbour',
      description:
        'Grande exploitation pour cultures céréalières. Pluviométrie favorable. Accès facile depuis la nationale.',
      surfaceHectares: 15.0,
      type: 'RENT',
      price: 900000,
      priceUnit: 'FCFA',
      status: 'AVAILABLE',
      location: {
        type: 'Point',
        coordinates: [-16.9667, 14.4167],
      },
      address: {
        city: 'Mbour',
        region: 'Thiès',
        commune: 'Mbour',
        village: 'Nguékhokh',
        fullAddress: 'Zone agricole de Nguékhokh',
        country: 'Sénégal',
      },
      soilParameters: {
        ph: 6.0,
        npk: { nitrogen: 35, phosphorus: 25, potassium: 55 },
        texture: 'sandy',
        moisture: 25,
        drainage: 'excellent',
        organicMatter: 2.0,
      },
      recommendedCrops: [
        { name: 'Mil', suitability: 'excellent', icon: '🌾', season: 'Juin-Oct', expectedYield: '1.2t/ha' },
        { name: 'Sorgho', suitability: 'excellent', icon: '🌾', season: 'Juin-Oct', expectedYield: '1.5t/ha' },
        { name: 'Niébé', suitability: 'good', icon: '🫘', season: 'Juin-Sept', expectedYield: '1t/ha' },
      ],
      cultureHistory: [
        { year: 2024, crop: 'Mil', yield: '1.1 tonnes/ha' },
        { year: 2023, crop: 'Sorgho', yield: '1.3 tonnes/ha' },
        { year: 2022, crop: 'Niébé', yield: '0.9 tonnes/ha' },
      ],
      owner: owner2,
      images: [],
      views: 65,
      favorites: 18,
    },

    // Saint-Louis Region
    {
      title: 'Rizière irriguée à Richard-Toll',
      description:
        "Parcelle dans la zone rizicole du Delta. Accès direct à l'eau d'irrigation. Infrastructure existante pour la culture du riz.",
      surfaceHectares: 10.0,
      type: 'RENT',
      price: 800000,
      priceUnit: 'FCFA',
      status: 'AVAILABLE',
      location: {
        type: 'Point',
        coordinates: [-15.7, 16.4667],
      },
      address: {
        city: 'Richard-Toll',
        region: 'Saint-Louis',
        commune: 'Richard-Toll',
        fullAddress: 'Zone du Delta, Richard-Toll',
        country: 'Sénégal',
      },
      soilParameters: {
        ph: 6.2,
        npk: { nitrogen: 70, phosphorus: 35, potassium: 60 },
        texture: 'clay',
        moisture: 75,
        drainage: 'poor',
        organicMatter: 3.5,
      },
      recommendedCrops: [
        { name: 'Riz', suitability: 'excellent', icon: '🍚', season: 'Juil-Nov', expectedYield: '5t/ha' },
        { name: 'Canne à sucre', suitability: 'good', icon: '🌿', season: 'Toute année', expectedYield: '80t/ha' },
      ],
      cultureHistory: [
        { year: 2024, crop: 'Riz', yield: '4.8 tonnes/ha', notes: 'Variété Sahel 108' },
        { year: 2023, crop: 'Riz', yield: '4.5 tonnes/ha' },
      ],
      owner: owner1,
      images: [],
      views: 92,
      favorites: 34,
    },

    // Ziguinchor Region
    {
      title: 'Plantation à Ziguinchor',
      description:
        'Terre fertile en Casamance. Climat favorable aux cultures tropicales. Potentiel pour arboriculture fruitière.',
      surfaceHectares: 7.0,
      type: 'SALE',
      price: 14000000,
      priceUnit: 'FCFA',
      status: 'AVAILABLE',
      location: {
        type: 'Point',
        coordinates: [-16.2719, 12.5833],
      },
      address: {
        city: 'Ziguinchor',
        region: 'Ziguinchor',
        commune: 'Ziguinchor',
        fullAddress: 'Route de Oussouye',
        country: 'Sénégal',
      },
      soilParameters: {
        ph: 5.8,
        npk: { nitrogen: 65, phosphorus: 45, potassium: 100 },
        texture: 'loamy',
        moisture: 55,
        drainage: 'good',
        organicMatter: 4.5,
      },
      recommendedCrops: [
        { name: 'Banane', suitability: 'excellent', icon: '🍌', season: 'Toute année', expectedYield: '30t/ha' },
        { name: 'Mangue', suitability: 'excellent', icon: '🥭', season: 'Mar-Juil', expectedYield: '15t/ha' },
        { name: 'Anacarde', suitability: 'good', icon: '🌰', season: 'Mar-Mai', expectedYield: '1t/ha' },
      ],
      cultureHistory: [
        { year: 2024, crop: 'Anacarde', yield: '0.9 tonnes/ha' },
      ],
      owner: owner2,
      images: [],
      views: 55,
      favorites: 22,
    },

    // Kaolack Region
    {
      title: 'Bassin arachidier à Kaolack',
      description:
        "Au cœur du bassin arachidier. Sol parfait pour l'arachide et les légumineuses. Grande superficie pour agriculture extensive.",
      surfaceHectares: 20.0,
      type: 'RENT',
      price: 1200000,
      priceUnit: 'FCFA',
      status: 'AVAILABLE',
      location: {
        type: 'Point',
        coordinates: [-16.0758, 14.1383],
      },
      address: {
        city: 'Kaolack',
        region: 'Kaolack',
        commune: 'Kaolack',
        village: 'Ndoffane',
        fullAddress: 'Zone rurale de Ndoffane',
        country: 'Sénégal',
      },
      soilParameters: {
        ph: 5.9,
        npk: { nitrogen: 25, phosphorus: 30, potassium: 50 },
        texture: 'sandy',
        moisture: 28,
        drainage: 'excellent',
        organicMatter: 1.8,
      },
      recommendedCrops: [
        { name: 'Arachide', suitability: 'excellent', icon: '🥜', season: 'Juin-Oct', expectedYield: '1.8t/ha' },
        { name: 'Mil', suitability: 'excellent', icon: '🌾', season: 'Juin-Oct', expectedYield: '1t/ha' },
        { name: 'Niébé', suitability: 'good', icon: '🫘', season: 'Juin-Sept', expectedYield: '1.2t/ha' },
      ],
      cultureHistory: [
        { year: 2024, crop: 'Arachide', yield: '1.7 tonnes/ha' },
        { year: 2023, crop: 'Mil', yield: '0.95 tonnes/ha' },
      ],
      owner: owner1,
      images: [],
      views: 88,
      favorites: 31,
    },

    // Tambacounda Region
    {
      title: 'Grande exploitation à Tambacounda',
      description:
        'Vaste terrain dans la région orientale. Sol riche adapté aux cultures variées. Potentiel pour coton et céréales.',
      surfaceHectares: 25.0,
      type: 'SALE',
      price: 37500000,
      priceUnit: 'FCFA',
      status: 'AVAILABLE',
      location: {
        type: 'Point',
        coordinates: [-13.6833, 13.7667],
      },
      address: {
        city: 'Tambacounda',
        region: 'Tambacounda',
        commune: 'Tambacounda',
        fullAddress: 'Zone agricole Est',
        country: 'Sénégal',
      },
      soilParameters: {
        ph: 6.4,
        npk: { nitrogen: 45, phosphorus: 35, potassium: 65 },
        texture: 'loamy',
        moisture: 35,
        drainage: 'good',
        organicMatter: 2.8,
      },
      recommendedCrops: [
        { name: 'Coton', suitability: 'excellent', icon: '☁️', season: 'Juin-Nov', expectedYield: '1.5t/ha' },
        { name: 'Maïs', suitability: 'good', icon: '🌽', season: 'Juin-Sept', expectedYield: '3t/ha' },
        { name: 'Sorgho', suitability: 'good', icon: '🌾', season: 'Juin-Oct', expectedYield: '1.3t/ha' },
      ],
      cultureHistory: [
        { year: 2024, crop: 'Coton', yield: '1.4 tonnes/ha' },
        { year: 2023, crop: 'Maïs', yield: '2.8 tonnes/ha' },
      ],
      owner: owner2,
      images: [],
      views: 42,
      favorites: 15,
    },

    // More lands to reach 10-15
    {
      title: 'Parcelle maraîchère à Niayes',
      description:
        "Zone des Niayes, idéale pour le maraîchage. Nappe phréatique accessible. Climat tempéré par l'océan.",
      surfaceHectares: 2.0,
      type: 'RENT',
      price: 250000,
      priceUnit: 'FCFA',
      status: 'AVAILABLE',
      location: {
        type: 'Point',
        coordinates: [-17.35, 14.95],
      },
      address: {
        city: 'Kayar',
        region: 'Thiès',
        commune: 'Kayar',
        fullAddress: 'Zone des Niayes, Kayar',
        country: 'Sénégal',
      },
      soilParameters: {
        ph: 6.7,
        npk: { nitrogen: 70, phosphorus: 45, potassium: 120 },
        texture: 'loamy',
        moisture: 55,
        drainage: 'good',
        organicMatter: 3.8,
      },
      recommendedCrops: [
        { name: 'Carotte', suitability: 'excellent', icon: '🥕', season: 'Oct-Mar', expectedYield: '30t/ha' },
        { name: 'Laitue', suitability: 'excellent', icon: '🥬', season: 'Nov-Mar', expectedYield: '20t/ha' },
        { name: 'Poivron', suitability: 'good', icon: '🫑', season: 'Oct-Mai', expectedYield: '20t/ha' },
      ],
      cultureHistory: [],
      owner: owner1,
      images: [],
      views: 156,
      favorites: 67,
    },
    {
      title: 'Verger à Kédougou',
      description:
        'Région au climat favorable pour les fruits tropicaux. Sol volcanique riche. Potentiel bio.',
      surfaceHectares: 4.0,
      type: 'SALE',
      price: 6000000,
      priceUnit: 'FCFA',
      status: 'PENDING',
      location: {
        type: 'Point',
        coordinates: [-12.1833, 12.5667],
      },
      address: {
        city: 'Kédougou',
        region: 'Kédougou',
        commune: 'Kédougou',
        fullAddress: 'Route de Salemata',
        country: 'Sénégal',
      },
      soilParameters: {
        ph: 5.5,
        npk: { nitrogen: 55, phosphorus: 40, potassium: 85 },
        texture: 'loamy',
        moisture: 50,
        drainage: 'good',
        organicMatter: 5.0,
      },
      recommendedCrops: [
        { name: 'Mangue', suitability: 'excellent', icon: '🥭', season: 'Mar-Juil', expectedYield: '15t/ha' },
        { name: 'Banane', suitability: 'good', icon: '🍌', season: 'Toute année', expectedYield: '25t/ha' },
      ],
      cultureHistory: [],
      owner: owner2,
      images: [],
      views: 28,
      favorites: 8,
    },
  ];

  const createdLands = await landModel.insertMany(lands);
  console.log(`   ✅ Created ${createdLands.length} lands`);

  console.log('\n✨ Seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - ${crops.length} crops`);
  console.log(`   - ${users.length} users`);
  console.log(`   - ${createdLands.length} lands`);
  console.log('\n📋 Test credentials:');
  console.log('   Admin: admin@petalia.sn / Password123!');
  console.log('   Owner 1: mamadou.diallo@gmail.com / Password123!');
  console.log('   Owner 2: fatou.ndiaye@gmail.com / Password123!');
  console.log('   Farmer: ibrahima.sow@gmail.com / Password123!');

  await app.close();
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});