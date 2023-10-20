import { atom, useAtom } from "jotai";

export const defaultAccess = atom(false)
export const usePreventAccess = () => {
    const [access, setAccess] = useAtom(defaultAccess)

    return {
        access,
        setAccess
    }
}