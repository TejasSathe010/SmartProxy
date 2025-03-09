import React from 'react';

const UsagePage = () => {
  return (
    <section className="container mx-auto py-16">
      <h2 className="text-3xl font-bold text-dark mb-6">Usage</h2>
      <p className="text-lg text-darkGrey mb-8">To use SmartProxy locally, follow these steps:</p>
      <h3 className="text-2xl font-semibold text-dark mb-4">1. Create a config.yaml File</h3>
      <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-auto">
        server:
          listen: 8080
          workers: 4
          upstreams:
            - id: upstream1
              url: http://localhost:3001
            - id: upstream2
              url: http://localhost:3002
          rules:
            - path: "/api"
              upstreams:
                - upstream1
                - upstream2
      </pre>
      <h3 className="text-2xl font-semibold text-dark mb-4 mt-8">2. Run the Proxy</h3>
      <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-auto">
        npx nginx-scratch --config config.yaml
      </pre>
    </section>
  );
};

export default UsagePage;
