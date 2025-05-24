'use client'

import * as React from 'react'
import Link from 'next/link'
import { Heart, User, Search, Menu, DoorOpen, Camera } from 'lucide-react'
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const router = useRouter();

  const navItems = [
    { name: 'Matches', callback: () => { router.push("/matchs") }, icon: Heart },
    { name: 'Tester la caméra', callback: () => { router.push("/test_video") }, icon: Camera },
    { name: 'Se déconnecter', callback: () => signOut(), icon: DoorOpen },
    { name: 'Trouver une séance visio', callback: () => { router.push("/search") }, icon: Search },
  ]

  return (
    <nav className="bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button className="flex-shrink-0" onClick={() => router.push("/")}>
              <span className="text-2xl font-bold">❤️ Visiomatch</span>
            </button>
          </div>
          <div className="hidden md:block flex-1 max-w-xs mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Find your match..."
                className="w-full bg-white text-gray-900 placeholder-gray-500 rounded-full pl-10 pr-4 py-2"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={item.callback}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-600 transition-colors duration-200"
                >
                  <item.icon className="mr-2" size={18} />
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden md:block relative">
            <Button
              variant="ghost"
              className="relative"
              size="icon"
              onClick={() => router.push("/profile")}
            >
              <div className="w-8 h-8 rounded-full bg-white text-pink-500 flex items-center justify-center">
                <User size={18} />
              </div>
            </Button>
          </div>
          <div className="md:hidden">
            <Button
              variant="ghost"
              className="relative"
              size="icon"
              aria-label={isOpen ? "Close Menu" : "Open Menu"}
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.name}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-pink-600 transition-colors duration-200"
                onClick={item.callback}
              >
                <item.icon className="mr-2" size={18} />
                {item.name}
              </button>
            ))}

              <button
                key="profile"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-pink-600 transition-colors duration-200"
                onClick={() => router.push("/profile")}
              >
                <User className="mr-2" size={18} />
                Profil
              </button>
            
            <div className="mt-4 relative">
              <input
                type="text"
                placeholder="Find your match..."
                className="w-full bg-white text-gray-900 placeholder-gray-500 rounded-full pl-10 pr-4 py-2"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}