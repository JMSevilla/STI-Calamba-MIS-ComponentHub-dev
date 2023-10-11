import {
    useState, useMemo
} from 'react'

export function useMemoizedPassword(initialPassword: string = ''){
    const [password, setPassword] = useState<string>(initialPassword)

    const memoizedPassword = useMemo(() => password, [password])
    const hookPassword = (newPassword: string | undefined) => {
        setPassword(newPassword ?? "")
    }
    return {
        password: memoizedPassword, hookPassword
    }
}