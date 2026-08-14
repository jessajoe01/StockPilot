import { useState, useEffect } from 'react';
import Modal from './Modal';

// This one modal handles BOTH adding a new category and editing an existing one.
// If "editingCategory" is provided, the form pre-fills with its data and calls onSave
// with the id included. If it's null, the form starts empty (Add mode).
export default function CategoryFormModal({ isOpen, onClose, onSave, editingCategory }) {
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(editingCategory);

  // Whenever the modal opens (or the category being edited changes), reset the form fields
  useEffect(() => {
    if (editingCategory) {
      setCategoryName(editingCategory.category_name);
      setDescription(editingCategory.description || '');
    } else {
      setCategoryName('');
      setDescription('');
    }
    setError('');
  }, [editingCategory, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!categoryName.trim()) {
      setError('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({ category_name: categoryName.trim(), description: description.trim() });
      onClose();
    } catch (err) {
      const message = err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Category' : 'Add Category'}>
      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label" htmlFor="categoryName">Category Name</label>
          <input
            id="categoryName"
            type="text"
            className="form-input"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="e.g. Electronics"
            autoFocus
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="description">Description</label>
          <textarea
            id="description"
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional short description"
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
}