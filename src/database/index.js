import Sequelize from 'sequelize';

// Models
import User from '../app/models/User';
import Recipient from '../app/models/Recipient';
import File from '../app/models/File';
import Deliveryman from '../app/models/Deliveryman';
import Order from '../app/models/Order';
import Problem from '../app/models/Problem';

import databaseConfig from '../config/database';

// Models array
const models = [User, Recipient, File, Deliveryman, Order, Problem];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map((model) => model.init(this.connection))
      .map(
        (model) => model.associate && model.associate(this.connection.models)
      );
  }
}

export default new Database();
