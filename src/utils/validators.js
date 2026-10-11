export function validateEmail(email) {
  if (!email) return "Email is required";
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return "Please enter a valid email address";
  return "";
}

export function validatePassword(password) {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters long";
  return "";
}

export function validateName(name) {
  if (!name || name.trim().length === 0) return "Name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  return "";
}

export function validateBarcode(barcode) {
  if (!barcode) return "Barcode is required";
  if (!/^\d{8,14}$/.test(barcode.trim())) return "Enter a valid 8-14 digit numeric barcode";
  return "";
}
