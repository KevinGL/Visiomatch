import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from "@/firebase/config";
import * as admin from 'firebase-admin';
import bcrypt from 'bcrypt';
import { JWT } from 'next-auth/jwt';

export const authOptions =
{
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          name: { label: "Name", type: "text" },
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" },
          gender: { label: "Gender", type: "text" },
          search: { label: "Search", type: "text" },
          city: { label: "City", type: "text" },
          zipcode: { label: "Zip Code", type: "text" },
          country: { label: "Country", type: "text" },
          phoneNumber: { label: "Num tel", type: "text" },
          birthdate: { label: "Birthdate", type: "text" },
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
              
              const newUser = await db.collection("users").add({
                  name: credentials?.name,
                  email: credentials?.email,
                  password: hashedPassword,
                  createdAt: admin.firestore.FieldValue.serverTimestamp(),
                  gender: credentials?.gender,
                  search: credentials?.search,
                  city: credentials?.city,
                  zipcode: credentials?.zipcode,
                  country: credentials?.country,
                  phoneNumber: credentials?.phoneNumber,
                  birthdate: credentials?.birthdate,
                  admin: false,
                  participations: []
                });
  
                return { id: newUser.id, email: credentials?.email, gender: credentials?.gender, search: credentials?.search, birthdate: credentials?.birthdate, name: credentials?.name };
          }
  
          else
          {
              const isPasswordValid = await bcrypt.compare(credentials?.password as string, user.password);
  
              if(!isPasswordValid)
              {
                  return null;
              }
          }
  
          return { id: user.id, email: user.email, gender: user.gender, search: user.search, birthdate: user.birthdate, name: user.name };
        },
      }),
    ],
  
    callbacks: {
      async jwt({ token, user }: { token: JWT, user?: any })
      {
        // Si l'utilisateur est authentifié, ajouter l'id dans le token JWT
        if (user)
        {
          token.id = user.id;  // Ajouter l'id de l'utilisateur dans le JWT
          token.name = user.name;
        }
        return token;
      },
  
      async session({ session, token }: { session: any, token: JWT })
      {
        // Ajouter l'id de l'utilisateur à la session depuis le token JWT
        if (token?.id)
        {
          session.user.id = token.id;  // Ajouter l'id dans les données de session
          session.user.name = token.name;
        }
        return session;
      }
    },
  
    secret: process.env.NEXTAUTH_SECRET
  }