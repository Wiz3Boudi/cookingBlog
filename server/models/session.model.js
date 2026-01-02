const connection = require('./DB.Config.cloud');
const session  = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const sessionStore = new SequelizeStore({
    db: connection,
    tableName: 'sessions',
    checkExpirationInterval: 15 * 60 * 1000, 
    expiration: 24 * 60 * 60 * 1000 
});


sessionStore.sync().then().catch(err => {
    console.error('Failed to setup sessions table:', err.message);
});

module.exports  = sessionStore