import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import EditableList from './components/buttonAddWedding/EditableList';
import './App.css';
import SeatingCanvas from './components/SeatingCanvas';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AccountPage from './components/AccountPage';
import PlansPage from './components/PlansPage';
import HelpPage from './components/HelpPage';
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
    path: '/account',
    element: (
      <ProtectedRoute requirePlanner={true}>
        <AccountPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/plans',
    element: (
      <ProtectedRoute requirePlanner={true}>
        <PlansPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/account/plans',
    element: (
      <ProtectedRoute requirePlanner={true}>
        <PlansPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/help',
    element: (
      <ProtectedRoute requirePlanner={true}>
        <HelpPage />
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