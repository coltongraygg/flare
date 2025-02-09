import Sequelize from 'sequelize';
import database from '../index';

const User = database.define('User', {
  username: { type: Sequelize.STRING(20) },
  email: { type: Sequelize.STRING },
  full_name: { type: Sequelize.STRING },
  phone_number: { type: Sequelize.STRING(10) },
  tasks_completed: { type: Sequelize.INTEGER },
  events_attended: { type: Sequelize.INTEGER },
  location: { type: Sequelize.STRING },
  avatar_id: { type: Sequelize.INTEGER },
  avatar_shirt: { type: Sequelize.STRING },
  avatar_pants: { type: Sequelize.STRING },
});

export default User;
