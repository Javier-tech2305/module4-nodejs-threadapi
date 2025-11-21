import { loadSequelize } from "./database.mjs";
import express, { urlencoded } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

/**
 * Point d'entrée de l'application
 * Vous déclarer ici les routes de votre API REST
 */
async function main() {
    try {
        const app = express();
        app.use(express.json());
        app.use(cookieParser());
        const sequelize = await loadSequelize();
        //console.log(sequelize.models)
        const User = sequelize.models.User;
        const Post = sequelize.models.Post;
        const Comment = sequelize.models.Comment;
        const JWT_SECRET = "secret";

        app.post("/register", async (req, res) => {

            try {
                const { username, email, password } = req.body;

                if (!username || !email || !password) {

                    return res.status(400).json({ Message: 'Username, email and password are required' })
                }

                const user = await User.findOne({ where: { email: email } });

                if (user !== null) {

                    return res.status(400).json({ Message: 'Account already exists' })
                }

                const newUser = await User.create({
                    username,
                    email,
                    password
                });
                const token = jwt.sign(
                    { userId: newUser.id },
                    JWT_SECRET,
                    { expiresIn: '1h' });

                if (jwt.verify(token, JWT_SECRET)) {
                    console.log(token)
                } else {
                    console.log(error)
                }

                res.cookie('token', token, { httpOnly:true });
                res.json({
                    Message: 'successfully registered',
                    User: newUser
                });


            } catch (error) {
                console.log(error)
                return res.status(400).json({ Message: 'Registration failed, please try again' })
            }
        });

        /*
        app.post("/login", async(req,res)=>{

            
            
        });
        
        app.get();
        app.get();
        
        app.post();
        app.post();
        app.post();
        app.delete();
        app.delete();
        
        */



        app.listen(3000, () => {
            console.log("Serveur démarré sur http://localhost:3000");
        });


    } catch (error) {
        console.error("Error de chargement de Sequelize:", error);
    }
}
main();