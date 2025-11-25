import { loadSequelize } from "./database.mjs";
import express, { urlencoded } from "express";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { verifyTokenJWT } from './node_modules/middleware/verifyTokenJWT.mjs';




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
        
        const User = sequelize.models.User;
        const Post = sequelize.models.Post;
        const Comment = sequelize.models.Comment;
    
        const JWT_SECRET = process.env.JWT_SECRET;

        //----------------------------------------- PUBLIC------------------------------------------------------//
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

                res.json({
                    Message: 'successfully registered',
                    User: newUser
                });


            } catch (error) {
                console.log(error)
                return res.status(400).json({ Message: 'Registration failed, please try again' })
            }
        });

        app.post("/login", async (req, res) => {

            try {
                const { email, password } = req.body;

                if (!email || !password) {

                    return res.status(400).json({ Message: 'Email and password are required' })
                }

                const user = await User.findOne({ where: { email: email } });

                if (!user) {

                    return res.status(400).json({ Message: 'Account don\'t exists' })
                }

                if (!bcrypt.compareSync(password, user.password)) {

                    return res.status(400).json({ Message: 'Incorrect password' })
                }
                 
                const token = jwt.sign(
                    { 
                        userId: user.id,
                        admin:true,
                    },
                    JWT_SECRET,
                    { expiresIn: '1h' });

                res.cookie('token', token, { httpOnly: true });
                res.json({
                    Message: 'successfully logged in',
                    User: user
                });
            
            } catch (error) {
                console.log(error)
                return res.status(400).json({ Message: 'Log in failed, please try again' })
            }

        });

        app.get("/posts", async (req, res) => {

            try {

                const allPosts = await Post.findAll({include:Comment });
                if(!allPosts){
                    return res.status(400).json({ Message: 'No posts to show!' })
                }
                
                res.json({
                    Post: allPosts
                });
            
            } catch (error) {

                console.log(error);
                return res.status(400).json({ Message: 'Any post to show!' })
            }

        });

        app.get("/users/:userid/:posts", async (req, res) => {

            try {

                const postUser = await Post.findAll({ where: { id: req.params.userid }, include:Comment  });

                console.log(postUser);

                if(!postUser){
                    
                    return res.status(400).json({ Message: 'Posts not find!' })
                }

                res.json({
                    Post: postUser
                });


            } catch (error) {
                console.log(error);
                return res.status(400).json({ Message: 'Posts not find!' })
            }

        });

        app.use(verifyTokenJWT(User));

        //-------------------------------------------------------------------PRIVATE------------------------------------------------------//

        app.post("/posts", async (req, res) => {

            try {
                const newPostData = req.body;

                const newPost = await Post.create({
                    title: newPostData.title,
                    content: newPostData.content,
                    UserId: req.userId
                });

                res.json({
                    Message: "Posted!",
                    Post: newPost
                })
                
            } catch (error) {
                console.log(error);
                res.status(500).json({ Message: 'Error, try again!' })
            }

        });
         
        app.post("/posts/:postID", async (req, res) => {

            try {

                const commentData = req.body;
                const newComment = await Comment.create({
                    content: commentData.comment,
                    PostId: req.params.postID,
                    UserId: req.userId

                });

                res.json({
                    Message: 'Comment add',
                    Comment: newComment
                })

            } catch (error) {
                console.log(error);
                res.status(500).json({ Message: 'Error, try again!' })
            }
        });
         
        app.delete("/posts/:postId", async (req, res) => {

            try {
                const isAdmin = req.admin;
                const post = await Post.findOne({ where: { Id: req.params.postId }, include:Comment })
                
                if(!post){

                    return res.status(400).json({ Message: 'The post doesn\'t exist' })

                }
                
                if(!isAdmin){
                    
                    return res.status(400).json({ Message: 'Unauthorized action' })
                }

                if(post.UserId !== req.userId){
                    
                    return res.status(400).json({ Message: 'Unauthorized action' })
                }
                
                await post.destroy();

                res.json({ Message: 'Post deleted !' })

            } catch (error) {
                
                console.log(error);
                res.status(500).json({ Message: 'Error try again' })
            }
        });

        app.delete("/comments/:commentId", async (req, res) => {

            try {
                
                const isAdmin = req.admin;
                const comment = await Comment.findOne({ where: { Id: req.params.commentId } });
                
                if (!comment) {
                    
                    return res.status(400).json({ Message: 'There is not comment for this post' })
                }

                if(!isAdmin){
                    
                    return res.status(400).json({ Message: 'Unauthorized action' })
                }

                if(comment.UserId !== req.userId){
                    
                    return res.status(400).json({ Message: 'Unauthorized action' })
                }
                
                await comment.destroy();

                res.json({ Message: 'Comment deleted !' })
            
            } catch (error) {

                console.log(error);
                res.status(500).json({ Message: 'Error try again later!' });

            }
        });

        app.post("/logout", (req, res) => {
            try {
        
                res.clearCookie('token');
                res.json({ Message: 'Logout succesfully!' })
            } catch (error) {
                console.log(error);
                res.status(400).json({ Message: 'Error, try again!' })
            }
        });

        app.listen(3000, () => {
           
            console.log("Serveur démarré sur http://localhost:3000");
       
        });
    
    } catch (error) {
        console.error("Error de chargement de Sequelize:", error);
    }
}
main();