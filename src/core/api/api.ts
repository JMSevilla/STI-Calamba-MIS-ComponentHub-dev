import { AuthenticationRequestAPI } from "./authentication/api";
import { InternalRequestAPI } from "./internal/api";

export class Api {
    constructor(readonly auth: AuthenticationRequestAPI, readonly internal: InternalRequestAPI) {}
}