import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import EditableList from './components/buttonAddWedding/EditableList';
import './App.css';
import SeatingCanvas from './components/SeatingCanvas';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { NotificationProvider } from './components/common/NotificationProvider';

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

function App() {
  return (
    <div className="App">
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </div>
  );
}

export default App;