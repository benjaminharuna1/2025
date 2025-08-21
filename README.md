# Single-School Multi-Branch School Management System Backend

This document provides a comprehensive guide for frontend developers building an application on top of the School Management System API.

---

## Core Architectural Concept: User vs. Profile

To work effectively with this API, it is crucial to understand the distinction between a **User** and a **Profile**.

-   **`User` Model:** This is the central model for authentication. It stores the `name`, `email`, `password`, and `role` for every individual in the system. Every person has exactly one `User` document.

-   **`Profile` Models:** These models store role-specific information. For example, a `Student` profile stores an `admissionNumber`, while a `Teacher` profile stores the `subjects` they teach. A user may have one corresponding profile document (e.g., a `User` with the "Student" role will have a linked `Student` profile).

---

## User Management API Workflow

This section details the correct API workflows for creating and updating users.

### 1. Creating a New User (One-Step Process)

User and profile creation is handled in a single API call. The backend will automatically create the appropriate profile based on the `role` provided.

**Endpoint:** `POST /api/users`

**Payload:** A single, flat JSON object containing all the required information for both the user and their future profile.

**Example Request (Creating a new Student):**

```json
{
  "name": "New Student Name",
  "email": "student.new@example.com",
  "password": "password123",
  "role": "Student",
  "branchId": "60d5f1b4e6b3c1a2b8f8d6e5",
  "classId": "60d5f1b4e6b3c1a2b8f8d6f3",
  "gender": "Female",
  "phoneNumber": "123-456-7890",
  "dateOfBirth": "2010-01-15",
  "admissionNumber": "STU-007"
}
```

**Example Success Response (201 Created):**

The API will return the newly created user object, with the profile information nested inside.

```json
{
  "success": true,
  "user": {
    "_id": "60d5f1b4e6b3c1a2b8f8d7a1",
    "name": "New Student Name",
    "email": "student.new@example.com",
    "role": "Student",
    "branchId": "60d5f1b4e6b3c1a2b8f8d6e5",
    "student": {
      "_id": "60d5f1b4e6b3c1a2b8f8d7a2",
      "userId": "60d5f1b4e6b3c1a2b8f8d7a1",
      "classId": "60d5f1b4e6b3c1a2b8f8d6f3",
      "gender": "Female",
      "phoneNumber": "123-456-7890",
      "dateOfBirth": "2010-01-15T00:00:00.000Z",
      "admissionNumber": "STU-007"
    }
  }
}
```

---

### 2. Updating an Existing User (Two-Step Process)

Updating an existing user requires two separate API calls because the core user information and the profile information are updated via different endpoints.

#### **Step 1: Update the Core User**

Update the user's name, email, role, or branch affiliation.

**Endpoint:** `PUT /api/users/:userId`

**Example Request:**

```json
{
  "name": "Updated Student Name",
  "email": "student.updated@example.com",
  "role": "Student",
  "branchId": "60d5f1b4e6b3c1a2b8f8d6e5"
}
```

**Example Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "60d5f1b4e6b3c1a2b8f8d7a1",
    "name": "Updated Student Name",
    "email": "student.updated@example.com",
    "role": "Student",
    "branchId": "60d5f1b4e6b3c1a2b8f8d6e5"
  }
}
```

#### **Step 2: Update the User's Profile**

Update the role-specific profile details. The endpoint and payload will vary based on the user's role.

**A) If a profile already exists (UPDATE):**

Use a `PUT` request to the specific profile endpoint.

**Endpoint:** `PUT /api/{profile-type}/:profileId` (e.g., `/api/students/60d5f1b4e6b3c1a2b8f8d7a2`)

**Example Request (Updating a Student's Profile):**

```json
{
  "classId": "60d5f1b4e6b3c1a2b8f8d6f4",
  "admissionNumber": "STU-007-UPDATED",
  "gender": "Female",
  "phoneNumber": "987-654-3210"
}
```

**B) If a profile does NOT exist (CREATE):**

If a user was created without profile details, you must create the profile using a `POST` request, linking it with the `userId`.

**Endpoint:** `POST /api/{profile-type}` (e.g., `/api/students`)

**Example Request (Creating a Student's Profile):**

```json
{
  "userId": "60d5f1b4e6b3c1a2b8f8d7a1",
  "classId": "60d5f1b4e6b3c1a2b8f8d6f4",
  "admissionNumber": "STU-007-NEW",
  "gender": "Female",
  "phoneNumber": "987-654-3210"
}
```

**Example Profile Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "60d5f1b4e6b3c1a2b8f8d7a2",
    "userId": "60d5f1b4e6b3c1a2b8f8d7a1",
    "classId": "60d5f1b4e6b3c1a2b8f8d6f4",
    ...
  }
}
```
