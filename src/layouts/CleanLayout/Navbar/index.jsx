import { Smile } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const logoSrc = "/src/assets/WHR.png";

  return (
    <header className="bg-primary text-primary-foreground shadow-md py-2">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-center">
        <Link to="/" className="flex items-center space-x-2">
          <img src={logoSrc} alt="logo" className="w-52" />
        </Link>
      </nav>
    </header>
  );
}