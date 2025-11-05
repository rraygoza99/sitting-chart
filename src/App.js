import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import EditableList from './components/buttonAddWedding/EditableList';
import './App.css';
import SeatingCanvas from './components/SeatingCanvas';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { NotificationProvider } from './components/common/NotificationProvider';

function App() {
    const auth = useAuth();
    // Debug: log auth lifecycle info to help trace redirect/callback issues
    if (auth) {
      console.log('Auth status:', { isLoading: auth.isLoading, isAuthenticated: auth.isAuthenticated, user: auth.user, error: auth.error });
    }
  const router = createBrowserRouter([
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <EditableList />
        </ProtectedRoute>
      ),
    },
    {
      path: '/wedding/:name',
      element: (
        <ProtectedRoute>
          <SeatingCanvas />
        </ProtectedRoute>
      ),
    },
  ]);

  return (
    <div className="App">
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </div>
  );
}

export default App;