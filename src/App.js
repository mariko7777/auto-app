import './App.css';
import RecordList from './components/RecordList';
import CreateCard from  './components/RecordForm';
import ServicesPage from './components/ServicesPage';
import ServiceDetails from './components/ServiceDetails';
import UsersPage from './components/UsersPage';
import RegisterUser from './components/RegisterUser';
import ShiftsPage from './components/ShiftsPage';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { initializeDefaultMasters } from './service/api';

function Navigation() {
  return (
    <nav style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--nav-bg)', display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Link to="/services" style={{ textDecoration: 'none', color: 'var(--link-color)', fontWeight: '700' }}>Услуги</Link>
      <Link to="/records" style={{ marginLeft: '12px', textDecoration: 'none', color: 'var(--link-color)', fontWeight: '600' }}>Список записей</Link>
      <Link to="/create" style={{ textDecoration: 'none', color: 'var(--link-color)', fontWeight: '600' }}>Создать запись</Link>
      <Link to="/users" style={{ marginLeft: 12, textDecoration: 'none', color: 'var(--link-color)', fontWeight: '600' }}>Пользователи</Link>
      <Link to="/shifts" style={{ marginLeft: 12, textDecoration: 'none', color: 'var(--link-color)', fontWeight: '600' }}>Смены</Link>
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
  <Route path="/users" element={<UsersPage />} />
  <Route path="/register" element={<RegisterUser />} />
  <Route path="/shifts" element={<ShiftsPage />} />
  <Route path="/services" element={<ServicesPage />} />
  <Route path="/services/:category" element={<ServiceDetails />} />
        <Route path="/" element={<RecordList editingIndex={editingIndex} onEdit={handleEdit} />} />
      </Routes>
    </div>
  );
}

function App() { 
  useEffect(() => {
    initializeDefaultMasters();
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;