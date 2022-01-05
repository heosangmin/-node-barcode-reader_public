const LocalStrategy = require('passport-local').Strategy;
const logger = require('../logger');
const {Mssql, pool, poolConnect} = require('../models');

module.exports = (passport) => {
    passport.use(new LocalStrategy({
        usernameField: 'usercode',
        passwordField: 'password',
    }, async (usercode, password, done) => {
        try {
            if (/^[ABDZK]\d{4}$/.test(usercode)){ // check user id

                const branchCode = usercode.charAt(0);
                const userCode = usercode.substring(1,5);
                
                await poolConnect;
                const result = await pool.request()
                .input('branchCode', Mssql.Char, branchCode)
                .input('userCode', Mssql.Char, userCode)
                .query(`sql for user auth`);
                
                if (result.recordset.length === 1) {
                    const exUser = {
                        branchCode: result.recordset[0].branchCode,
                        name: result.recordset[0].userName,
                        id: usercode,
                        password: result.recordset[0].password
                    };
    
                    if (exUser.password === password) {
                        logger.info(`LOGIN : ${exUser.id} ${exUser.name}`);
                        done(null, exUser);
                    } else {
                        done(null, false, {message:'パスワードが正しくありません。'});
                    }
                    
                } else {
                    done(null, false, {message:'入力した社員コードのユーザが存在しません。'});
                }

            } else {
                done(null, false, {message:'社員コードが正しくありません。'});
            }
        } catch (error) {
            logger.error(error);
            done(error);
        }
    }));
};