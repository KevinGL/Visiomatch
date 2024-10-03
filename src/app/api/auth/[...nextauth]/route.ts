// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from "@/firebase/config";
import * as admin from 'firebase-admin';
import bcrypt from 'bcrypt';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        gender: { label: "Gender", type: "text" },
        search: { label: "Search", type: "text" },
        birthdate: { label: "Birthdate", type: "date" },
      },
      async authorize(credentials) {
        // Valider les informations de connexion ici
        //const user = { id: "", name: 'John Doe', email: 'john@example.com' }; // Exemple

        const usersSnapshot = await db.collection("users").get();
        const usersList = usersSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

        const user: any = usersList.filter((u: any) => u.email == credentials?.email)[0];

        if(!user)
        {
            const birth = new Date(credentials?.birthdate as string);
            const timestamp = birth.getTime();

            const dateMax = new Date();
            dateMax.setFullYear(dateMax.getFullYear() - 18);
            const timestampMax = dateMax.getTime();

            if(timestamp > timestampMax)
            {
                return null;
            }
            
            const hashedPassword = await bcrypt.hash(credentials?.password as string, 10);
            
            await db.collection("users").add({
                email: credentials?.email,
                password: hashedPassword,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                gender: credentials?.gender,
                search: credentials?.search,
                birthdate: credentials?.birthdate
              });

              return { email: credentials?.email, gender: credentials?.gender, search: credentials?.search, birthdate: credentials?.birthdate };
        }

        else
        {
            const isPasswordValid = await bcrypt.compare(credentials?.password as string, user.password);

            if(!isPasswordValid)
            {
                return null;
            }
        }

        return { email: user.email, gender: user.gender, search: user.search, birthdate: user.birthdate };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST }