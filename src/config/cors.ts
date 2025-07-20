import { CorsOptions } from "cors"

const whitelist = [
  process.env.FRONTEND_UR
];

export const corsOptions : CorsOptions = {
    origin: function(origin, callback){
        if (!origin) return callback(null, true);
        if(whitelist.includes(origin)){
            return callback(null, true)
        } else {
            return callback(new Error('❌ Acceso no permitido por CORS'))
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}