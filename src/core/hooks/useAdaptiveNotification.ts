import { useState } from 'react'

export const useAdaptiveNotification = () => {
    const [ticketId, setTicketId] = useState('')
    const [acknowledgedNotification, setAcknowledgeNotification] = useState<boolean>(false)

    const getTicketId = () => ticketId

    const setTicketIdAndType = (id: string, type: boolean) => {
        setTicketId(id)
        setAcknowledgeNotification(type)
    }

    return {
        ticketId,
        acknowledgedNotification,
        getTicketId,
        setTicketIdAndType
    }
}