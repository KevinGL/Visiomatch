"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var admin = require("firebase-admin");
var path_1 = require("path");
var serviceAccountPath = path_1.default.resolve("./visiomatch-cf5e1-firebase-adminsdk-uaysq-b337d09def.json");
/*const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}*/
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Remplacer les nouvelles lignes si nécessaire
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        // databaseURL: process.env.FIREBASE_DATABASE_URL, // Si nécessaire
    });
}
var db = admin.firestore();
exports.db = db;
