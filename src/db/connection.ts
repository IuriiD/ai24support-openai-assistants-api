import { Sequelize } from 'sequelize-typescript';
import { config } from '../config';
import { Conversation, User, Customer, Thread } from './models';

const { POSTGRESQL_CONNECTION_STRING } = config;
const sequelizeConnection = new Sequelize(POSTGRESQL_CONNECTION_STRING, {
  dialect: 'postgres',
  models: [Conversation, User, Customer, Thread],
});

export default sequelizeConnection;
