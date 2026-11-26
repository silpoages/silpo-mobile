import { pluralize } from './pluralize';

describe('pluralize', () => {
  it('usa o singular só quando a quantidade é 1', () => {
    expect(pluralize(1, 'dia', 'dias')).toBe('dia');
  });

  it.each([0, 2, 10])('usa o plural para %i', (count) => {
    expect(pluralize(count, 'dia', 'dias')).toBe('dias');
  });
});
