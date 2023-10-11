/**@deprecated This code only works on Next Typescript not applicable on React Typescript */
import { AxiosError } from 'axios'
import { useEffect, useRef } from 'react'
import { useAccessToken, useRefreshToken } from './useStore'
import Http from '../api/http-client'
import { httpClient, useApiCallback } from './useApi'
import { useAuthContext } from '../context/AuthContext'


export const useRefreshTokenHandler = () => {
    const { logout } = useAuthContext()
    const [accessToken, setAccessToken] = useAccessToken()
    const [refreshToken, setRefreshToken] = useRefreshToken()
    const retryInProgressRequest = useRef<Promise<void> | null>()
    const refreshTokenCall = useApiCallback(async (api, args:{
        AccessToken: string | undefined,
        RefreshToken: string | undefined
    }) => await api.auth.refreshToken(args))

    useEffect(() => httpClient.setupMiddlewareOptions({ onErrorHandler: handleRetry }), [])

    const handleRetry = async (err: AxiosError | any, http: Http) => {
        if(err.response?.status !== 401){
            return Promise.reject(err)
        }
        if(err.response?.status === 401){
            return logout()
        }

        if (!retryInProgressRequest.current) {
            retryInProgressRequest.current = refresh(err).then(() => {
              retryInProgressRequest.current = null;
            });
          }

        try {
            await retryInProgressRequest.current;
            http.options?.onRequest?.(err.config);
      
            return http.client(err.config);
          } catch {
            retryInProgressRequest.current = null;
          }
        return Promise.reject(err)
    }

    const refresh = async (error: AxiosError): Promise<void> => {
        if(accessToken && refreshToken){
            try {
                const result: any = await refreshTokenCall.execute({ AccessToken: accessToken, RefreshToken: refreshToken })
                setAccessToken(result.data.accessToken)
                setRefreshToken(result.data.refreshToken)
                return Promise.resolve()
            } catch (error) {
                throw error;
            }
        }
    }
}