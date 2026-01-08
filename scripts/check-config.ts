/**
 * Script de vérification de la configuration
 * Vérifie que toutes les variables d'environnement sont correctement configurées
 *
 * Usage: npm run check-config
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement
config({ path: resolve(process.cwd(), '.env.local') });

interface ConfigCheck {
  name: string;
  value: string | undefined;
  required: boolean;
  isPublic: boolean;
  validator?: (value: string) => { valid: boolean; message?: string };
}

const checks: ConfigCheck[] = [
  {
    name: 'MONGODB_URI',
    value: process.env.MONGODB_URI,
    required: true,
    isPublic: false,
    validator: (value) => {
      if (!value.startsWith('mongodb://') && !value.startsWith('mongodb+srv://')) {
        return { valid: false, message: 'Doit commencer par mongodb:// ou mongodb+srv://' };
      }
      if (value.includes('<password>')) {
        return { valid: false, message: 'Remplacer <password> par votre vrai mot de passe' };
      }
      return { valid: true };
    },
  },
  {
    name: 'NEXTAUTH_URL',
    value: process.env.NEXTAUTH_URL,
    required: true,
    isPublic: false,
    validator: (value) => {
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        return { valid: false, message: 'Doit commencer par http:// ou https://' };
      }
      return { valid: true };
    },
  },
  {
    name: 'NEXTAUTH_SECRET',
    value: process.env.NEXTAUTH_SECRET,
    required: true,
    isPublic: false,
    validator: (value) => {
      if (value.length < 32) {
        return { valid: false, message: 'Doit faire au moins 32 caractères pour être sécurisé' };
      }
      if (value === 'REMPLACER_PAR_UN_SECRET_ALEATOIRE_GENERE') {
        return { valid: false, message: 'Générer un vrai secret aléatoire' };
      }
      return { valid: true };
    },
  },
  {
    name: 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    value: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    required: true,
    isPublic: true,
    validator: (value) => {
      if (value === 'votre_cloud_name') {
        return { valid: false, message: 'Remplacer par votre vrai Cloud Name Cloudinary' };
      }
      return { valid: true };
    },
  },
  {
    name: 'CLOUDINARY_API_KEY',
    value: process.env.CLOUDINARY_API_KEY,
    required: true,
    isPublic: false,
    validator: (value) => {
      if (!/^\d+$/.test(value)) {
        return { valid: false, message: 'Doit être composé uniquement de chiffres' };
      }
      if (value === '123456789012345') {
        return { valid: false, message: 'Remplacer par votre vraie API Key Cloudinary' };
      }
      return { valid: true };
    },
  },
  {
    name: 'CLOUDINARY_API_SECRET',
    value: process.env.CLOUDINARY_API_SECRET,
    required: true,
    isPublic: false,
    validator: (value) => {
      if (value === 'abcdefghijklmnopqrstuvwxyz123456') {
        return { valid: false, message: 'Remplacer par votre vrai API Secret Cloudinary' };
      }
      return { valid: true };
    },
  },
];

console.log('\n🔍 Vérification de la configuration DJENEBA...\n');

let hasErrors = false;
let hasWarnings = false;

// Vérifier si le fichier .env.local existe
const fs = require('fs');
const envPath = resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ ERREUR: Le fichier .env.local n\'existe pas !');
  console.log('   → Créer le fichier en copiant .env.example : cp .env.example .env.local\n');
  process.exit(1);
}

// Vérifier chaque variable
checks.forEach((check) => {
  const status = check.value ? '✓' : '✗';
  const color = check.value ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';

  console.log(`${color}${status}${reset} ${check.name}`);

  if (!check.value) {
    if (check.required) {
      console.log(`   ❌ REQUIS: Cette variable doit être définie`);
      hasErrors = true;
    } else {
      console.log(`   ⚠️  OPTIONNEL: Recommandé mais pas obligatoire`);
      hasWarnings = true;
    }
  } else {
    // Afficher une version masquée de la valeur
    let displayValue = check.value;
    if (!check.isPublic) {
      if (check.value.length > 20) {
        displayValue = check.value.substring(0, 10) + '...' + check.value.substring(check.value.length - 5);
      } else {
        displayValue = '***' + check.value.substring(check.value.length - 4);
      }
    }
    console.log(`   Valeur: ${displayValue}`);

    // Valider la valeur si un validateur existe
    if (check.validator) {
      const validation = check.validator(check.value);
      if (!validation.valid) {
        console.log(`   ❌ INVALIDE: ${validation.message}`);
        hasErrors = true;
      } else {
        console.log(`   ✓ Valide`);
      }
    }
  }
  console.log('');
});

// Vérifications supplémentaires
console.log('📋 Vérifications supplémentaires:\n');

// Vérifier la connexion MongoDB (basique)
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
    console.log('ℹ️  MongoDB local détecté');
    console.log('   → Assurez-vous que MongoDB est démarré : mongod');
  } else if (mongoUri.includes('mongodb.net')) {
    console.log('☁️  MongoDB Atlas détecté');
    console.log('   → Vérifiez que votre IP est autorisée dans Network Access');
  }
  console.log('');
}

// Vérifier l'URL NextAuth
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl) {
  if (nextAuthUrl.includes('localhost')) {
    console.log('💻 Mode développement détecté');
  } else {
    console.log('🌐 Mode production détecté');
    console.log('   → Assurez-vous que l\'URL correspond à votre déploiement Vercel');
  }
  console.log('');
}

// Résumé final
console.log('═══════════════════════════════════════════════════\n');

if (hasErrors) {
  console.log('❌ CONFIGURATION INCOMPLÈTE\n');
  console.log('Des erreurs ont été détectées. Veuillez corriger les variables');
  console.log('mentionnées ci-dessus avant de lancer l\'application.\n');
  console.log('📚 Consultez les guides suivants pour de l\'aide :');
  console.log('   - DEPLOYMENT_GUIDE.md (guide étape par étape)');
  console.log('   - CLOUDINARY-SETUP.md (configuration Cloudinary)');
  console.log('   - PROJECT_SUMMARY.md (documentation complète)\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  CONFIGURATION PARTIELLEMENT COMPLÈTE\n');
  console.log('La configuration de base est correcte, mais certaines variables');
  console.log('optionnelles sont manquantes. L\'application fonctionnera, mais');
  console.log('certaines fonctionnalités peuvent être limitées.\n');
  process.exit(0);
} else {
  console.log('✅ CONFIGURATION COMPLÈTE ET VALIDE\n');
  console.log('Toutes les variables d\'environnement sont correctement configurées !');
  console.log('Vous pouvez maintenant lancer l\'application :\n');
  console.log('   npm run dev     (développement)');
  console.log('   npm run build   (construction pour production)');
  console.log('   npm start       (production)\n');

  console.log('🚀 Prochaines étapes :');
  console.log('   1. Créer un compte admin : npm run create-admin "Nom" "email" "password"');
  console.log('   2. Lancer le serveur : npm run dev');
  console.log('   3. Ouvrir : http://localhost:3000\n');
  process.exit(0);
}
