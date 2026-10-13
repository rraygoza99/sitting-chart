import React from 'react';

jest.mock(
  'react-router-dom',
  () => ({
    createBrowserRouter: jest.fn(() => ({})),
    RouterProvider: () => <div data-testid="router-provider" />,
    useNavigate: () => jest.fn(),
    useLocation: () => ({ pathname: '/' }),
    useBlocker: () => ({ state: 'unblocked', proceed: jest.fn(), reset: jest.fn() }),
    Navigate: () => null,
  }),
  { virtual: true }
);

jest.mock(
  'react-oidc-context',
  () => ({
    useAuth: () => ({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      signinRedirect: jest.fn(),
      removeUser: jest.fn(),
    }),
  }),
  { virtual: true }
);

test('App module can be imported and initialized without errors', () => {
  const App = require('./App').default;
  expect(App).toBeDefined();
});
