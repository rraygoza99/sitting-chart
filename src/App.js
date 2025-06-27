import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EditableList from './components/buttonAddWedding/EditableList';
import './App.css';
import SeatingCanvas from './components/SeatingCanvas';

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
          <Route path="/" element={<EditableList />} />

          <Route path="/wedding/:name" element={<SeatingCanvas />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}



export default App;