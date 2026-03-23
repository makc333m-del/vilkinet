import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [counts, setCounts] = useState({ employees: 0, tasks: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // Считаем сотрудников
    const { count: empCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    // Считаем активные задачи
    const { count: taskCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    setCounts({ employees: empCount || 0, tasks: taskCount || 0 });
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#1f2937', marginBottom: '20px' }}>Панель управления ВилкиНет</h1>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', margin: 0 }}>Сотрудники</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{counts.employees}</p>
        </div>

        <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', margin: 0 }}>Активные задачи</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{counts.tasks}</p>
        </div>

        <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', margin: 0 }}>Средний КЭС</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0', color: '#10b981' }}>85%</p>
        </div>
      </div>
    </div>
  );
}