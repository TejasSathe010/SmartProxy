import React from 'react';

const FeaturesPage = () => {
  return (
    <section className="container mx-auto py-16">
      <h2 className="text-3xl font-bold text-dark mb-6">Features</h2>
      <ul className="space-y-6">
        <li className="flex items-center space-x-4">
          <span className="text-lg text-darkGrey">🔄</span>
          <p className="text-lg text-darkGrey">
            <strong>Reverse Proxy:</strong> Forward HTTP requests to different upstream servers.
          </p>
        </li>
        <li className="flex items-center space-x-4">
          <span className="text-lg text-darkGrey">⚖️</span>
          <p className="text-lg text-darkGrey">
            <strong>Load Balancing:</strong> Supports multiple strategies including Round Robin and Least Connections.
          </p>
        </li>
        <li className="flex items-center space-x-4">
          <span className="text-lg text-darkGrey">👷‍♂️</span>
          <p className="text-lg text-darkGrey">
            <strong>Worker Pool:</strong> Spawns worker processes for better handling of requests.
          </p>
        </li>
        <li className="flex items-center space-x-4">
          <span className="text-lg text-darkGrey">🔍</span>
          <p className="text-lg text-darkGrey">
            <strong>Health Checks:</strong> Automatically checks the health of upstream servers.
          </p>
        </li>
      </ul>
    </section>
  );
};

export default FeaturesPage;
