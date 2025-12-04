import { Eip1193Provider } from "ethers";

// 1. Global Window Interface
declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (eventName: string, listener: (...args: unknown[]) => void) => void;
      removeListener: (eventName: string, listener: (...args: unknown[]) => void) => void;
    };
  }
}

// 2. Property Data Structure
export interface HomeAttributes {
  id: number;
  name: string;
  address: string;
  description: string;
  price: string;
  image: string;
  isListed: boolean;
}
