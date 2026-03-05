import type { RuntimeEnv } from './runtime-env';

declare global {
  interface Window {
    __appEnv?: Partial<RuntimeEnv>;
  }
}

export {};
