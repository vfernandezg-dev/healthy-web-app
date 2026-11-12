/** Índice de masa corporal (kg/m²) con un decimal; `null` si falta la altura o el peso. */
export function bmiOf(heightCm: number | null | undefined, weightKg: number | null | undefined) {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return null;
  }
  const meters = heightCm / 100;
  return Math.round((weightKg / (meters * meters)) * 10) / 10;
}

/** Clasificación de la OMS para adultos. */
export function bmiCategory(bmi: number | null): string | null {
  if (bmi === null) {
    return null;
  }
  if (bmi < 18.5) {
    return 'Bajo peso';
  }
  if (bmi < 25) {
    return 'Normal';
  }
  return bmi < 30 ? 'Sobrepeso' : 'Obesidad';
}
