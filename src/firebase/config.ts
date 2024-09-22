// lib/firebaseAdmin.ts
import * as admin from 'firebase-admin';
import path from 'path';
import * as fs from 'fs';

// Chemin vers le fichier de compte de service
const serviceAccountPath = path.resolve("./visiomatch-cf5e1-firebase-adminsdk-uaysq-b337d09def.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

// Initialiser Firebase Admin uniquement si cela n'a pas déjà été fait
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    //databaseURL: process.env.FIREBASE_DATABASE_URL, // Remplacer par ton URL
  });
}

const db = admin.firestore();
export { db };