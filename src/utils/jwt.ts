import jwt from "jsonwebtoken"
import Types from "mongoose"

type UserPayload = {
    id: Types.ObjectId
}


export const generateAccessToken = ( payload : UserPayload ) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '180d', algorithm: 'HS256' })
}

