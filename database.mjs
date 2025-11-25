import { Sequelize, DataTypes } from "sequelize";
import bcrypt from "bcrypt";

/**
 * 
 * @returns {Promise<Sequelize>}
 */
export async function loadSequelize() {

    try {
        const db_name = process.env.DB_NAME;
        const db_user = process.env.DB_USER;
        const db_password = process.env.DB_PASSWORD;
        const db_host = process.env.DB_HOST;
        const sequelize = new Sequelize(
            db_name,
            db_user,
            db_password,
            
            {
                db_host,
                dialect: 'mysql'
            }

        );

        // ...
        sequelize.define("User",
            {
                username: DataTypes.STRING,

                email: {
                    type: DataTypes.STRING,
                    unique: true,
                    validate: {
                        isEmail: true,

                    }
                },

                password: {

                    type: DataTypes.STRING,

                    set(clearPassword) {

                        const hashPassword = bcrypt.hashSync(clearPassword, 10);
                        this.setDataValue('password', hashPassword);
                    }

                }

            });

        sequelize.define("Post",
            {
                title: DataTypes.STRING,
                content: DataTypes.STRING,
            });

        sequelize.define("Comment",
            {
                content: DataTypes.STRING
            });
            
            
            const User = sequelize.models.User;
            const Post = sequelize.models.Post;
            const Comment = sequelize.models.Comment;
            
            User.hasMany(Post,
                {
                    onDelete : 'cascade'
                }
            );
            Post.belongsTo(User);
            
            User.hasMany(Comment,
                {
                    onDelete : 'cascade'
                }
            );
            Comment.belongsTo(User);
            
            Post.hasMany(Comment,
                {
                    onDelete: 'cascade'
                }
            );
            Comment.belongsTo(Post);
            
            await sequelize.sync({force:true});

        return sequelize;

    } catch (error) {

        console.error(error);
        throw Error("Échec du chargement de Sequelize");
    };

}