const express = require('express');
const router = express.Router();
const db = require('../models/DB.Config.cloud');

router.get('/', async (req, res) => {
    try {
        await db.authenticate();
        return res.json({ ok: true, db: 'connected' });
    } catch (err) {
        return res.status(503).json({ ok: false, error: err.message });
    }
});

module.exports = router;
