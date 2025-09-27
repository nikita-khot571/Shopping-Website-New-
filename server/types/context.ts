import { ExpressContext } from "apollo-server-express";

export interface Context extends ExpressContext {
  user?: any;
}
