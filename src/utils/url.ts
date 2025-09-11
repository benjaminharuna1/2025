const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '');

export const getImageUrl = (path?: string) => {
  if (!path) return '';
  const imagePath = path.replace('public/', '');
  return `${BACKEND_URL}/${imagePath}`;
};
