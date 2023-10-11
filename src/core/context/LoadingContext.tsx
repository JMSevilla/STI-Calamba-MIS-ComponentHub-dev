import { createContext, useContext, useState } from 'react'

type Props = {
    loading: boolean
    setLoading: (isLoading: boolean) => void
    preload: boolean
    setPreLoad: (isLoading: boolean) => void
    gridLoad: boolean
    setGridLoad: (gridLoad: boolean) => void
}

const LoadingContext = createContext<Props>(undefined as any)

export const LoadingProvider: React.FC<React.PropsWithChildren<{}>> = ({
    children
}) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [preload, setPreLoad] = useState<boolean>(true)
    const [gridLoad, setGridLoad] = useState<boolean>(true)
    return (
        <LoadingContext.Provider
        value={{
            loading,
            setLoading,
            preload,
            setPreLoad,
            gridLoad,
            setGridLoad
        }}
        >{children}</LoadingContext.Provider>
    )
}

export const useLoaders = () => {
    if(!LoadingContext){
        throw new Error("Loading Provider must used")
    }
    return useContext(LoadingContext)
}