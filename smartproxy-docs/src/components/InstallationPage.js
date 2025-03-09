import React from 'react';

const InstallationPage = () => {
  return (
    <section className="container mx-auto py-16">
      <h2 className="text-3xl font-bold text-dark mb-6">Installation</h2>
      <p className="text-lg text-darkGrey mb-8">Follow these steps to install SmartProxy in your project:</p>
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold text-dark mb-4">Step 1: Install SmartProxy</h3>
        <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-auto">
          npm install nginx-scratch
        </pre>
        <h3 className="text-2xl font-semibold text-dark mb-4 mt-8">Step 2: Run the Proxy</h3>
        <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-auto">
          npx nginx-scratch --config config.yaml
        </pre>
      </div>
    </section>
  );
};

export default InstallationPage;
