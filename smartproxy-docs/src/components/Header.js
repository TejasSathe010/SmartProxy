import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center py-5">
        <h1 className="text-3xl font-bold">SmartProxy</h1>
        <nav>
          <ul className="flex space-x-8">
            <li><Link to="/" className="hover:text-accent transition-colors">Home</Link></li>
            <li><Link to="/installation" className="hover:text-accent transition-colors">Installation</Link></li>
            <li><Link to="/features" className="hover:text-accent transition-colors">Features</Link></li>
            <li><Link to="/usage" className="hover:text-accent transition-colors">Usage</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
