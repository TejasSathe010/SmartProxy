```markdown
# nginx-scratch

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

You can install `nginx-scratch` locally using the following command:

```bash
npm install nginx-scratch
```

## How to Use Locally

To use the `nginx-scratch` reverse proxy locally, follow these steps:

1. **Create a `config.yaml` File**

   This file will define your proxy settings, upstreams, load balancing strategy, and more.

   Example `config.yaml`:

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

2. **Run the Proxy Using `npx`**

   With `nginx-scratch` installed globally or via `npx`, run the reverse proxy like this:

   ```bash
   npx nginx-scratch --config config.yaml
   ```

   This will start the reverse proxy server, listening on the specified port and applying the configuration from `config.yaml`.

## Development

1. **Clone the Repository**

   Clone the repository to your local machine:

   ```bash
   git clone [https://github.com/your-username/nginx-scratch.git](https://github.com/your-username/nginx-scratch.git)
   cd nginx-scratch
   ```

2. **Build the Project**

   To compile the TypeScript code to JavaScript, run:

   ```bash
   npm run build
   ```

3. **Link the Project Locally**

   To link your project globally for development, use the following command:

   ```bash
   npm link
   ```

   Now you can use `npx` to run `nginx-scratch` locally from any directory on your system.

4. **Run Locally in Development Mode**

   You can also run the reverse proxy in development mode, where it watches for file changes and automatically restarts:

   ```bash
   npm run dev
   ```

5. **Test the Project**

   The library does not include specific tests at the moment, but you can add your tests in the `tests` directory.

   ```bash
   npm test
   ```

## Configuration Options

The reverse proxy is configured using a YAML file (`config.yaml`). The configuration options include:

- `server.listen`: The port on which the reverse proxy server will listen.
- `server.workers`: The number of worker processes to spawn.
- `server.isHealthCheckEnabled`: Whether to enable upstream health checks.
- `server.upstreams`: The list of upstream servers.
- `server.rules`: A list of rules defining which upstreams handle which requests.
- `healthCheckInterval`: The interval between health checks (default: 30 seconds).
- `healthCheckTimeout`: The timeout for health check requests (default: 5 seconds).

## Example Usage

Here's an example of how you might configure `nginx-scratch` for your project.

1. Create a `config.yaml` file with the configuration:

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

2. Run the proxy:

   ```bash
   npx nginx-scratch --config config.yaml
   ```

The reverse proxy will handle requests according to the rules in the `config.yaml` file, load-balancing between upstream servers and checking their health.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Feel free to open issues or create pull requests for improvements or bug fixes. Contributions are welcome!

## Acknowledgements

This project is inspired by the Nginx reverse proxy and load balancing strategies. The goal is to provide a simple Node.js-based alternative with customizable features.
```



LOAD_BALANCE_STRATEGY=round_robin node main.js --config config.yaml

LOAD_BALANCE_STRATEGY=least_connections node main.js --config config.yaml
