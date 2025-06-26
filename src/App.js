import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EditableList from './components/buttonAddWedding/Button';
import './App.css';


function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <h1>Wedding Seating Arrangement</h1>
        </header>

        <Routes>
          {/* Ruta principal que muestra el componente de añadir invitados */}
          <Route path="/" element={<EditableList />} />

          {/* Ruta dinámica para invitados seleccionados */}
          <Route path="/:name" element={<BlankPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// Página en blanco para redirecciones como /NombreInvitado
function BlankPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Página en blanco</h2>
      <p>Arreglo de mesas</p>
    </div>
  );
}

export default App;