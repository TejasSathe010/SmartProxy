# SmartProxy

`nginx-scratch` is a lightweight reverse proxy server built in Node.js, inspired by Nginx, designed for use in any Node.js project. It provides load balancing strategies, support for worker processes, upstream health checks, and more. This library allows you to configure and manage your reverse proxy with ease, simulating the behavior of Nginx in a customizable, simple-to-use manner.

## Features

- **Reverse Proxy**: Forward HTTP requests to different upstream servers.
- **Load Balancing**: Supports multiple load balancing strategies:
  - **Round Robin** (default)
  - **Least Connections**
- **Worker Pool**: Spawns worker processes to handle requests in a multi-threaded fashion.
- **Upstream Health Checks**: Automatically checks the health of upstream servers and retries on failure.
- **Customizable Configuration**: Easily configurable via a YAML file for seamless integration into your project.
- **Health Check Support**: Configurable health check interval and retry limits to ensure your upstreams are always available.

## Installation

```bash
npm install nginx-scratch
```

## How to Use Locally

To use the `nginx-scratch` reverse proxy locally, follow these steps:

1. **Create a `config.yaml` File:**

   This file will define your proxy settings, upstreams, load balancing strategy, and more.

   ```yaml
   server:
     listen: 8080
     workers: 4
     isHealthCheckEnabled: true
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
   ```
    Or
   ```yaml
   server:
      listen: 8080
      workers: 4
      upstreams:
        - id: jsonplaceholder
          url: jsonplaceholder.typicode.com
        
      headers:
        - key: x-forword-for
          value: '$ip'
        - key: Authorization
          value: 'Bearer xyz'
      
      rules:
        - path: /
          upstreams: 
            - jsonplaceholder    
   ```

2. **Run the Proxy Using `npx`:**

   With `nginx-scratch` installed globally or via `npx`, run the reverse proxy like this:

   ```bash
   npx nginx-scratch --config config.yaml
   ```

   This will start the reverse proxy server, listening on the specified port and applying the configuration from `config.yaml`.  You can also specify the load balancing strategy via environment variables:

   ```bash
   LOAD_BALANCE_STRATEGY=round_robin npx nginx-scratch --config config.yaml  # or least_connections
   ```

## Development

1. **Clone the Repository:**

   ```bash
   git clone [https://github.com/your-username/nginx-scratch.git](https://github.com/your-username/nginx-scratch.git)
   cd nginx-scratch
   ```

2. **Build the Project:**

   To compile the TypeScript code to JavaScript, run:

   ```bash
   npm run build
   ```

3. **Link the Project Locally:**

   To link your project globally for development, use the following command:

   ```bash
   npm link
   ```

   Now you can use `npx` to run `nginx-scratch` locally from any directory on your system.

4. **Run Locally in Development Mode:**

   You can also run the reverse proxy in development mode, where it watches for file changes and automatically restarts:

   ```bash
   npm run dev
   ```

5. **Test the Project:**

   The library does not include specific tests at the moment, but you can add your tests in the `tests` directory.

   ```bash
   npm test
   ```

## Configuration Options (`config.yaml`)

The reverse proxy is configured using a YAML file (`config.yaml`). The configuration options include:

- `server.listen`: The port on which the reverse proxy server will listen.
- `server.workers`: The number of worker processes to spawn.
- `server.isHealthCheckEnabled`: Whether to enable upstream health checks.
- `server.upstreams`: The list of upstream servers.  Each upstream should have an `id` and a `url`.
- `server.rules`: A list of rules defining which upstreams handle which requests.  Each rule should have a `path` and a list of `upstreams` (referenced by `id`).
- `healthCheckInterval`: The interval between health checks (default: 30 seconds).
- `healthCheckTimeout`: The timeout for health check requests (default: 5 seconds).

## Example Usage

Here's an example of how you might configure `nginx-scratch` for your project.

1. **Create a `config.yaml` file:**

   ```yaml
   server:
     listen: 8080
     workers: 2
     isHealthCheckEnabled: true
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
   ```

2. **Run the proxy:**

   ```bash
   npx nginx-scratch --config config.yaml
   ```

The reverse proxy will handle requests according to the rules in the `config.yaml` file, load-balancing between upstream servers and checking their health.

## Load Balancing Strategies

You can select the load balancing strategy using the `LOAD_BALANCE_STRATEGY` environment variable:

- `round_robin` (default)
- `least_connections`

Example:

```bash
LOAD_BALANCE_STRATEGY=least_connections npx nginx-scratch --config config.yaml
```

## Demo Images:
![Demo Image](https://github.com/TejasSathe010/Web-Server-Software-Ngnix/blob/main/img/demo1.png)
![Demo Image](https://github.com/TejasSathe010/Web-Server-Software-Ngnix/blob/main/img/demo2.png)
![Demo Image](https://github.com/TejasSathe010/Web-Server-Software-Ngnix/blob/main/img/demo3.png)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Feel free to open issues or create pull requests for improvements or bug fixes. Contributions are welcome!

## Acknowledgements

This project is inspired by the Nginx reverse proxy and load balancing strategies. The goal is to provide a simple Node.js-based alternative with customizable features.
```
