const {Mssql, pool, poolConnect} = require('./index');
const logger = require('../logger');

const funcs = {
    
    getCartonInfo: async (barcode1,barcode2) => {
        try {
            await poolConnect;
            const result = await pool.request()
            .input('barcode1', Mssql.Char, barcode1)
            .query(`sql for getting barcode info`);
            return result;
        } catch (error) {
            throw error;
        }
    },
    updateScanDatetime1: async (barcode1, userId) => {
        await poolConnect;
        try {
            const result = await pool.request()
            .input('userId', Mssql.Char, userId)
            .input('barcode1', Mssql.Char, barcode1)
            .query(`sql for updating datetime1`);
            return result;
        } catch (error) {
            throw error;
        }
    },
    updateScanDatetime2: async (barcode1,barcode2,userId) => {
        try {
            await poolConnect;
            const result = await pool.request()
            .input('userId', Mssql.Char, userId)
            .input('barcode1', Mssql.Char, barcode1)
            .input('barcode2', Mssql.VarChar, barcode2)
            .query(`sql for updating datetime2`);
            return result;
        } catch (error) {
            throw error;
        }
    },
    updateScanDatetime3: async (barcode1,barcode2,barcode3,userId) => {
        try {
            await poolConnect;
            const result = await pool.request()
            .input('userId',Mssql.Char, userId)
            .input('barcode1', Mssql.Char, barcode1)
            .input('barcode2', Mssql.VarChar, barcode2)
            .input('barcode3', Mssql.Char, barcode3)
            .query(`sql for updating datetime3`);
            return result;
        } catch (error) {
            throw error;
        }
    },
    getReqList: async (reqDemandDate) => {
        try {
            const sql = `sql for getting req list`;

            await poolConnect;
            const result = await pool.request()
            .input('reqDemandDate', Mssql.Char, reqDemandDate)
            .query(sql);
            return result;
        } catch (error) {
            throw error;
        }
    },
    getReqInfo: async (reqType, reqDate, reqId) => {
        try {
            await poolConnect;
            const result = await pool.request()
            .input('reqType', Mssql.Char, reqType)
            .input('reqDate', Mssql.Char, reqDate)
            .input('reqId', Mssql.Char, reqId)
            .query(`sql for getting req info`);
            return result;
        } catch (error) {
            throw error;
        }
    },
    uploadReqCarton: async (reqType, reqDate, reqId, branchCode, userId) => {
        try {
            await poolConnect;
            const result = await pool.request()
            .input('reqType', Mssql.Char(2), reqType)
            .input('reqDate', Mssql.Char(8), reqDate)
            .input('reqId', Mssql.Char(4), reqId)
            .input('branchCode', Mssql.Char(1), branchCode)
            .input('userId', Mssql.Char(4), userId)
            .query(`sql for upload req carton`);
            return result;
        } catch (error) {console.log(error);
            throw error;
        }
    },
    existsBarcode: async (barcode3) => {
        try {
            await poolConnect;
            const result = await pool.request()
            .input('barcode3', Mssql.Char(9), barcode3)
            .query(`sql for checking barcode`);
            return result;
        } catch (error) {console.log(error);
            throw error;
        }
    },
};

module.exports = funcs;