import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import CategoryFormModal from '../components/CategoryFormModal';
import { categoryService } from '../services/categoryService';
import './Shared.css';

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [pageError, setPageError] = useState('');

  // Fetches categories from the backend, optionally filtered by the current search term
  const loadCategories = useCallback(async (search) => {
    setIsLoading(true);
    setPageError('');
    try {
      const data = await categoryService.getAll(search);
      setCategories(data);
    } catch (err) {
      setPageError('Could not load categories. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load categories once on first render
  useEffect(() => {
    loadCategories('');
  }, [loadCategories]);

  // Debounce search: wait 400ms after the user stops typing before calling the API,
  // so we're not firing a request on every single keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCategories(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, loadCategories]);

  const handleAddClick = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    if (editingCategory) {
      await categoryService.update(editingCategory.category_id, formData);
    } else {
      await categoryService.create(formData);
    }
    await loadCategories(searchTerm);
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(`Delete "${category.category_name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await categoryService.remove(category.category_id);
      await loadCategories(searchTerm);
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete this category.');
    }
  };

  const handleToggleStatus = async (category) => {
    try {
      await categoryService.toggleStatus(category.category_id);
      await loadCategories(searchTerm);
    } catch (err) {
      alert('Could not update status.');
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organize your products into groups</p>
        </div>
        <button className="btn-primary" onClick={handleAddClick}>+ Add Category</button>
      </div>

      <div className="page-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="data-table-wrapper">
        {isLoading ? (
          <div className="empty-state">Loading...</div>
        ) : pageError ? (
          <div className="empty-state">{pageError}</div>
        ) : categories.length === 0 ? (
          <div className="empty-state">No categories found. Click "Add Category" to create one.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.category_id}>
                  <td>{category.category_name}</td>
                  <td>{category.description || '—'}</td>
                  <td>
                    <span className={`status-badge ${category.status === 'Active' ? 'active' : 'inactive'}`}>
                      {category.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="icon-btn" onClick={() => navigate(`/products?category_id=${category.category_id}`)}>
                        View Products
                      </button>
                      <button className="icon-btn" onClick={() => handleEditClick(category)}>Edit</button>
                      <button className="icon-btn" onClick={() => handleToggleStatus(category)}>
                        {category.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="icon-btn danger" onClick={() => handleDelete(category)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editingCategory={editingCategory}
      />
    </AppLayout>
  );
}