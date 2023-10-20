import { Avatar, Badge, styled } from '@mui/material';
import React, { useEffect, useState } from "react";
import { useApiCallback } from '../../core/hooks/useApi';
import { useReferences } from '../../core/hooks/useStore';

type BadgeProps = {
    node: React.ReactNode
    accountId?: any
}

export const BasicStyledBadge = ({ node, accountId }: BadgeProps) => {
    const [references, setReferences] = useReferences()
    const [active, setActive] = useState(false)
    const apiActiveStatusIdentifier = useApiCallback(
        async (api, accountId: number) => 
        await api.internal.activeStatusIdentifier(accountId)
    )
    function initializedActiveStatus() {
        apiActiveStatusIdentifier.execute(accountId ?? 0)
        .then((response) => {
            setActive(response.data)
        })
    }
    useEffect(() => {
        initializedActiveStatus()
    }, [active])
    const StyledBadge = styled(Badge)(({ theme }) => ({
        '& .MuiBadge-badge': {
          backgroundColor: active ? '#44b700' : 'red',
          color: active ? '#44b700' : 'red',
          boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
          '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
          },
        },
        '@keyframes ripple': {
          '0%': {
            transform: 'scale(.8)',
            opacity: 1,
          },
          '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
          },
        },
    }));
    return (
        <>
            <StyledBadge
                overlap='circular'
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant='dot'
            >
                {node}
            </StyledBadge>
        </>
    )
}