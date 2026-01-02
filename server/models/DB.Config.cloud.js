const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const requiredVars = ['DB_NAME', 'USER', 'PASSWORD', 'HOST'];
requiredVars.forEach(v => {
    if (!process.env[v]) {
        console.warn(`Environment variable ${v} is not set.`);
    }
});

const dialectOptions = {};
const host = process.env.HOST || '';
const useSSL = process.env.DB_USE_SSL === 'true' || host.includes('aivencloud.com') || host.includes('aiven');
if (useSSL) {
    dialectOptions.ssl = {};
    let caContent = null;
    if (process.env.DB_SSL_CA_FILE) {
        try {
            caContent = fs.readFileSync(process.env.DB_SSL_CA_FILE);
            console.log('Using DB_SSL_CA_FILE for DB TLS verification');
        } catch (err) {
            console.warn('Failed to read DB_SSL_CA_FILE:', err.message);
        }
    }

    if (!caContent && process.env.DB_SSL_CA) {
        caContent = Buffer.from(process.env.DB_SSL_CA.replace(/\\n/g, '\n'));
        console.log('Using DB_SSL_CA from environment for DB TLS verification');
    }

    if (!caContent) {
        const defaultCaPath = path.join(__dirname, '..', 'certs', 'ca.pem');
        if (fs.existsSync(defaultCaPath)) {
            try {
                caContent = fs.readFileSync(defaultCaPath);
                console.log('Using CA file from', defaultCaPath);
            } catch (err) {
                console.warn('Failed to read default CA file:', err.message);
            }
        }
    }

    if (caContent) {
        dialectOptions.ssl.ca = caContent;
        dialectOptions.ssl.rejectUnauthorized = true;
        console.log('DB SSL enabled with CA; strict TLS verification is ON');
    } else {
        dialectOptions.ssl.rejectUnauthorized = false;
        console.warn('DB SSL enabled but no CA provided. Connecting without certificate verification. Recommended: add a CA at server/certs/ca.pem or set DB_SSL_CA_FILE.');
    }

    dialectOptions.connectTimeout = parseInt(process.env.DB_CONNECT_TIMEOUT, 10) || 10000;
}

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
        dialectOptions,
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
        await model.sync({ alter: true });
        console.log('Database synced');
    } catch (err) {
        console.error('Database setup failed:', err);
    }
})();

module.exports = model;