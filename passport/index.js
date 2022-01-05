const local = require('./localStrategy');
const {Mssql, pool, poolConnect} = require('../models');

module.exports = (passport) => {

    passport.serializeUser((user,done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id,done) => {
        try {
            const branchCode = id.charAt(0);
            const userCode = id.substring(1,5);

            await poolConnect;
            
            const result = await pool.request()
            .input('branchCode', Mssql.Char, branchCode)
            .input('userCode', Mssql.Char, userCode)
            .query(`sql for user auth`);
                
            if (result.recordset.length === 1) {
                const user = {
                    name: result.recordset[0].userName,
                    branchCode: result.recordset[0].branchCode,
                    id: result.recordset[0].userCode
                };
                done(null, user);
            } else {
                const err = new Error();
                err.message = 'wrong user id';
                done(err);
            }
            
        } catch (error) {
            logger.error(error);
        }
    });

    local(passport);
};
