export const isValidPhoneNumber = (phone: string): boolean => {
  // Basic E.164 format validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const isValidCoordinates = (lat: number, lon: number): boolean => {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
};

export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
