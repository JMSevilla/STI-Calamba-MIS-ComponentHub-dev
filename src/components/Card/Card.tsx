import { Card, CardContent } from "@mui/material";

type CardProps = {
    children?: React.ReactNode
    style?: React.CSSProperties
    className?: any
    elevation?: number
}

const BaseCard: React.FC<CardProps> = ({ children, style, className , elevation}) => {
    return (
        <>
            <Card elevation={elevation ?? 5} className={className} style={style}>
                <CardContent>
                    {children}
                </CardContent>
            </Card>
        </>
    )
}

export default BaseCard