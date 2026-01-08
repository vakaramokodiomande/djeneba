const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function createAdmin() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Importer le modèle User
    const User = require('../models/User').default;

    // Vérifier si un admin existe déjà
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Un administrateur existe déjà:', existingAdmin.email);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question('Voulez-vous créer un nouvel admin quand même? (oui/non): ', async (answer) => {
        if (answer.toLowerCase() !== 'oui') {
          console.log('❌ Annulé');
          process.exit(0);
        }
        readline.close();
        await proceedWithCreation();
      });
    } else {
      await proceedWithCreation();
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

async function proceedWithCreation() {
  const User = require('../models/User').default;

  console.log('\n📝 Création du compte administrateur...');

  // Données de l'admin
  const adminData = {
    name: 'Administrateur DJENEBA',
    email: 'admin@djeneba.com',
    password: 'admin123456', // À changer après première connexion!
    role: 'admin',
    phone: '+223 70 00 00 00',
    location: 'Bamako, Mali'
  };

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(adminData.password, 10);
  adminData.password = hashedPassword;

  // Créer l'admin
  const admin = await User.create(adminData);

  console.log('\n✅ Administrateur créé avec succès!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Email:', 'admin@djeneba.com');
  console.log('🔑 Mot de passe:', 'admin123456');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n⚠️  IMPORTANT: Changez ce mot de passe après votre première connexion!\n');

  await mongoose.disconnect();
  process.exit(0);
}

createAdmin();
