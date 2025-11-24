import { Sequelize, DataTypes } from "sequelize";
import bcrypt from "bcrypt";

/**
 * 
 * @returns {Promise<Sequelize>}
 */
export async function loadSequelize() {

    try {
        const sequelize = new Sequelize(
            'api-tread',
            'root',
            'root',
            {
                host: '127.0.0.1',
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
            
            User.hasMany(Post);
            Post.belongsTo(User);
            
            User.hasMany(Comment);
            Comment.belongsTo(User);
            
            Post.hasMany(Comment);
            Comment.belongsTo(Post);
            
            await sequelize.sync({force:true});

        return sequelize;

    } catch (error) {

        console.error(error);
        throw Error("Échec du chargement de Sequelize");
    };

}