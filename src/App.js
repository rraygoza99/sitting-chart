import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EditableList from './components/buttonAddWedding/EditableList';
import './App.css';
import SeatingCanvas from './components/SeatingCanvas';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

const redirectToHome = () => {
        window.location.href = '/';
    }
function App() {
    
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <h1 onClick={redirectToHome} style={{cursor: 'pointer'}} >Wedding Seating Arrangement</h1>
        </header>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <EditableList />
            </ProtectedRoute>
          } />
          <Route path="/wedding/:name" element={
            <ProtectedRoute>
              <SeatingCanvas />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}



export default App;