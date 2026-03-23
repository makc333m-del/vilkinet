import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Store, MapPin, Phone, Trash2, Edit2, X } from 'lucide-react';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [newRest, setNewRest] = useState({ name: '', address: '', phone: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchRestaurants(); }, []);

  async function fetchRestaurants() {
    const { data } = await supabase.from('restaurants').select('*').order('created_at');
    setRestaurants(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from('restaurants').update(newRest).eq('id', editingId);
      if (error) alert(error.message);
      else {
        setEditingId(null);
        setNewRest({ name: '', address: '', phone: '' });
        fetchRestaurants();
      }
    } else {
      const { error } = await supabase.from('restaurants').insert([newRest]);
      if (error) alert(error.message);
      else {
        setNewRest({ name: '', address: '', phone: '' });
        fetchRestaurants();
      }
    }
  }

  async function deleteRestaurant(id) {
  try {
    // 1. Проверяем, есть ли сотрудники, привязанные к этому ресторану
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', id);

    if (countError) throw countError;

    // 2. Если сотрудники есть — выдаем предупреждение и блокируем удаление
    if (count > 0) {
      alert(`Нельзя удалить ресторан! К нему привязано сотрудников: ${count}. 
Сначала переведите их в другой филиал или удалите их аккаунты в разделе "Сотрудники".`);
      return;
    }

    // 3. Если ресторан пуст — спрашиваем подтверждение и удаляем
    if (window.confirm("Вы уверены? В этом ресторане нет активных сотрудников, его можно безопасно удалить.")) {
      const { error: deleteError } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      alert("Ресторан успешно удален");
      fetchRestaurants();
    }
  } catch (err) {
    alert("Ошибка: " + err.message);
  }
}

  const startEdit = (r) => {
    setEditingId(r.id);
    setNewRest({ name: r.name, address: r.address, phone: r.phone });
  };

  return (
    <div style={{ padding: '30px' }}>
      <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Store color="#ef4444" /> Рестораны сети
      </h2>

      <form onSubmit={handleSubmit} style={formStyle}>
        <input placeholder="Название" value={newRest.name} onChange={e => setNewRest({...newRest, name: e.target.value})} required style={inputStyle} />
        <input placeholder="Адрес" value={newRest.address} onChange={e => setNewRest({...newRest, address: e.target.value})} style={inputStyle} />
        <input placeholder="Телефон" value={newRest.phone} onChange={e => setNewRest({...newRest, phone: e.target.value})} style={inputStyle} />
        <button type="submit" style={btnSubmitStyle}>
          {editingId ? 'Сохранить' : 'Добавить'}
        </button>
        {editingId && (
          <button type="button" onClick={() => {setEditingId(null); setNewRest({name:'', address:'', phone:''})}} style={btnCancelStyle}>
            <X size={18} />
          </button>
        )}
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {restaurants.map(r => (
          <div key={r.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{r.name}</h3>
              <div style={{ display: 'flex', gap: '5px' }}>
                <Edit2 size={18} onClick={() => startEdit(r)} style={{ cursor: 'pointer', color: '#3b82f6' }} />
                <Trash2 size={18} onClick={() => deleteRestaurant(r.id)} style={{ cursor: 'pointer', color: '#ef4444' }} />
              </div>
            </div>
            <div style={infoStyle}><MapPin size={14} /> {r.address || '---'}</div>
            <div style={infoStyle}><Phone size={14} /> {r.phone || '---'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const formStyle = { background: 'white', padding: '20px', borderRadius: '12px', display: 'flex', gap: '10px', marginBottom: '30px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };
const inputStyle = { flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' };
const btnSubmitStyle = { background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnCancelStyle = { background: '#9ca3af', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' };
const cardStyle = { background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' };
const infoStyle = { color: '#6b7280', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' };