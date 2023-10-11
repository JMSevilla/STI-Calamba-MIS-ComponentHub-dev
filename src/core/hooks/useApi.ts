import { Api } from "../api/api";
import { AuthenticationRequestAPI } from "../api/authentication/api";
import { InternalRequestAPI } from "../api/internal/api";
import Http, {HttpOptions} from "../api/http-client";
import { getItem } from "../local-storage";
import { config } from "../config";
import { useAsyncCallback } from "react-async-hook";
import { AxiosInstance } from "axios";

const HTTP_OPTIONS: HttpOptions = {
    headers: {
        "Content-Type": "application/json",
        "x-api-key" : config.value.TOKEN
    },
    onRequest: (req: any) => {
        const accessToken = getItem<string | undefined>('AT')
        if(req.headers && accessToken) req.headers.Authorization = `Bearer ${accessToken}`
    }
}

export const httpClient = new Http({ ...HTTP_OPTIONS, baseURL: config.value.STAGING })

export const useApiCallback = <R, A extends unknown>(asyncFn: (api: Api, args: A) => Promise<R>) =>
    useAsyncCallback(async (args?: A) => {
        try {
            return await asyncFn(produceApi(httpClient.client), args as A)
        } catch (error) {
            throw error
        }
    })

function produceApi(client: AxiosInstance) {
    return new Api(
        new AuthenticationRequestAPI(client),
        new InternalRequestAPI(client)
    )
}