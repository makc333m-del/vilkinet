import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { UserPlus, Users, Building, Trash2, Search, Filter } from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [positions, setPositions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Состояния для поиска и фильтрации
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRest, setFilterRest] = useState('all');

  const [formData, setFormData] = useState({ 
    email: '', password: '', fullName: '', position: '', restaurantId: '', role: 'employee' 
  });

  useEffect(() => {
    fetchEmployees();
    fetchRestaurants();
    fetchPositions();
  }, []);

  async function fetchEmployees() {
    const { data } = await supabase.from('profiles').select('*, restaurants(name)');
    setEmployees(data || []);
  }

  async function fetchRestaurants() {
    const { data } = await supabase.from('restaurants').select('*');
    setRestaurants(data || []);
  }

  async function fetchPositions() {
    const { data } = await supabase.from('positions').select('*').order('name');
    setPositions(data || []);
  }

  // Логика фильтрации "на лету"
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRest = filterRest === 'all' || emp.restaurant_id?.toString() === filterRest.toString();
    return matchesSearch && matchesRest;
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true 
      });
      if (authError) throw authError;

      const { error: profileError } = await supabase.from('profiles').insert([{
        id: authData.user.id,
        full_name: formData.fullName,
        position: formData.position,
        restaurant_id: formData.restaurantId,
        role: formData.role
      }]);
      if (profileError) throw profileError;

      alert("Сотрудник создан!");
      setShowModal(false);
      setFormData({ email: '', password: '', fullName: '', position: '', restaurantId: '', role: 'employee' });
      fetchEmployees();
    } catch (err) {
      alert("Ошибка: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  async function deleteEmployee(id) {
    if (!window.confirm("Удалить аккаунт сотрудника полностью?")) return;
    setLoading(true);
    try {
      const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (authErr) throw authErr;
      await supabase.from('profiles').delete().eq('id', id);
      fetchEmployees();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}><Users /> Сотрудники</h2>
        <button onClick={() => setShowModal(true)} style={btnPrimary}>
          <UserPlus size={18} /> Добавить сотрудника
        </button>
      </div>

      {/* Панель инструментов: Поиск и Фильтр */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ flex: 2, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
          <input 
            placeholder="Поиск по ФИО..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, marginBottom: 0, paddingLeft: '40px' }} 
          />
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <Filter size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
          <select 
            value={filterRest}
            onChange={(e) => setFilterRest(e.target.value)}
            style={{ ...inputStyle, marginBottom: 0, paddingLeft: '40px' }}
          >
            <option value="all">Все рестораны</option>
            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ padding: '0 5px' }}>
        <table style={tableStyle}>
          <thead style={{ background: '#f3f4f6' }}>
            <tr>
              <th style={thStyle}>ФИО</th>
              <th style={thStyle}>Должность</th>
              <th style={thStyle}>Ресторан</th>
              <th style={thStyle}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => (
              <tr key={emp.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={tdStyle}>{emp.full_name}</td>
                <td style={tdStyle}>{emp.position}</td>
                <td style={tdStyle}><Building size={14} style={{ marginRight: '5px' }} /> {emp.restaurants?.name}</td>
                <td style={tdStyle}>
                  <Trash2 size={18} onClick={() => deleteEmployee(emp.id)} style={{ cursor: 'pointer', color: '#ef4444' }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredEmployees.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '20px' }}>Никого не найдено</p>}
      </div>

      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ marginTop: 0 }}>Регистрация сотрудника</h3>
            <form onSubmit={handleRegister}>
              <input placeholder="Email" type="email" required style={inputStyle} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input placeholder="Пароль" type="password" required style={inputStyle} onChange={e => setFormData({...formData, password: e.target.value})} />
              <input placeholder="ФИО" required style={inputStyle} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              
              <select required style={inputStyle} onChange={e => setFormData({...formData, position: e.target.value})}>
                <option value="">Выберите должность</option>
                {positions.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
              
              <select required style={inputStyle} onChange={e => setFormData({...formData, restaurantId: e.target.value})}>
                <option value="">Выберите ресторан</option>
                {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #ddd' }}>Отмена</button>
                <button type="submit" disabled={loading} style={{ ...btnPrimary, flex: 1 }}>
                  {loading ? 'Загрузка...' : 'Зарегистрировать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const tableStyle = { width: '100%', background: 'white', borderRadius: '12px', borderCollapse: 'collapse', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' };
const thStyle = { padding: '15px', textAlign: 'left', color: '#6b7280', borderBottom: '2px solid #f3f4f6', fontSize: '14px' };
const tdStyle = { padding: '15px', color: '#374151', fontSize: '15px' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', outline: 'none' };
const btnPrimary = { background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(3px)' };
const modalStyle = { background: 'white', padding: '30px', borderRadius: '15px', width: '400px' };