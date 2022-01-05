const Mssql = require('mssql');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const mssqlConfig = {
    user: config.mssql_username,
    password: config.mssql_password,
    server: config.mssql_hostname,
    database: config.mssql_database,
    requestTimeout: 60000,
    pool: {
        max: 100,
        min: 0
    }
};
const pool = new Mssql.ConnectionPool(mssqlConfig);
const poolConnect = pool.connect();
pool.on('error', err => {
    logger.error(err);
});

module.exports = {Mssql, pool, poolConnect};