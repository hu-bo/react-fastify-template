import { defineConfig } from 'orval';

export default defineConfig({
  projects: {
    input: { target: '../app-server/openapi.json' },
    output: {
      target: './src/api/generated/projects-api.ts',
      schemas: './src/api/generated/models',
      mode: 'split',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
      tsconfig: './tsconfig.app.json',
      override: {
        mutator: { path: './src/api/transport.ts', name: 'apiFetch' },
        fetch: { includeHttpResponseReturnType: false },
        query: { useQuery: true, useMutation: false, signal: true },
        operations: {
          createProject: { query: { useQuery: false, useMutation: true } },
          updateProject: { query: { useQuery: false, useMutation: true } },
          deleteProject: { query: { useQuery: false, useMutation: true } },
        },
      },
    },
  },
});
