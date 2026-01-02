const { Sequelize } = require('sequelize');

// Check presence of required environment variables (do not print secrets)
const requiredVars = ['DB_NAME', 'USER', 'PASSWORD', 'HOST'];
requiredVars.forEach(v => {
    if (!process.env[v]) {
        console.warn(`Environment variable ${v} is not set.`);
    }
});

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
        dialectOptions: (() => {
            const opts = {};
            const host = process.env.HOST || '';
            if (process.env.DB_USE_SSL === 'true' || host.includes('aivencloud.com') || host.includes('aiven')) {
                opts.ssl = { rejectUnauthorized: false };
            }
            return opts;
        })(),
    }
);

model.authenticate()
    .then(() => console.log('Connected to MySQL database!'))
    .catch(error => {
        console.error('Database connection failed:');
        console.error(error);
    });
module.exports = model;