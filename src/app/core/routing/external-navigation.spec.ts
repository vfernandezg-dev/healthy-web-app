import { isPayPalUrl } from './external-navigation';

describe('isPayPalUrl', () => {
  it('acepta las páginas de PayPal por HTTPS', () => {
    expect(isPayPalUrl('https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T')).toBe(
      true,
    );
    expect(isPayPalUrl('https://www.paypal.com/checkoutnow?token=X')).toBe(true);
  });

  it('rechaza otros sitios, HTTP y dominios que solo lo parecen', () => {
    for (const url of [
      'http://www.paypal.com/checkoutnow',
      'https://paypal.com.evil.example/checkoutnow',
      'https://evilpaypal.com/checkoutnow',
      'javascript:alert(1)',
      '/client/subscription',
      'no es una url',
    ]) {
      expect(isPayPalUrl(url)).toBe(false);
    }
  });
});
