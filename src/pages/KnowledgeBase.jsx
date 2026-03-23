import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Video, AlignLeft, Upload, ExternalLink, Trash2, Edit3, X } from 'lucide-react';

export default function KnowledgeBase() {
  const [materials, setMaterials] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null); // ID редактируемого материала
  const [formData, setFormData] = useState({ title: '', type: 'pdf', content: '', description: '' });

  useEffect(() => { fetchMaterials(); }, []);

  async function fetchMaterials() {
    const { data } = await supabase.from('materials').select('*').order('created_at', { ascending: false });
    setMaterials(data || []);
  }

  async function handleFileUpload(e) {
    try {
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const cleanFileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('knowledge-base')
        .upload(cleanFileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('knowledge-base')
        .getPublicUrl(cleanFileName);

      setFormData({ ...formData, content: publicUrl, type: 'pdf' });
      alert("Файл загружен!");
    } catch (error) {
      alert("Ошибка загрузки: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        // РЕЖИМ РЕДАКТИРОВАНИЯ
        const { error } = await supabase.from('materials').update(formData).eq('id', editingId);
        if (error) throw error;
        alert("Изменения сохранены!");
      } else {
        // РЕЖИМ СОЗДАНИЯ
        const { error } = await supabase.from('materials').insert([formData]);
        if (error) throw error;
        alert("Материал добавлен!");
      }
      
      cancelEdit();
      fetchMaterials();
    } catch (error) {
      alert(error.message);
    }
  }

  async function deleteMaterial(material) {
    if (!window.confirm(`Удалить материал "${material.title}"?`)) return;

    try {
      // 1. Если это PDF, пытаемся удалить файл из Storage
      if (material.type === 'pdf') {
        const fileUrlParts = material.content.split('/');
        const fileName = fileUrlParts[fileUrlParts.length - 1];
        await supabase.storage.from('knowledge-base').remove([fileName]);
      }

      // 2. Удаляем запись из базы
      const { error } = await supabase.from('materials').delete().eq('id', material.id);
      if (error) throw error;

      fetchMaterials();
    } catch (error) {
      alert("Ошибка при удалении: " + error.message);
    }
  }

  const startEdit = (m) => {
    setEditingId(m.id);
    setFormData({ title: m.title, type: m.type, content: m.content, description: m.description });
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Поднимаем к форме
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', type: 'pdf', content: '', description: '' });
  };

  return (
    <div style={{ padding: '30px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FileText /> База знаний</h2>

      {/* Форма (Добавление/Редактирование) */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: editingId ? '2px solid #ef4444' : 'none' }}>
        <h4 style={{ margin: '0 0 15px 0' }}>{editingId ? '📝 Редактирование материала' : '➕ Добавить новый материал'}</h4>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input placeholder="Название" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={inputStyle} />
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={inputStyle}>
              <option value="pdf">PDF Инструкция</option>
              <option value="video">Видео (ссылка)</option>
              <option value="text">Текстовая статья</option>
            </select>
          </div>

          {formData.type === 'pdf' ? (
            <div style={{ border: '2px dashed #ddd', padding: '15px', textAlign: 'center', borderRadius: '10px', background: '#f9fafb' }}>
              {formData.content && <p style={{ fontSize: '12px', color: 'green' }}>✅ Файл прикреплен</p>}
              <input type="file" onChange={handleFileUpload} accept=".pdf" />
              {uploading && <p>Загрузка...</p>}
            </div>
          ) : (
            <input 
              placeholder={formData.type === 'video' ? "Ссылка на YouTube/RuTube" : "Содержание или ссылка"} 
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})} 
              style={inputStyle} 
            />
          )}

          <textarea placeholder="Краткое описание для карточки" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{...inputStyle, height: '80px'}} />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={uploading} style={{ ...btnSubmit, flex: 3 }}>
              {editingId ? 'Сохранить изменения' : 'Опубликовать материал'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} style={{ ...btnSubmit, background: '#9ca3af', flex: 1 }}>
                Отмена
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Список */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {materials.map(m => (
          <div key={m.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              {m.type === 'pdf' ? <FileText color="#ef4444" /> : m.type === 'video' ? <Video color="#ef4444" /> : <AlignLeft color="#ef4444" />}
              <div style={{ display: 'flex', gap: '8px' }}>
                <Edit3 size={18} onClick={() => startEdit(m)} style={{ cursor: 'pointer', color: '#6b7280' }} />
                <Trash2 size={18} onClick={() => deleteMaterial(m)} style={{ cursor: 'pointer', color: '#ef4444' }} />
              </div>
            </div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '17px' }}>{m.title}</h4>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '15px', lineHeight: '1.4' }}>{m.description}</p>
            <a href={m.content} target="_blank" rel="noreferrer" style={linkStyle}>
              Смотреть материал <ExternalLink size={14} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none', fontSize: '14px' };
const btnSubmit = { background: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' };
const cardStyle = { background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #eee', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' };
const linkStyle = { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', textDecoration: 'none', fontWeight: '600', fontSize: '14px' };