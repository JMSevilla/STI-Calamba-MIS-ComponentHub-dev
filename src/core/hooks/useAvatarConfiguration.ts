import React from 'react'


export const useAvatarConfiguration = () => {
    
    function stringToColor(string: string) {
        let hash = 0;
        let i;
        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        let color = '#';
        
        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        return color;
        }
    function stringAvatar(name: string) {
        return {
            sx: {
            bgcolor: stringToColor(name),
            width: 150, height: 150
            },
            children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
        };
    }

    function stringAvatarColumns(name: string) {
        return {
            sx: {
            bgcolor: stringToColor(name),
            width: 50, height: 50
            },
            children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
        };
    }
    function stringAvatarTicketDetails(name: string) {
        return {
            sx: {
            bgcolor: stringToColor(name),
            width: 30, height: 30
            },
            children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
        };
    }
    return {
        stringToColor,
        stringAvatar,
        stringAvatarColumns,
        stringAvatarTicketDetails
    }
}