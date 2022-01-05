const express = require('express');
const cors = require('cors');
const CartonInfo = require('../models/cartonInfo');
const { isLoggedIn, isNotLoggedIn } = require('./middleware');
const pageTitle = 'バーコード参照ツール';
const logger = require('../logger');
const router = express.Router();
const moment = require('moment');
router.use(cors());

// 「ログイン」画面
router.get('/', (req, res, next) => {
    res.render('index', {
        title: pageTitle,
        loginError: req.flash('loginError')
    });
});

// 「スキャン」画面
router.get('/scan', isLoggedIn, (req, res, next) => {
    res.render('scan', {
        title: pageTitle,
        user: req.user,
        env: req.app.get('env')
    });
});

// 顧客管理番号スキャン
// １次スキャン作業：入力バーコードをキーとする情報を返却する。
router.get('/barcode1/:barcode1', async (req, res, next) => {
    try {
        let cartonInfo = await CartonInfo.getCartonInfo(req.params.barcode1);
        if (cartonInfo.recordset.length > 0) {
            await CartonInfo.updateScanDatetime1(req.params.barcode1, req.user.branchCode + req.user.id);
        }
        cartonInfo = await CartonInfo.getCartonInfo(req.params.barcode1);
        res.json(cartonInfo);
        logger.info(`${req.user.branchCode},${req.user.id},SCAN,BARCODE1,${req.params.barcode1}`);
    } catch (error) {
        logger.error(error);
    }
});

// 保管箱番号
// ２次スキャン作業：入力バーコードのレコードを更新する。
router.put('/barcode2/:barcode2', async (req, res, next) => {
    try {
        await CartonInfo.updateScanDatetime2(req.body.barcode1, req.params.barcode2, req.user.branchCode + req.user.id);
        const cartonInfo = await CartonInfo.getCartonInfo(req.body.barcode1);
        res.json(cartonInfo);
        logger.info(`${req.user.branchCode},${req.user.id},SCAN,BARCODE2,${req.body.barcode1},${req.params.barcode2}`);
    } catch (error) {
        logger.error(error);
    }
});

// 箱バーコード
// ３次スキャン作業：入力バーコード（箱バーコード）を登録する。
router.put('/barcode3/:barcode1', async (req, res, next) => {
    try {
        if (req.body.barcode3 && /^\d{9}$/.test(req.body.barcode3)) {
            const existsBarcode = await CartonInfo.existsBarcode(req.body.barcode3);
            if (existsBarcode.recordset.length > 0 && existsBarcode.recordset[0].F_顧客管理番号 !== req.params.barcode1) {
                res.json({
                    error: 'duplicated',
                    cartonInfo: existsBarcode.recordset
                });
                logger.error('Barcode error : duplicated barcode');
            } else {
                await CartonInfo.updateScanDatetime3(req.body.barcode1, req.body.barcode2, req.body.barcode3, req.user.branchCode + req.user.id);
                const cartonInfo = await CartonInfo.getCartonInfo(req.body.barcode1);
                res.json(cartonInfo);
                logger.info(`${req.user.branchCode},${req.user.id},SCAN,BARCODE3,${req.body.barcode1},${req.body.barcode2},${req.body.barcode3}`);
            }
        } else {
            logger.error('Barcode error : not exists or wrong type');
            res.json({});
        }
    } catch (error) {
        logger.error(error);
    }
});

// 「アップロード」画面
router.get('/list', isLoggedIn, async (req, res, next) => {
    try {
        const today = moment().format('YYYY/MM/DD');
        const reqList = await CartonInfo.getReqList(today);
        res.render('list', {
            title: pageTitle,
            user: req.user,
            reqList: reqList.recordset,
            reqDemandDate: moment().format('YYYY/MM/DD'),
            env: req.app.get('env')
        });
        logger.info(`${req.user.branchCode},${req.user.id},LIST,REQLIST,${reqList.recordset.length}`);
    } catch (error) {
        logger.error(error);
        console.error(error);
    }
});

// 「アップロード」画面 with 希望日
router.post('/list', isLoggedIn, async (req, res, next) => {
    try {
        const reqDemandDate = req.body.reqDemandDate;
        const reqList = await CartonInfo.getReqList(reqDemandDate);
        res.json(reqList.recordset);
        logger.info(`${req.user.branchCode},${req.user.id},LIST,REQLIST,${reqDemandDate},${reqList.recordset.length}`);
    } catch (error) {
        logger.error(error);
        console.error(error);
    }
});

// 依頼情報取得
router.get('/list/:req', async (req, res, next) => {
    try {
        if (!/^\d{14}$/.test(req.params.req)){
            res.json({});
            return;
        }
        const reqType = req.params.req.substring(0,2),
              reqDate = req.params.req.substring(2,10),
              reqId = req.params.req.substring(10,14);
        const reqInfo = await CartonInfo.getReqInfo(reqType, reqDate, reqId, req.body.isCheckedReqDone);
        res.json(reqInfo.recordset);
        logger.info(`${req.user.branchCode},${req.user.id},LIST,REQINFO,${req.params.req},${reqInfo.recordset.length}`);
    } catch (error) {
        logger.error(error);
    }
});

// アップロード
router.post('/list/upload/', async (req, res, next) => {
    try {
        if (!/^\d{14}$/.test(req.body.req)){
            res.json({});
            next();
        }
        const reqType = req.body.req.substring(0,2),
              reqDate = req.body.req.substring(2,10),
              reqId = req.body.req.substring(10,14);
        const result = await CartonInfo.uploadReqCarton(reqType, reqDate, reqId, req.user.branchCode, req.user.id);
        res.json(result.recordsets);
        logger.info(`${req.user.branchCode},${req.user.id},LIST,UPLOAD,${req.body.req}`);
    } catch (error) {
        logger.error(error);
        console.error(error);
    }
});

// 「テストバーコード作成」画面
router.get('/devbarcode', isLoggedIn, (req, res, next) => {
    res.render('devbarcode', {
        title: pageTitle,
        user: req.user,
        env: req.app.get('env')
    });
});

module.exports = router;