import Sequelize, { Model } from 'sequelize';

class Delivery_problems extends Model {
    static init(sequelize) {
        super.init(
            {
                delivery_id: Sequelize.INTEGER,
                description: Sequelize.STRING,
            },
            {
                sequelize,
            }
        );

        return this;
    }

    static associate(models) {
        this.belongsTo(models.Order, {
            foreignKey: 'delivery_id',
            as: 'orders',
        });
    }
}

export default Delivery_problems;
