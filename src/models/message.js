const message = (sequelize, DataTypes) => {
    // Création de la table message
    const Message = sequelize.define('message', {
    // La table message ne contient qu'un seul champ text    
    text: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
    });

    // je définit la relationde la table message avec user
    Message.associate = models => {
        Message.belongsTo(models.User);
      };

    return Message;
}

export default message;