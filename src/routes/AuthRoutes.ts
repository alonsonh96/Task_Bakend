import { Router } from "express";

const router = Router();

router.get('/login', (req, res) => {
    res.send('Login Page');
})


export default router;