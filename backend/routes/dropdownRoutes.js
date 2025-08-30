const express = require('express');
const router = express.Router();
const {
    getBranchesForDropdown,
    getClassesForDropdown,
    getSubjectsForDropdown,
    getSessionsForDropdown,
    getStudentsForDropdown,
} = require('../controllers/dropdownController');
const { protect } = require('../middleware/authMiddleware'); // Assuming this middleware exists

router.route('/branches').get(protect, getBranchesForDropdown);
router.route('/classes').get(protect, getClassesForDropdown);
router.route('/subjects').get(protect, getSubjectsForDropdown);
router.route('/sessions').get(protect, getSessionsForDropdown);
router.route('/students').get(protect, getStudentsForDropdown);

module.exports = router;
