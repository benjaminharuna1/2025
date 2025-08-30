import { Session } from '../types';

export const getSessionId = (
  sessions: Session[],
  academicYear: string,
  term: string
): string => {
  const session = sessions.find(
    (s) => s.academicYear === academicYear && s.term === term
  );
  return session?._id || '';
};
