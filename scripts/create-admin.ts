import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Schéma User simplifié pour éviter les imports complexes
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["producteur", "acheteur", "admin"], required: true },
    phone: { type: String },
    location: { type: String },
    avatar: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function createAdmin() {
  try {
    // Récupérer les arguments de ligne de commande
    const args = process.argv.slice(2);
    const name = args[0];
    const email = args[1];
    const password = args[2];
    const phone = args[3];
    const location = args[4];

    // Validation
    if (!name || !email || !password) {
      console.error("\n❌ Usage: npm run create-admin \"Nom Complet\" \"email@example.com\" \"motdepasse\" [\"téléphone\"] [\"localisation\"]\n");
      console.error("Exemple: npm run create-admin \"Admin DJENEBA\" \"admin@djeneba.com\" \"admin123456\"\n");
      process.exit(1);
    }

    if (password.length < 6) {
      console.error("❌ Le mot de passe doit contenir au moins 6 caractères");
      process.exit(1);
    }

    // Connexion à MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/djeneba";

    console.log("\n🔌 Connexion à MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connecté à MongoDB\n");

    // Vérifier si l'admin existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error(`❌ Un utilisateur avec l'email ${email} existe déjà`);
      await mongoose.disconnect();
      process.exit(1);
    }

    // Hasher le mot de passe
    console.log("🔒 Hachage du mot de passe...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'admin
    console.log("👤 Création du compte administrateur...");
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      phone: phone || undefined,
      location: location || undefined,
    });

    console.log("\n✅ Compte administrateur créé avec succès!");
    console.log("\n📋 Détails du compte:");
    console.log(`   Nom: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Rôle: ${admin.role}`);
    if (phone) console.log(`   Téléphone: ${phone}`);
    if (location) console.log(`   Localisation: ${location}`);
    console.log(`\n🔑 Vous pouvez maintenant vous connecter sur: http://localhost:3000/connexion\n`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'admin:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();
