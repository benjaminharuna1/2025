interface FormData {
  name: string;
  email: string;
  password?: string;
  role: 'Student' | 'Teacher' | 'Parent' | string;
  branchId: string;
  classId?: string;
  dateOfBirth?: string;
  admissionNumber?: string;
  classes?: string[];
  subjects?: string[];
  students?: string[];
}

export const generateUserPayload = (formData: FormData) => {
  const payload: any = {
    name: formData.name,
    email: formData.email,
    role: formData.role,
    branchId: formData.branchId,
  };

  if (formData.password) {
    payload.password = formData.password;
  }

  switch (formData.role) {
    case 'Student':
      payload.classId = formData.classId;
      payload.dateOfBirth = formData.dateOfBirth;
      payload.admissionNumber = formData.admissionNumber;
      break;

    case 'Teacher':
      payload.classes = formData.classes;
      payload.subjects = formData.subjects;
      break;

    case 'Parent':
      payload.students = formData.students;
      break;

    default:
      break;
  }

  return payload;
};