import React from 'react';
import Footer from '../components/layout/Footer/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

export default MainLayout; 