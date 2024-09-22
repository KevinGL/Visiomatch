"use client"

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [failCredential, setFailCredential] = useState(false);
  
  const login = () =>
  {
    signIn("credentials",
    {
      redirect: false,
      email,
      password,
    }).then((res) =>
    {
      if(!res?.ok)
      {
        setFailCredential(true);
      }
      else
      {
        setFailCredential(false);
      }
    });
  }

  return (
    <div className="w-full max-w-sm">
        {
          failCredential &&
          (
            <div className="text-red-500 mb-4">
              Erreur identifiants : Veuillez vérifier votre email ou mot de passe.
            </div>
          )
        }
        
        <form className="w-full max-w-sm">
          <div className="md:flex md:items-center mb-6">
            <div className="md:w-1/3">
              <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
                Email
              </label>
            </div>
            <div className="md:w-2/3">
              <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-full-name" type="text" onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="md:flex md:items-center mb-6">
            <div className="md:w-1/3">
              <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
                Mot de passe
              </label>
            </div>
            <div className="md:w-2/3">
              <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-password" type="password" placeholder="******************" onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <div className="md:flex md:items-center">
            <div className="md:w-1/3"></div>
            <div className="md:w-2/3">
              <button className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded mr-1" type="button" onClick={login}>
                Se connecter
              </button>
            </div>
          </div>
        </form>
    </div>
  )
}
