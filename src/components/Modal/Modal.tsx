import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Button } from '@mui/material';

type ModalProps = {
    open?: any
    handleClose?: () => void
    handleSubmit?: () => void
    handleDecline?: () => void
    title?: string
    children?: React.ReactNode
    buttonTextAccept?: string
    buttonTextDecline?: string
    color?: any
    maxWidth?: any
    enableDecline?: boolean
    disableButton?: boolean
    isValid?: boolean
}

const ControlledModal: React.FC<ModalProps> = ({
    open,
    handleClose,
    handleDecline,
    handleSubmit,
    title, 
    children,
    buttonTextAccept,
    buttonTextDecline,
    color,
    maxWidth,
    enableDecline = true,
    disableButton = false,
    isValid
}) => {
    return(
        <>
             <Dialog
                fullWidth
                maxWidth={maxWidth}
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                {title}
                </DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {children}
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                
                <>
                    {
                        !disableButton &&
                        <>
                        {
                                enableDecline && <Button sx={{
                                    display: buttonTextAccept == 'NO-BTN' ? 'none' : ''
                                }} variant='outlined' color='error' onClick={handleDecline}>{buttonTextDecline}</Button>
                            }
                            <Button sx={{
                            display: buttonTextAccept == 'NO-BTN' ? 'none' : ''
                            }} disabled={isValid} variant='outlined' color={color} onClick={handleSubmit} autoFocus>
                                {buttonTextAccept}
                            </Button>
                            
                        </>
                    }
                </>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ControlledModal