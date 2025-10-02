import sequelize from './database/sequelize';
import { initUserModel } from './database/models';
import { User } from './database/operations';

initUserModel(sequelize);

async function testDbConnection() {
  try {
    await sequelize.authenticate();
    console.log('Sequelize connection authenticated.');

    const user = await User.findOne({ where: { email: 'admin@shopzone.com' } });
    if (user) {
      console.log('Database connection successful. User found:', user.email);
    } else {
      console.log('Database connection successful but user not found.');
    }
  } catch (error) {
    console.error('Database connection failed:', error);
  }
  process.exit(0);
}

testDbConnection();
