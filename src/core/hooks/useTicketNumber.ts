import { useState } from 'react';

export const useTicketNumber = (prefix: string, min: number, max: number): [string, () => void] => {
    const generateRandomTicketNumber = (): string => {
      const randomCounter = Math.floor(Math.random() * (max - min + 1)) + min;
      const formattedCounter = randomCounter.toString().padStart(4, '0');
      return `${prefix}-${formattedCounter}`;
    };
  
    const [ticketNumber, setTicketNumber] = useState<string>(() => generateRandomTicketNumber());
  
    const generateNewRandomTicketNumber = (): void => {
      setTicketNumber(generateRandomTicketNumber());
    };
  
    return [ticketNumber, generateNewRandomTicketNumber];
};