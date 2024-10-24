"use client"

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { checkExists } from './actions/checkExists';
import { useEffect, useState } from 'react';
import { setServers } from 'dns';
import { Home } from './components/Home';

export default function main()
{
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [accountExists, setAccountExists] = useState(false);

  const checkBirthdate = () =>
  {
    const birth = new Date(birthdate);
    const timestamp = birth.getTime();

    const dateMax = new Date();
    dateMax.setFullYear(dateMax.getFullYear() - 18);
    const timestampMax = dateMax.getTime();

    if(timestamp > timestampMax)
    {
      setError("Accès interdit aux mineurs");
    }

    else
    {
      setError("");
      setStep(2);
    }
  }

  let content;

  if (status === "authenticated")
  {
    content = <Home />
  }

  else
  {
    if (step === 0)
    {
      content = (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <input
            type="email"
            placeholder="Entrez votre adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full max-w-md px-4 py-2 mb-4 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button onClick={() =>
            {
              checkExists(email).then((res) => setAccountExists(res));
              setStep(1);
            }
          }
          className="w-full max-w-md px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Suivant</button>
        </div>
      );
    }

    else
    if (!accountExists)
    {
      if(step == 1)
      {
        content = (
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <input
              type="date"
              placeholder="Entrez date de naissance"
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full max-w-md px-4 py-2 mb-4 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button onClick={() =>
              {
                checkBirthdate();
              }
            }
            className="w-full max-w-md px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Suivant</button>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
        );
      }

      else
      if(step == 2)
      {
        content = (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <select onChange={(e) => setGender(e.target.value)} value={gender} className="w-full max-w-md px-4 py-2 mb-4 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Je suis</option>
            <option value="man">Un homme</option>
            <option value="woman">Une femme</option>
          </select>
          <button onClick={() =>
              {
                if(gender != "")
                {
                  setStep(3);
                }
              }
            }
            className="w-full max-w-md px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Suivant
          </button>
        </div>)
      }

      else
      if(step == 3)
      {
        content = (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <select onChange={(e) => setSearch(e.target.value)} value={search} className="w-full max-w-md px-4 py-2 mb-4 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Je cherche</option>
            <option value="man">Un homme</option>
            <option value="woman">Une femme</option>
          </select>
          <button onClick={() =>
              {
                if(search != "")
                {
                  setStep(4);
                }
              }
            }
            className="w-full max-w-md px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Suivant
          </button>
        </div>)
      }

      else
      if(step == 4)
      {
        content = (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <input
            type="password"
            placeholder="Mot de passe ?"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full max-w-md px-4 py-2 mb-4 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button onClick={() => signIn("credentials",
            {
              redirect: false,
              email,
              password,
              gender,
              search,
              birthdate
            })}
            className="w-full max-w-md px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">S'inscrire
          </button>
        </div>)
      }
    }

    else
    {
      content = (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <input
            type="password"
            placeholder="Mot de passe ?"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full max-w-md px-4 py-2 mb-4 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button onClick={() => signIn("credentials",
            {
              redirect: false,
              email,
              password
            }).then((res) => {
              if(!res?.ok)
              {
                setError("Mauvais mot de passe");
              }
            })}
            className="w-full max-w-md px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Se connecter
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>)
    }
  }

  return (
    <div className="bg-pink-50 min-h-screen">
      {content}
    </div>
  );
}
