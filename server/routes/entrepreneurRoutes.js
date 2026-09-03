const express = require('express')
const { getEntrepreneurs, getEntrepreneur } = require('../controllers/entrepreneurController')
const router = express.Router()
router.get('/', getEntrepreneurs)
router.get('/:id', getEntrepreneur)
module.exports = router
