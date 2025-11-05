import { dedupeGuests, addGuestsUnique } from './guests';

describe('guests utils', () => {
  test('dedupeGuests removes duplicates by id preserving order', () => {
    const list = [
      { id: 1, firstName: 'A' },
      { id: 2, firstName: 'B' },
      { id: 1, firstName: 'A-dup' },
      { id: 3, firstName: 'C' },
      { id: 2, firstName: 'B-dup' },
    ];
    const result = dedupeGuests(list);
    expect(result.map(g => g.id)).toEqual([1, 2, 3]);
    // Keeps first occurrence data
    expect(result[0].firstName).toBe('A');
    expect(result[1].firstName).toBe('B');
  });

  test('addGuestsUnique appends single guest if not present', () => {
    const current = [{ id: 'a' }];
    const result = addGuestsUnique(current, { id: 'b' });
    expect(result.map(g => g.id)).toEqual(['a', 'b']);
  });

  test('addGuestsUnique does not duplicate existing guest', () => {
    const current = [{ id: 'a' }, { id: 'b' }];
    const result = addGuestsUnique(current, { id: 'b' });
    expect(result.map(g => g.id)).toEqual(['a', 'b']);
  });

  test('addGuestsUnique handles arrays and removes duplicates', () => {
    const current = [{ id: 1 }, { id: 2 }];
    const toAdd = [{ id: 2 }, { id: 3 }, { id: 1 }];
    const result = addGuestsUnique(current, toAdd);
    expect(result.map(g => g.id)).toEqual([1, 2, 3]);
  });
});
