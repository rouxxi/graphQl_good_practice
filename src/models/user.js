const user = (sequelize, DataTypes) => {
    // Création de la table user
    const User = sequelize.define('user', {
    // Cette table contient un champ username
        username: {
            type: DataTypes.STRING,
        }
    });

    // // je définit la relationde la table user avec message
    User.associate = models => {
        User.hasMany(models.Message, {onDelete: 'CASCADE'});
    }

    return User
}

export default user;