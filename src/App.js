import './App.css';
import RecordList from './components/RecordList';
import CreateCard from  './components/RecordForm';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navigation() {
  return (
    <nav style={{ padding: '20px', borderBottom: '1px solid #ccc', backgroundColor: '#f8f9fa' }}>
      <Link 
        to="/records" 
        style={{ marginRight: '15px', textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}
      >
        📋 Список записей
      </Link>
      <Link 
        to="/create" 
        style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}
      >
        ➕ Создать запись
      </Link>
    </nav>
  );
}

function AppContent() {
  const [editingIndex, setEditingIndex] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Если в URL есть параметр edit, используем его как editingIndex — это позволяет сохранить режим редактирования при F5
    try {
      const params = new URLSearchParams(location.search);
      const editParam = params.get('edit');
      if (editParam !== null) {
        const idx = parseInt(editParam, 10);
        if (!isNaN(idx)) setEditingIndex(idx);
      } else {
        setEditingIndex(null);
      }
    } catch (err) {
      // ignore
    }
  }, [location.search]);

  const handleEdit = (index) => {
    setEditingIndex(index);
    // Перенаправляем с параметром edit — после F5 параметр сохранится
    navigate(`/create?edit=${index}`);
  };

  const handleEditComplete = () => {
    setEditingIndex(null);
    navigate('/records');
  };

  return (
    <div style={{ padding: '20px' }}>
      <Navigation />
      
      <Routes>
        <Route path="/records" element={<RecordList editingIndex={editingIndex} onEdit={handleEdit} />} />
        <Route path="/create" element={<CreateCard editingIndex={editingIndex} onEditComplete={handleEditComplete} />} />
        <Route path="/" element={<RecordList editingIndex={editingIndex} onEdit={handleEdit} />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;