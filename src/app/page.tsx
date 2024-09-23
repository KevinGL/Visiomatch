"use client"

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { checkExists } from './actions/checkExists';
import { useEffect, useState } from 'react';
import { setServers } from 'dns';

export default function Home()
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
    content = (<button onClick={() => signOut()}>Se déconnecter</button>);
  }

  else
  {
    if (step === 0)
    {
      content = (
        <>
          <input
            type="email"
            placeholder="Entrez adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={() =>
            {
              checkExists(email).then((res) => setAccountExists(res));
              setStep(1);
            }
          }>Suivant</button>
        </>
      );
    }

    else
    if (!accountExists)
    {
      if(step == 1)
      {
        content = (
          <>
            <input
              type="date"
              placeholder="Entrez date de naissance"
              onChange={(e) => setBirthdate(e.target.value)}
            />
            <button onClick={() =>
              {
                checkBirthdate();
              }
            }>Suivant</button>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </>
        );
      }

      else
      if(step == 2)
      {
        content = (
        <>
          <select onChange={(e) => setGender(e.target.value)}>
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
            }>Suivant
          </button>
        </>)
      }

      else
      if(step == 3)
      {
        content = (
        <>
          <select onChange={(e) => setSearch(e.target.value)}>
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
            }>Suivant
          </button>
        </>)
      }

      else
      if(step == 4)
      {
        content = (
        <>
          <input
            type="password"
            placeholder="***************"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={() => signIn("credentials",
            {
              redirect: false,
              email,
              password,
              gender,
              search,
              birthdate
            })}>S'inscrire
          </button>
        </>)
      }
    }

    else
    {
      content = (
        <>
          <input
            type="password"
            placeholder="***************"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={() => signIn("credentials",
            {
              redirect: false,
              email,
              password
            })}>S'inscrire
          </button>
        </>)
    }
  }

  return (
    content
  );
}
