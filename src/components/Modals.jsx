import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { api } from '../api/axios';
import tomateImg from '../assets/tomate.png';
import customLogo from '../assets/logo.png';

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6 sm:px-6">
      <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/70 bg-[#f9fafb] shadow-[0_30px_120px_-30px_rgba(0,0,0,0.45)] z-10">
        <div className="absolute top-0 right-0 w-[140px] h-[140px] bg-[#fef3c7] rounded-bl-full opacity-70 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[110px] h-[110px] bg-[#e8f5e9] rounded-tr-full opacity-50 pointer-events-none"></div>
        <div className="relative z-10 border-b border-gray-100 bg-white/80 backdrop-blur px-6 py-5 sm:px-8 sm:py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#ffb800] rounded-full flex items-center justify-center shadow-lg transform -rotate-12 overflow-hidden p-2 shrink-0">
              <img src={tomateImg} alt="Tomate" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#1e8b4d] mb-1">Salsa de Tomate</p>
              <h3 className="text-2xl sm:text-3xl font-black text-[#1a2e35] truncate">{title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-11 h-11 rounded-full border border-gray-200 bg-white text-gray-500 font-black hover:bg-gray-50 hover:text-gray-800 transition-colors shadow-sm"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>
        <div className="relative z-10 px-4 py-4 sm:px-6 sm:py-6">
          <div className="rounded-[1.5rem] border border-gray-100 bg-white shadow-[0_10px_40px_-20px_rgba(0,0,0,0.35)] p-4 sm:p-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryModal({ onClose }) {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  useEffect(() => {
    let mounted = true;
    api.get('/categories').then(res => mounted && setCats(res.data.data)).catch(() => {}).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const add = async () => {
    if (!name.trim()) return;
    try {
      const res = await api.post('/categories', { name });
      setCats(prev => [res.data.data || res.data, ...prev]);
      setName('');
    } catch (err) {
      console.error(err);
      alert('Error creando categoría');
    }
  };

  const remove = async (id) => {
    if (!confirm('Eliminar categoría?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setCats(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error eliminando');
    }
  };

  return (
    <ModalShell title="Administrar categorías" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Mariscos, Postres, Vegana"
            className="flex-grow rounded-2xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffb800] focus:border-transparent transition-all shadow-sm"
          />
          <button onClick={add} className="rounded-2xl bg-[#1e8b4d] px-5 py-3 font-black text-white shadow-sm hover:bg-green-800 transition-colors">
            Agregar categoría
          </button>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap pt-1">
          <p className="text-sm font-bold text-gray-500">Categorías guardadas: {cats.length}</p>
          <p className="text-sm font-bold text-gray-500">Tip: usa nombres cortos.</p>
        </div>
        <div className="max-h-[18rem] overflow-auto pr-1 custom-scrollbar space-y-3">
          {loading ? <p>Cargando...</p> : (
            cats.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
                <p className="text-lg font-black text-gray-700 mb-2">Todavía no hay categorías</p>
                <p className="text-sm font-bold text-gray-500">Agrega la primera para empezar a organizar tus recetas.</p>
              </div>
            ) : (
              cats.map(c => (
                <div key={c.id} className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-gray-100 bg-[#f9fafb] px-4 py-3 shadow-sm">
                  <div>
                    <p className="font-black text-gray-800 text-base sm:text-lg">{c.name}</p>
                    <p className="text-xs font-bold text-gray-500">Disponible para selección en recetas</p>
                  </div>
                  <button onClick={() => remove(c.id)} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-600 hover:bg-red-100 transition-colors">
                    Eliminar
                  </button>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </ModalShell>
  );
}

function ImageUploadModal({ recipeId, onClose, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleSelectFiles = (e) => {
    const files = Array.from(e.target.files || []);
    previewUrls.forEach(url => URL.revokeObjectURL(url));

    const nextPreviewUrls = files.map(file => URL.createObjectURL(file));
    setSelectedFiles(files);
    setPreviewUrls(nextPreviewUrls);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setUploading(true);
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const form = new FormData();
        form.append('file', selectedFiles[i]);
        await api.post(`/recipes/${recipeId}/media`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      alert('Upload completo');
      if (onUploadSuccess) onUploadSuccess();
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviewUrls([]);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error subiendo imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ModalShell title="Subir imágenes" onClose={onClose}>
      <div className="space-y-4">
        <label className="group relative block cursor-pointer rounded-[1.5rem] border-2 border-dashed border-gray-300 bg-[#f9fafb] px-5 py-8 text-center transition-colors hover:border-[#ffb800] hover:bg-[#fffaf0]">
          <input type="file" accept="image/png, image/jpeg, image/webp" multiple onChange={handleSelectFiles} disabled={uploading} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
            <svg className="h-7 w-7 text-[#1e8b4d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </div>
          <p className="text-lg font-black text-gray-800 mb-1">Haz clic para elegir fotos</p>
          <p className="text-sm font-bold text-gray-500">Formatos recomendados: JPG, PNG y WEBP. Puedes elegir varias imágenes a la vez.</p>
        </label>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm font-bold text-gray-600">
              {selectedFiles.length > 0 ? `${selectedFiles.length} imagen(es) seleccionada(s)` : 'Aún no has seleccionado imágenes'}
            </p>
            <button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="rounded-2xl bg-[#1e8b4d] px-5 py-3 font-black text-white shadow-sm hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Subiendo...' : 'Subir fotos'}
            </button>
          </div>

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {previewUrls.map((url, index) => (
                <div key={url} className="relative aspect-square overflow-hidden rounded-[1.25rem] border border-gray-100 bg-gray-50 shadow-sm">
                  <img src={url} alt={`Vista previa ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm font-bold text-gray-600">{uploading ? 'Subiendo imágenes...' : 'Vista previa lista antes de subir'}</p>
          {uploading && <div className="h-2 w-40 overflow-hidden rounded-full bg-gray-100"><div className="h-full w-1/2 animate-pulse rounded-full bg-[#1e8b4d]"></div></div>}
        </div>
      </div>
    </ModalShell>
  );
}

function createContainer() {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return el;
}

export function openCategoryModal() {
  const container = createContainer();
  const root = ReactDOM.createRoot(container);
  const close = () => { root.unmount(); container.remove(); };
  root.render(<CategoryModal onClose={close} />);
}

export function openImageModal(recipeId, options = {}) {
  const container = createContainer();
  const root = ReactDOM.createRoot(container);
  const close = () => { root.unmount(); container.remove(); };
  root.render(<ImageUploadModal recipeId={recipeId} onClose={close} onUploadSuccess={options.onUploadSuccess} />);
}

export default null;
