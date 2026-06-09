import Swal from 'sweetalert2/dist/sweetalert2.esm.all.js';

const confirmColor = '#06402B';
const cancelColor = '#6b7280';

export const showSuccess = (title, text = '') =>
  Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: confirmColor,
  });

export const showError = (title, text = '') =>
  Swal.fire({
    icon: 'error',
    title,
    text: typeof text === 'string' ? text : String(text),
    confirmButtonColor: confirmColor,
  });

export const showWarning = (title, text = '') =>
  Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonColor: confirmColor,
  });

export const showInfo = (title, text = '') =>
  Swal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonColor: confirmColor,
  });

export const confirmAction = async (title, text = '') => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel',
    confirmButtonColor: confirmColor,
    cancelButtonColor: cancelColor,
  });
  return result.isConfirmed;
};

export const apiErrorMessage = (err, fallback = 'Something went wrong.') => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
  return fallback;
};
