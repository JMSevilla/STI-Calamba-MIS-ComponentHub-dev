import React, { useState } from 'react'

export const useCurrentScreen = () => {
    const [currentScreen, setCurrentScreen] = useState<string>("classroom")
    return {
        currentScreen,
        setCurrentScreen
    }
}