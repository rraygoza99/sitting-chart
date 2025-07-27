import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EditableList from './components/buttonAddWedding/EditableList';
import './App.css';
import SeatingCanvas from './components/SeatingCanvas';

function App() {
    
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<EditableList />} />

          <Route path="/wedding/:name" element={<SeatingCanvas />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;