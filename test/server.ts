import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// The MSW mock harness for the Node/jsdom test environment.
export const server = setupServer(...handlers);
