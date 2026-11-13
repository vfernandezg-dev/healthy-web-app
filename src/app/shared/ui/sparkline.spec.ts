import { sparklineGeometry } from './sparkline';

describe('sparklineGeometry', () => {
  it('con menos de dos valores no hay línea', () => {
    expect(sparklineGeometry([])).toBeNull();
    expect(sparklineGeometry([70])).toBeNull();
  });

  it('va de izquierda a derecha con el mayor valor arriba', () => {
    const geometry = sparklineGeometry([70, 65], null, 120, 40);
    expect(geometry?.points).toBe('4,4 116,36');
    expect(geometry?.end).toEqual({ x: 116, y: 36 });
    expect(geometry?.targetY).toBeNull();
  });

  it('una serie plana queda en el centro', () => {
    expect(sparklineGeometry([68, 68, 68], null, 120, 40)?.points).toBe('4,20 60,20 116,20');
  });

  it('el objetivo fuera del rango amplía la escala para quedar dentro', () => {
    const geometry = sparklineGeometry([70, 68], 60, 120, 40);
    expect(geometry?.targetY).toBe(36);
    expect(geometry?.points).toBe('4,4 116,10.4');
  });
});
