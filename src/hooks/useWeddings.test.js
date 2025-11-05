import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useWeddings } from './useWeddings';
import { listWeddings, createWedding, deleteWedding } from '../utils/weddingsService';

jest.mock('../utils/weddingsService', () => ({
  listWeddings: jest.fn(),
  createWedding: jest.fn(),
  deleteWedding: jest.fn(),
}));


function Harness({ ownerMail, action }) {
  const hook = useWeddings({ ownerMail });
  const [hasRun, setHasRun] = React.useState(false);

  React.useEffect(() => {
    if (action && !hasRun) {
      setHasRun(true);
      action(hook);
    }
  }, [action, hasRun, hook]);

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
  render(<Harness ownerMail="user@example.com" />);

  expect(screen.getByTestId('loading').textContent).toBe('1');
  await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('0'));
  expect(screen.getByTestId('items').textContent).toBe('Alpha,Beta');
});

test('falls back to localStorage on load failure', async () => {
  localStorage.setItem('weddingItems', JSON.stringify(['LocalOnly']));
  listWeddings.mockRejectedValueOnce(new Error('network'));
  render(<Harness ownerMail="user@example.com" />);

  await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('0'));
  expect(screen.getByTestId('items').textContent).toBe('LocalOnly');
  expect(screen.getByTestId('loadError').textContent).toBe('Could not connect to server. Using local data.');
});

test('addWedding adds and persists (slugifies displayName)', async () => {
  listWeddings.mockResolvedValueOnce([]);
  createWedding.mockResolvedValueOnce();

  let hookApi;
  render(<Harness ownerMail="user@example.com" action={(h) => (hookApi = h)} />);

  await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('0'));
  await hookApi.addWedding('New Wedding');

  expect(screen.getByTestId('items').textContent).toBe('new-wedding');
  expect(JSON.parse(localStorage.getItem('weddingItems'))).toEqual(['new-wedding']);
});

test('addWedding validation: duplicate name', async () => {
  listWeddings.mockResolvedValueOnce(['Alpha']);
  render(<Harness ownerMail="user@example.com" />);
  await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('0'));
  await expect(screen.findByTestId('items')).resolves.toBeTruthy();

  // Access the hook by re-rendering with action
  let hookApi;
  render(<Harness ownerMail="user@example.com" action={(h) => (hookApi = h)} />);

  await expect(hookApi.addWedding('Alpha')).rejects.toThrow('Wedding name already exists!');
});

test('deleteWedding removes and cleans localStorage', async () => {
  listWeddings.mockResolvedValueOnce(['Alpha']);
  deleteWedding.mockResolvedValueOnce();

  localStorage.setItem('weddingArrangement-Alpha', JSON.stringify({ foo: 'bar' }));

  let hookApi;
  render(<Harness ownerMail="user@example.com" action={(h) => (hookApi = h)} />);

  await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('0'));
  await hookApi.deleteWedding('Alpha');

  expect(screen.getByTestId('items').textContent).toBe('');
  expect(JSON.parse(localStorage.getItem('weddingItems'))).toEqual([]);
  expect(localStorage.getItem('weddingArrangement-Alpha')).toBe(null);
});
