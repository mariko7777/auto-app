import './App.css';
import RecordList from './components/RecordList';
import CreateCard from  './components/RecordForm';
import ServicesPage from './components/ServicesPage';
import ServiceDetails from './components/ServiceDetails';
import UsersPage from './components/UsersPage';
import RegisterUser from './components/RegisterUser';
import ShiftsPage from './components/ShiftsPage';
import Login from './components/Login';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { initializeDefaultMasters, initializeDefaultOperator } from './service/api';

function Navigation({ isAdmin, onLogout }) {
  const navButtonStyle = {
    textDecoration: 'none',
    padding: '10px 16px',
    border: '2px solid #667eea',
    borderRadius: '8px',
    color: '#667eea',
    fontWeight: '600',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    display: 'inline-block'
  };

  const navButtonHoverStyle = {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    backgroundColor: '#f5f5ff'
  };

  const loginButtonStyle = {
    ...navButtonStyle,
    border: '2px solid #5a9d70',
    color: '#5a9d70'
  };

  const logoutButtonStyle = {
    padding: '10px 16px',
    borderRadius: '8px',
    border: '2px solid #c85a5a',
    background: 'transparent',
    color: '#c85a5a',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
    transition: 'all 0.2s ease'
  };

  return (
    <nav style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--nav-bg)', display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Link 
        to="/services" 
        style={navButtonStyle}
        onMouseOver={e => Object.assign(e.target.style, navButtonHoverStyle)}
        onMouseOut={e => Object.assign(e.target.style, { transform: '', boxShadow: '', backgroundColor: '' })}
      >
        Услуги
      </Link>
      <Link 
        to="/records" 
        style={navButtonStyle}
        onMouseOver={e => Object.assign(e.target.style, navButtonHoverStyle)}
        onMouseOut={e => Object.assign(e.target.style, { transform: '', boxShadow: '', backgroundColor: '' })}
      >
        Список записей
      </Link>
      <Link 
        to="/create" 
        style={navButtonStyle}
        onMouseOver={e => Object.assign(e.target.style, navButtonHoverStyle)}
        onMouseOut={e => Object.assign(e.target.style, { transform: '', boxShadow: '', backgroundColor: '' })}
      >
        Создать запись
      </Link>
      {isAdmin && <Link 
        to="/users" 
        style={{ ...navButtonStyle, marginLeft: 12 }}
        onMouseOver={e => Object.assign(e.target.style, navButtonHoverStyle)}
        onMouseOut={e => Object.assign(e.target.style, { transform: '', boxShadow: '', backgroundColor: '' })}
      >
        Пользователи
      </Link>}
      {isAdmin && <Link 
        to="/shifts" 
        style={{ ...navButtonStyle, marginLeft: 12 }}
        onMouseOver={e => Object.assign(e.target.style, navButtonHoverStyle)}
        onMouseOut={e => Object.assign(e.target.style, { transform: '', boxShadow: '', backgroundColor: '' })}
      >
        Смены
      </Link>}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        {!isAdmin ? (
          <Link 
            to="/login" 
            style={loginButtonStyle}
            onMouseOver={e => Object.assign(e.target.style, { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(90, 157, 112, 0.3)', backgroundColor: '#f5fff7' })}
            onMouseOut={e => Object.assign(e.target.style, { transform: '', boxShadow: '', backgroundColor: '' })}
          >
            Вход
          </Link>
        ) : (
          <button 
            onClick={onLogout} 
            style={logoutButtonStyle}
            onMouseOver={e => Object.assign(e.target.style, { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(200, 90, 90, 0.3)', backgroundColor: '#fff5f5' })}
            onMouseOut={e => Object.assign(e.target.style, { transform: '', boxShadow: '', backgroundColor: '' })}
          >
            Выйти
          </button>
        )}
      </div>
    </nav>
  );
}

function AppContent({ isAdmin, onLogin, onLogout }) {
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
      <Navigation isAdmin={isAdmin} onLogout={onLogout} />
      
      <Routes>
        <Route path="/records" element={<RecordList editingIndex={editingIndex} onEdit={handleEdit} />} />
        <Route path="/create" element={<CreateCard editingIndex={editingIndex} onEditComplete={handleEditComplete} />} />
  <Route path="/users" element={<UsersPage />} />
  <Route path="/register" element={<RegisterUser />} />
  <Route path="/shifts" element={isAdmin ? <ShiftsPage /> : <Navigate to="/login" />} />
  <Route path="/login" element={<Login onLogin={onLogin} />} />
  <Route path="/services" element={<ServicesPage />} />
  <Route path="/services/:category" element={<ServiceDetails />} />
        <Route path="/" element={<RecordList editingIndex={editingIndex} onEdit={handleEdit} />} />
      </Routes>
    </div>
  );
}

function App() { 
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdminLoggedIn') === 'true');

  useEffect(() => {
    initializeDefaultMasters();
    initializeDefaultOperator();
  }, []);

  const handleLogin = () => {
    localStorage.setItem('isAdminLoggedIn', 'true');
    setIsAdmin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    setIsAdmin(false);
  };

  return (
    <Router>
      <AppContent isAdmin={isAdmin} onLogin={handleLogin} onLogout={handleLogout} />
    </Router>
  );
}

export default App;