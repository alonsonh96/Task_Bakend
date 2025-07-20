import { CorsOptions } from "cors"

const whitelist = [
  process.env.FRONTEND_URL
];

export const corsOptions : CorsOptions = {
    origin: function(origin, callback){
        if (!origin) return callback(null, true);
        if(whitelist.includes(origin)){
            return callback(null, true)
        } else {
            console.warn(`🚫 CORS blocked request from origin: ${origin}`);
            return callback(new Error("❌ Access not allowed by CORS"));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}