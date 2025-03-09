import React from 'react';

const HomePage = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto text-center px-4">
        <h2 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
          Welcome to SmartProxy Documentation
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          A lightweight reverse proxy server built with Node.js, inspired by Nginx. Highly customizable and easy to use.
        </p>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <div className="p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Installation</h3>
            <p className="text-lg text-gray-500">
              Learn how to install and set up SmartProxy with ease. Simple steps for local and production environments.
            </p>
          </div>
          <div className="p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Features</h3>
            <p className="text-lg text-gray-500">
              Explore the features of SmartProxy, including load balancing strategies, worker processes, and health checks.
            </p>
          </div>
          <div className="p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Usage</h3>
            <p className="text-lg text-gray-500">
              Learn how to use SmartProxy effectively in your Node.js projects. Easy integration and configuration examples.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
