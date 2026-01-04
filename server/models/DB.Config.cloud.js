const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const model = new Sequelize(
    process.env.DB_NAME,
    process.env.USER,
    process.env.PASSWORD,
    {
        host: process.env.HOST,
        port: process.env.DB_PORT || 16407,
        dialect: 'mysql',
        dialectModule: require('mysql2'),
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: process.env.NODE_ENV === 'production',
                ca: process.env.DB_SSL_CA_FILE_PATH ?
                    fs.readFileSync(path.resolve(process.env.DB_SSL_CA_FILE_PATH)) :
                    undefined
            }
        },
        pool: {
            acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
            idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000
        }
    }
);
async function tryConnect(retries = 5, delay = 1000) {
    let attempt = 0;
    while (attempt < retries) {
        try {
            await model.authenticate();
            console.log('Connected to MySQL database!');
            return;
        } catch (err) {
            attempt += 1;
            console.error(`DB connect attempt ${attempt} failed:`, err && err.message ? err.message : err);
            if (attempt >= retries) throw err;
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
        }
    }
}

(async () => {
    try {
        await tryConnect(parseInt(process.env.DB_CONNECT_RETRIES, 10) || 5, parseInt(process.env.DB_CONNECT_RETRY_DELAY, 10) || 1000);
        await model.sync();
        console.log('Database synced');
    } catch (err) {
        console.error('Database setup failed:', err);
    }
})();

module.exports = model;