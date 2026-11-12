/**
 * Reglas que la API también valida (mismos límites que su Bean Validation), para avisar antes de enviar.
 * Mensajes en español, iguales a los del servidor siempre que se puede.
 */
export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 64;

export const MESSAGES = {
  required: 'Este campo es obligatorio',
  email: 'Escribe un correo válido, como nombre@correo.com',
  passwordLength: `La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres`,
  passwordsDiffer: 'Las contraseñas no coinciden',
} as const;
