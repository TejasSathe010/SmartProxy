import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './components/HomePage';
import InstallationPage from './components/InstallationPage';
import FeaturesPage from './components/FeaturesPage';
import UsagePage from './components/UsagePage';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="font-sans bg-gray-50">
        <Header />
        <main className="py-10 px-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/installation" element={<InstallationPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/usage" element={<UsagePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
