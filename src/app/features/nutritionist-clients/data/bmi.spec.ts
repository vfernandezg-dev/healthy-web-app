import { bmiCategory, bmiOf } from './bmi';

describe('IMC', () => {
  it('divide el peso entre la altura al cuadrado, con un decimal', () => {
    expect(bmiOf(170, 65)).toBe(22.5);
    expect(bmiOf(182, 90.4)).toBe(27.3);
  });

  it('sin altura o sin peso no hay IMC', () => {
    expect(bmiOf(null, 70)).toBeNull();
    expect(bmiOf(170, null)).toBeNull();
    expect(bmiOf(0, 70)).toBeNull();
  });

  it('clasifica con los cortes de la OMS', () => {
    expect(bmiCategory(18.4)).toBe('Bajo peso');
    expect(bmiCategory(18.5)).toBe('Normal');
    expect(bmiCategory(24.9)).toBe('Normal');
    expect(bmiCategory(25)).toBe('Sobrepeso');
    expect(bmiCategory(30)).toBe('Obesidad');
    expect(bmiCategory(null)).toBeNull();
  });
});
