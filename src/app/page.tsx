"use client"

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { checkExists } from './actions/users/checkExists';
import { useEffect, useState } from 'react';
import { setServers } from 'dns';
import { Home } from './components/Home';
import { CalendarDays, Mail, MapPin, Phone, User, Lock, Globe, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const CenteredField: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center bg-pink-50">
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
      {children}
    </div>
  </div>
)

export default function main()
{
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [country, setCountry] = useState("");
  const [phoneNumber, setPhonenumber] = useState("");
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
        <CenteredField>
          <div className="space-y-4">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-2" />
              <Input
                id="email"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow"
              />
            </div>
            <Button onClick={async () =>
                {
                  const res: boolean = await checkExists(email);
                  setAccountExists(res);
                  setStep(1);
                }} className="w-full bg-pink-600 hover:bg-pink-700 text-white">Suivant</Button>
          </div>
        </CenteredField>
      );
    }

    else
    if (!accountExists)
    {
      if(step == 1)
      {
        content = (
          <CenteredField>
            <div className="space-y-4">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <div className="flex items-center">
                <CalendarDays className="w-5 h-5 text-gray-400 mr-2" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="flex-grow"
                />
              </div>
              <Button onClick={checkBirthdate} className="w-full bg-pink-600 hover:bg-pink-700 text-white">Suivant</Button>
            </div>
          </CenteredField>
        );
      }

      else
      if(step == 2)
      {
        content = (
          <CenteredField>
            <div className="space-y-4">
              <Label htmlFor="gender">Je suis</Label>
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-2" />
                <Select onValueChange={(e) => setGender(e)}>
                  <SelectTrigger className="flex-grow">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="man">Homme</SelectItem>
                    <SelectItem value="woman">Femme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() =>
              {
                if(gender != "")
                {
                  setStep(3);
                }
              }
              } className="w-full bg-pink-600 hover:bg-pink-700 text-white">Suivant</Button>
            </div>
          </CenteredField>
        )
      }

      else
      if(step == 3)
      {
        content = (
          <CenteredField>
            <div className="space-y-4">
              <Label htmlFor="gender">Je cherche</Label>
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-2" />
                <Select onValueChange={(e) => setSearch(e)}>
                  <SelectTrigger className="flex-grow">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="man">Homme</SelectItem>
                    <SelectItem value="woman">Femme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() =>
              {
                if(search != "")
                {
                  setStep(4);
                }
              }
              } className="w-full bg-pink-600 hover:bg-pink-700 text-white">Suivant</Button>
            </div>
          </CenteredField>
        )
      }

      else
      if(step == 4)
      {
        content = (
          <CenteredField>
            <div className="space-y-4">
              <Label htmlFor="username">Choisir un pseudo</Label>
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-2" />
                <Input
                  id="username"
                  onChange={(e) => setName(e.target.value)}
                  className="flex-grow"
                />
              </div>
              <Button onClick={() =>
                  {
                    if(name != "")
                    {
                      setStep(5);
                    }
                  }
              } className="w-full bg-pink-600 hover:bg-pink-700 text-white">Suivant</Button>
            </div>
          </CenteredField>
        )
      }

      else
      if(step == 5)
      {
        content = (
          <CenteredField>
            <div className="space-y-4">
              <div>
                <Label htmlFor="city">Ville</Label>
                <div className="flex items-center mt-1">
                  <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="flex-grow"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="postalCode">Code postal</Label>
                <div className="flex items-center mt-1">
                  <Hash className="w-5 h-5 text-gray-400 mr-2" />
                  <Input
                    id="postalCode"
                    onChange={(e) => setZipcode(e.target.value)}
                    className="flex-grow"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="country">Pays</Label>
                <div className="flex items-center mt-1">
                  <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                  <Input
                    id="country"
                    onChange={(e) => setCountry(e.target.value)}
                    className="flex-grow"
                  />
                </div>
              </div>
              <Button onClick={() =>
                {
                  if(city != "" && zipcode != "" && country != "")
                  {
                    setStep(6);
                  }
                }} className="w-full bg-pink-600 hover:bg-pink-700 text-white">Suivant</Button>
            </div>
          </CenteredField>
        )
      }

      else
      if(step == 6)
      {
        content = (
          <CenteredField>
            <div className="space-y-4">
              <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-2" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  onChange={(e) => setPhonenumber(e.target.value)}
                  className="flex-grow"
                />
              </div>
              <Button onClick={() =>
                {
                  if(name != "")
                  {
                    setStep(7);
                  }
                }} className="w-full bg-pink-600 hover:bg-pink-700 text-white">Suivant</Button>
            </div>
          </CenteredField>
        )
      }

      else
      if(step == 7)
      {
        content = (
          <CenteredField>
            <div className="space-y-4">
              <Label htmlFor="password">Choisir un mot de passe</Label>
              <div className="flex items-center">
                <Lock className="w-5 h-5 text-gray-400 mr-2" />
                <Input
                  id="password"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-grow"
                />
              </div>
              <Button onClick={
                () =>
                  {
                    if(password != "")
                    {
                      signIn("credentials",
                        {
                          redirect: false,
                          name,
                          email,
                          password,
                          gender,
                          search,
                          city,
                          zipcode,
                          country,
                          phoneNumber,
                          birthdate
                        })
                    }
                  }
              } className="w-full bg-pink-600 hover:bg-pink-700 text-white">Inscription</Button>
            </div>
          </CenteredField>
        )
      }
    }

    else
    {
      content = (
        <CenteredField>
          <div className="space-y-4">
            <Label htmlFor="password">Entrer mot de passe</Label>
            <div className="flex items-center">
              <Lock className="w-5 h-5 text-gray-400 mr-2" />
              <Input
                id="password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                className="flex-grow"
              />
            </div>
            <Button onClick={() => signIn("credentials",
                {
                  redirect: false,
                  email,
                  password
                }).then((res) => {
                  if(!res?.ok)
                  {
                    setError("Mauvais mot de passe");
                  }
                })
              } className="w-full bg-pink-600 hover:bg-pink-700 text-white">Connexion</Button>
          </div>
        </CenteredField>
      )
    }
  }

  return (
    <div className="bg-pink-50 min-h-screen">
      {content}
    </div>
  );
}
