import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Disconnect from './Disconnect';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-white text-2xl font-bold">
          <a href="#">MyLogo</a>
        </div>

        {/* Menu burger visible sur petits écrans */}
        <div className="block lg:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
              />
            </svg>
          </button>
        </div>

        {/* Menu visible sur grands écrans */}
        <div className={`w-full lg:flex lg:items-center lg:w-auto ${isOpen ? 'block' : 'hidden'}`}>
          <ul className="lg:flex lg:space-x-4">
            <li>
              <a href="#" className="block py-2 px-4 text-white hover:bg-blue-700 rounded">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="block py-2 px-4 text-white hover:bg-blue-700 rounded">
                About
              </a>
            </li>
            <li>
                <button className="block py-2 px-4 text-white hover:bg-blue-700 rounded" onClick={() => router.push("/search") }>Trouver une séance visio</button>
            </li>
            <li>
                <div className="block py-2 px-4 text-white hover:bg-blue-700 rounded">
                    <Disconnect />
                </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
