const express = require('express');
const router = express.Router();
const {
    getBranchesForDropdown,
    getClassesForDropdown,
    getSessionsForDropdown,
} = require('../controllers/dropdownController');
const { protect } = require('../middleware/authMiddleware'); // Assuming this middleware exists

// You may want to add more specific role-based authorization middleware here
// For example: authorize('Super Admin') for the branches endpoint.

router.route('/branches').get(protect, getBranchesForDropdown);
router.route('/classes').get(protect, getClassesForDropdown);
router.route('/sessions').get(protect, getSessionsForDropdown);

module.exports = router;
