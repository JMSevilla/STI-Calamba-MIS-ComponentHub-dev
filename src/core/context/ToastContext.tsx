import { createContext, useContext } from 'react'
import {ToastContextSetup} from '../types'

import { toast } from 'react-toastify'

export const ToastContext = createContext<ToastContextSetup>(undefined as any);

type ToastContextProps = {
  children: React.ReactNode;
};

const ToastProvider: React.FC<ToastContextProps> = ({ children }) => {
    const ToastMessage = (
        message: string,
        position: any,
        hideProgressBar: boolean,
        closeOnClick?: boolean,
        pauseOnHover?: boolean,
        draggable?: boolean,
        progress?: any,
        theme?: any,
        type?: any
      ) => {
        switch (type) {
          case "success":
            toast.success(message, {
              position: position,
              autoClose: 5000,
              hideProgressBar: hideProgressBar,
              closeOnClick: closeOnClick,
              pauseOnHover: pauseOnHover,
              draggable: draggable,
              progress: progress,
              theme: theme,
            });
            break;
          case "error":
            toast.error(message, {
              position: position,
              autoClose: 5000,
              hideProgressBar: hideProgressBar,
              closeOnClick: closeOnClick,
              pauseOnHover: pauseOnHover,
              draggable: draggable,
              progress: progress,
              theme: theme,
            });
            break;
          case "warning":
            toast.error(message, {
              position: position,
              autoClose: 5000,
              hideProgressBar: hideProgressBar,
              closeOnClick: closeOnClick,
              pauseOnHover: pauseOnHover,
              draggable: draggable,
              progress: progress,
              theme: theme,
            });
            break;
          default:
            break;
        }
      };
      return (
        <ToastContext.Provider
            value={{
                ToastMessage
            }}
        >{children}</ToastContext.Provider>
      )
}

export default ToastProvider

export const useToastMessage = () => {
    if(!ToastContext){
        throw new Error("Toast message must be used.")
    }
    return useContext(ToastContext)
}