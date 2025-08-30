const asyncHandler = require('express-async-handler');
const Branch = require('../models/Branch');
const Class = require('../models/Class');
const Session = require('../models/Session');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Parent = require('../models/Parent');

// @desc    Get branches for dropdown
// @route   GET /api/dropdowns/branches
// @access  Private (Super Admin)
const getBranchesForDropdown = asyncHandler(async (req, res) => {
    // This endpoint is primarily for Super Admins to filter by branch.
    // Other roles are automatically scoped to their branch.
    if (req.user.role !== 'Super Admin') {
        // Return the user's own branch if they are not a super admin
        const branch = await Branch.findById(req.user.branchId).select('name');
        return res.json(branch ? [branch] : []);
    }
    const branches = await Branch.find({}).select('name');
    res.json(branches);
});

// @desc    Get classes for dropdown
// @route   GET /api/dropdowns/classes
// @access  Private
const getClassesForDropdown = asyncHandler(async (req, res) => {
    const { user } = req;
    const { branchId } = req.query;
    let query = {};

    if (user.role === 'Super Admin') {
        if (branchId) {
            query.branchId = branchId;
        }
        // If no branchId, Super Admin gets all classes.
    } else if (user.role === 'Branch Admin') {
        query.branchId = user.branchId;
    } else if (user.role === 'Teacher') {
        const teacher = await Teacher.findOne({ userId: user._id }).lean();
        if (teacher) {
            query._id = { $in: teacher.classes };
        } else {
            return res.json([]); // Teacher not found or not assigned to any class
        }
    }

    const classes = await Class.find(query).select('name branchId');
    res.json(classes);
});

// @desc    Get sessions for dropdown
// @route   GET /api/dropdowns/sessions
// @access  Private
const getSessionsForDropdown = asyncHandler(async (req, res) => {
    const { user } = req;
    const { branchId } = req.query; // For Super Admin filtering
    let query = {};
    let userBranchId = user.branchId;

    // For roles like Student or Parent, we may need to find their branch first
    if (!userBranchId && user.role === 'Student') {
        const student = await Student.findOne({ userId: user._id }).lean();
        if (student) userBranchId = student.branchId;
    } else if (!userBranchId && user.role === 'Parent') {
        const parent = await Parent.findOne({ userId: user._id }).populate('students');
        if (parent && parent.students.length > 0) {
            // Assuming all children are in the same branch for simplicity
            userBranchId = parent.students[0].branchId;
        }
    }

    if (user.role === 'Super Admin') {
        if (branchId) {
            query = { $or: [{ branchId }, { branchId: null }] };
        }
        // If no branchId, get all sessions
    } else if (userBranchId) {
        query = { $or: [{ branchId: userBranchId }, { branchId: null }] };
    } else {
        // Default to only global sessions if no branch context
        query.branchId = null;
    }

    // For students/parents, only show published sessions
    if (['Student', 'Parent'].includes(user.role)) {
        query.resultPublicationStatus = 'Published';
    }

    const sessions = await Session.find(query).select('academicYear term');
    res.json(sessions);
});


module.exports = {
    getBranchesForDropdown,
    getClassesForDropdown,
    getSessionsForDropdown,
};
