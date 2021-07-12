import bcrypt from 'bcrypt';

const user = (sequelize, DataTypes) => {
    // Création de la table user
    const User = sequelize.define('user', {
    // Cette table contient un champ username
        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
              notEmpty: true,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
              notEmpty: true,
              isEmail: true,
            },
          },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { //conditions pour valiter une nouvelle données
              notEmpty: true,
              len: [7, 42], // définit la longueur de la string
            },
          },
        role: {
            type: DataTypes.STRING,
         },
    }
    });

    User.beforeCreate( async user => {
        user.password = await user.generatePasswordHash();
    });

    // il est possible aussi de passer le password en paramètre de la fonction
    User.prototype.generatePasswordHash = async function() { // le .prototype permet de conservé l'instance et d'utiliser le 'this.'
        const saltRounds = 10; // paramètre qui féfinit la puissance du cryptage => en moyenne c'est entre 10 et 12
        return await bcrypt.hash(this.password, saltRounds)
    }

    User.prototype.validatePassword = async function(password) {
        return await bcrypt.compare(password, this.password);
      };

    // // je définit la relationde la table user avec message
    User.associate = models => {
        User.hasMany(models.Message, {onDelete: 'CASCADE'});
    }

    User.findByLogin = async login => {
        let userSeek = await  User.findOne({
            where: { username: login},
        });

        // if(!userSeek) {
        //     userSeek = await User.findOne({
        //         where: {
        //             email: login
        //         }
        //     });
        // }
        return userSeek
    }

    return User
}

export default user;