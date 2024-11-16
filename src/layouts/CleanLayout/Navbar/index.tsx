import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

export default function Navbar() {
  const logoSrc = "/src/assets/WHR.png";

  return (
    <header className="bg-primary text-primary-foreground shadow-md py-2">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src={logoSrc} alt="World Happiness Report Logo" className="w-52" />
        </Link>
        <Link 
          to="/info" 
          className="text-primary-foreground hover:text-primary-foreground/80 transition-colors"
          aria-label="Information Page"
        >
          <HelpCircle className="w-6 h-6" />
        </Link>
      </nav>
    </header>
  );
}