import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useWeddings } from './useWeddings';
import { listWeddings, createWeddingWithDetails, deleteWedding } from '../utils/weddingsService';

jest.mock('../utils/weddingsService', () => ({
  listWeddings: jest.fn(),
  createWeddingWithDetails: jest.fn(),
  deleteWedding: jest.fn(),
}));


function Harness({ ownerEmail, action }) {
  const hook = useWeddings({ ownerEmail });

  React.useEffect(() => {
    if (action) {
      action(hook);
    }
  }, [action, hook]);

  return (
    <div>
      <div data-testid="items">{hook.items.join(',')}</div>
      <div data-testid="loading">{hook.loading ? '1' : '0'}</div>
      <div data-testid="saving">{hook.saving ? '1' : '0'}</div>
      <div data-testid="deletingName">{hook.deletingName || ''}</div>
      <div data-testid="loadError">{hook.loadError || ''}</div>
    </div>
  );
}

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
});

test('loads weddings successfully', async () => {
  listWeddings.mockResolvedValueOnce(['Alpha', 'Beta']);
  render(<Harness ownerEmail="user@example.com" />);

  expect(screen.getByTestId('loading').textContent).toBe('1');
  await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('0'));
  expect(screen.getByTestId('items').textContent).toBe('Alpha,Beta');
});

test('falls back to localStorage on load failure', async () => {
  localStorage.setItem('weddingItems', JSON.stringify(['LocalOnly']));
  listWeddings.mockRejectedValueOnce(new Error('network'));
  render(<Harness ownerEmail="user@example.com" />);

  await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('0'));
  expect(screen.getByTestId('items').textContent).toBe('LocalOnly');
  expect(screen.getByTestId('loadError').textContent).toBe('Could not connect to server. Using local data.');
});

test('addWedding adds and persists (slugifies displayName)', async () => {
  listWeddings.mockResolvedValueOnce([]);
  createWeddingWithDetails.mockResolvedValueOnce('john-jane-2026-10-15');

  let hookApi;
  render(<Harness ownerEmail="user@example.com" action={(h) => (hookApi = h)} />);

  await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('0'));
  await act(async () => {
    await hookApi.addWedding({
      partner1Name: 'John',
      partner2Name: 'Jane',
      weddingDate: '2026-10-15',
    });
  });

  expect(screen.getByTestId('items').textContent).toBe('john-jane-2026-10-15');
  expect(JSON.parse(localStorage.getItem('weddingItems'))).toEqual(['john-jane-2026-10-15']);
});

test('addWedding validation: duplicate name', async () => {
  listWeddings.mockResolvedValueOnce(['john-jane-2026-10-15']);
  let hookApi;
  render(<Harness ownerEmail="user@example.com" action={(h) => (hookApi = h)} />);
  await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('0'));
  expect(screen.getByTestId('items').textContent).toBe('john-jane-2026-10-15');

  await expect(
    hookApi.addWedding({
      partner1Name: 'John',
      partner2Name: 'Jane',
      weddingDate: '2026-10-15',
    })
  ).rejects.toThrow('Wedding name already exists!');
});

test('deleteWedding removes and cleans localStorage', async () => {
  listWeddings.mockResolvedValueOnce(['Alpha']);
  deleteWedding.mockResolvedValueOnce();

  localStorage.setItem('weddingArrangement-Alpha', JSON.stringify({ foo: 'bar' }));

  let hookApi;
  render(<Harness ownerEmail="user@example.com" action={(h) => (hookApi = h)} />);

  await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('0'));
  await act(async () => {
    await hookApi.deleteWedding('Alpha');
  });

  expect(screen.getByTestId('items').textContent).toBe('');
  expect(JSON.parse(localStorage.getItem('weddingItems'))).toEqual([]);
  expect(localStorage.getItem('weddingArrangement-Alpha')).toBe(null);
});
