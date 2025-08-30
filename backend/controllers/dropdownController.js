const asyncHandler = require('express-async-handler');
const Branch = require('../models/Branch');
const Class = require('../models/Class');
const Session = require('../models/Session');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Subject = require('../models/Subject');

// @desc    Get branches for dropdown
// @route   GET /api/dropdowns/branches
// @access  Private
const getBranchesForDropdown = asyncHandler(async (req, res) => {
    // Super Admins see all branches. Other admins are scoped to their own.
    if (req.user.role !== 'Super Admin') {
        const branch = await Branch.findById(req.user.branchId).select('name');
        return res.json(branch ? [branch] : []);
    }
    const branches = await Branch.find({}).select('name');
    res.json(branches);
});

// @desc    Get classes for dropdown, optionally filtered by branch
// @route   GET /api/dropdowns/classes
// @access  Private
const getClassesForDropdown = asyncHandler(async (req, res) => {
    const { user } = req;
    const { branchId } = req.query;
    let query = {};

    if (user.role === 'Teacher') {
        const teacher = await Teacher.findOne({ userId: user._id }).lean();
        if (teacher) {
            query._id = { $in: teacher.classes };
        } else {
            return res.json([]);
        }
    } else if (user.role === 'Super Admin') {
        if (branchId) query.branchId = branchId;
    } else { // Branch Admin
        query.branchId = user.branchId;
    }

    const classes = await Class.find(query).select('name branchId');
    res.json(classes);
});

// @desc    Get subjects for dropdown, filtered by teacher
// @route   GET /api/dropdowns/subjects
// @access  Private
const getSubjectsForDropdown = asyncHandler(async (req, res) => {
    const { user } = req;
    let query = {};

    if (user.role === 'Teacher') {
        const teacher = await Teacher.findOne({ userId: user._id }).lean();
        if (teacher) {
            query._id = { $in: teacher.subjects };
        } else {
            return res.json([]);
        }
    }
    // For other roles, return all subjects.
    const subjects = await Subject.find(query).select('name');
    res.json(subjects);
});


// @desc    Get sessions for dropdown, optionally filtered by branch
// @route   GET /api/dropdowns/sessions
// @access  Private
const getSessionsForDropdown = asyncHandler(async (req, res) => {
    const { user } = req;
    const { branchId } = req.query;
    let query = {};
    let userBranchId = user.branchId;

    if (user.role === 'Super Admin') {
        if (branchId) query = { $or: [{ branchId }, { branchId: null }] };
    } else if (userBranchId) {
        query = { $or: [{ branchId: userBranchId }, { branchId: null }] };
    } else {
        query.branchId = null;
    }

    if (['Student', 'Parent'].includes(user.role)) {
        query.resultPublicationStatus = 'Published';
    }

    const sessions = await Session.find(query).select('academicYear term resultPublicationStatus');
    res.json(sessions);
});

// @desc    Get students for dropdown, filtered by class or branch
// @route   GET /api/dropdowns/students
// @access  Private
const getStudentsForDropdown = asyncHandler(async (req, res) => {
    const { classId, branchId } = req.query;
    let query = {};

    if (classId) {
        query.classId = classId;
    } else if (branchId) {
        query.branchId = branchId;
    } else if (req.user.role === 'Branch Admin') {
        query.branchId = req.user.branchId;
    }
    // Super Admin with no filter gets all students

    const students = await Student.find(query).select('userId admissionNumber').populate('userId', 'name');
    res.json(students);
});


module.exports = {
    getBranchesForDropdown,
    getClassesForDropdown,
    getSubjectsForDropdown,
    getSessionsForDropdown,
    getStudentsForDropdown,
};
