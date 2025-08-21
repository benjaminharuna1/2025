const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'School Management System API',
    version: '1.0.0',
    description: 'API documentation for the School Management System.',
  },
  servers: [{ url: 'http://localhost:3000/api', description: 'Development server' }],
  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'jwt' },
    },
  },
  security: [{ cookieAuth: [] }],
  tags: [
    { name: 'Authentication', description: 'User authentication and registration' },
    { name: 'Users', description: 'User management' },
    { name: 'Admins', description: 'Admin user management' },
    { name: 'Branches', description: 'Branch management' },
    { name: 'Class Levels', description: 'Class level management' },
    { name: 'Classes', description: 'Class management' },
    { name: 'Subjects', description: 'Subject management' },
    { name: 'Students', description: 'Student management' },
    { name: 'Teachers', description: 'Teacher management' },
    { name: 'Parents', description: 'Parent management' },
    { name: 'Fee Structures', description: 'Fee structure management' },
    { name: 'Fee Payments', description: 'Fee payment management' },
    { name: 'Attendance', description: 'Attendance management' },
    { name: 'Results', description: 'Result management' },
    { name: 'Announcements', description: 'Announcement management' },
    { name: 'Reports', description: 'Report generation' },
  ],
  paths: {
    // Auth
    '/auth/login': { post: { tags: ['Authentication'], summary: 'Authenticate user', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } } }, responses: { '200': {}, '401': {} } } },
    '/auth/logout': { post: { tags: ['Authentication'], summary: 'Logout user', responses: { '200': {} } } },
    '/auth/register/parent': { post: { tags: ['Authentication'], summary: 'Register a new parent', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' } } } } } }, responses: { '201': {}, '400': {} } } },
    '/auth/me': { get: { tags: ['Authentication'], summary: "Get current user's profile", security: [{ cookieAuth: [] }], responses: { '200': {}, '401': {} } } },
    // Users
    '/users': {
      post: { tags: ['Users'], summary: 'Create a new user', security: [{ cookieAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' }, role: { type: 'string' }, branchId: { type: 'string' } } } } } }, responses: { '201': {}, '400': {}, '403': {} } },
      get: { tags: ['Users'], summary: 'Get all users', security: [{ cookieAuth: [] }], responses: { '200': {} } },
    },
    '/users/{id}': {
        get: { tags: ['Users'], summary: 'Get a user by ID', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': {}, '404': {} } },
        put: { tags: ['Users'], summary: 'Update a user', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, role: { type: 'string' } } } } } }, responses: { '200': {}, '404': {} } },
        delete: { tags: ['Users'], summary: 'Delete a user', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': {}, '403': {}, '404': {} } },
    },
    '/users/update-password': { put: { tags: ['Users'], summary: 'Update user password', security: [{ cookieAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string' } } } } } }, responses: { '200': {}, '401': {} } } },
    '/users/profile-picture': { put: { tags: ['Users'], summary: 'Upload profile picture', security: [{ cookieAuth: [] }], requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { profilePicture: { type: 'string', format: 'binary' } } } } } }, responses: { '200': {}, '400': {} } } },
    // Admins
    '/admins': {
        post: { tags: ['Admins'], summary: 'Create a new admin user', security: [{ cookieAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' }, role: { type: 'string', enum: ['Super Admin', 'Branch Admin'] }, branchId: { type: 'string' } } } } } }, responses: { '201': {}, '400': {}, '403': {} } },
        get: { tags: ['Admins'], summary: 'Get all admin users', security: [{ cookieAuth: [] }], responses: { '200': {} } },
    },
    '/admins/{id}': {
        get: { tags: ['Admins'], summary: 'Get an admin by ID', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': {}, '404': {} } },
        put: { tags: ['Admins'], summary: 'Update an admin user', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, role: { type: 'string', enum: ['Super Admin', 'Branch Admin'] } } } } } }, responses: { '200': {}, '404': {} } },
        delete: { tags: ['Admins'], summary: 'Delete an admin user', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': {}, '404': {} } },
    },
    // Students
    '/students': {
        get: { tags: ['Students'], summary: 'Get all students', security: [{ cookieAuth: [] }], responses: { '200': {} } },
    },
    '/students/{id}': {
        get: { tags: ['Students'], summary: 'Get a student by ID', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': {}, '404': {} } },
        put: { tags: ['Students'], summary: 'Update a student profile', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { classId: { type: 'string' }, dateOfBirth: { type: 'string' }, admissionNumber: { type: 'string' }, gender: { type: 'string' }, phoneNumber: { type: 'string' }, address: { type: 'string' }, bloodGroup: { type: 'string' }, sponsor: { type: 'string' }, branchId: { type: 'string' } } } } } }, responses: { '200': {}, '404': {} } },
    },
    // Teachers
    '/teachers': {
        get: { tags: ['Teachers'], summary: 'Get all teachers', security: [{ cookieAuth: [] }], responses: { '200': {} } },
    },
    '/teachers/{id}': {
        get: { tags: ['Teachers'], summary: 'Get a teacher by ID', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': {}, '404': {} } },
        put: { tags: ['Teachers'], summary: 'Update a teacher profile', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { classes: { type: 'array' }, subjects: { type: 'array' }, gender: { type: 'string' }, phoneNumber: { type: 'string' } } } } } }, responses: { '200': {}, '404': {} } },
    },
    // Parents
    '/parents': {
        get: { tags: ['Parents'], summary: 'Get all parents', security: [{ cookieAuth: [] }], responses: { '200': {} } },
    },
    '/parents/{id}': {
        get: { tags: ['Parents'], summary: 'Get a parent by ID', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': {}, '404': {} } },
        put: { tags: ['Parents'], summary: 'Update a parent profile', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { gender: { type: 'string' }, phoneNumber: { type: 'string' } } } } } }, responses: { '200': {}, '404': {} } },
    },
    '/parents/{id}/link': {
        put: { tags: ['Parents'], summary: 'Link a student to a parent', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { studentId: { type: 'string' } } } } } }, responses: { '200': {}, '404': {} } },
    },
    '/parents/{id}/unlink': {
        put: { tags: ['Parents'], summary: 'Unlink a student from a parent', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { studentId: { type: 'string' } } } } } }, responses: { '200': {}, '404': {} } },
    },
    // ... other paths from the user's last message
  },
};

const options = {
  swaggerDefinition,
  apis: [], // No longer scanning files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
