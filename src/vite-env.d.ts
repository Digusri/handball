/// <reference types="vite/client" />

// Extendemos la interfaz Window para que TypeScript sepa que process existe allí
interface Window {
  process: {
    env: {
      API_KEY: string;
      [key: string]: string | undefined;
    }
  }
}
