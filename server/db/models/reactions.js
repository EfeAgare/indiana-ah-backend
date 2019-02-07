export default (sequelize, DataTypes) => {
  const Reactions = sequelize.define(
    'Reactions',
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      articleId: {
        type: DataTypes.UUID,
        references: {
          model: 'Articles',
          key: 'id',
          as: 'articleId'
        }
      },
      userId: {
        type: DataTypes.UUID,
        references: {
          model: 'Users',
          key: 'id',
          as: 'userId'
        }
      },
      reactionType: {
        type: DataTypes.STRING
      }
    },
    {}
  );
  Reactions.associate = ({ Users, Articles }) => {
    Reactions.belongsTo(Users, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });
    Reactions.belongsTo(Articles, {
      foreignKey: 'articleId',
      onDelete: 'CASCADE'
    });
  };
  return Reactions;
};