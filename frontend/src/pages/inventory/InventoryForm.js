/**
 * Inventory form: create new or edit existing.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as inventoryApi from '../../api/inventory';
import { useRecordFormMode } from '../../hooks/useRecordFormMode';

export default function InventoryForm() {
  const { id, readOnly, isEditRoute, isCreate } = useRecordFormMode();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [skuLoading, setSkuLoading] = useState(isCreate);
  const [form, setForm] = useState({
    categoryId: '',
    sku: '',
    name: '',
    quantity: 0,
    minQuantity: 0,
    location: '',
  });

  useEffect(() => {
    inventoryApi
      .listCategories()
      .then((body) => {
        const rows = body?.data ?? body;
        setCategories(Array.isArray(rows) ? rows : []);
      })
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    if (isCreate) {
      inventoryApi
        .suggestNextSku()
        .then((body) => {
          const sku = body?.data?.sku ?? body?.sku;
          if (sku) setForm((prev) => ({ ...prev, sku }));
        })
        .catch(() => {})
        .finally(() => setSkuLoading(false));
    }
  }, [isCreate]);

  useEffect(() => {
    if (id) {
      inventoryApi
        .get(id)
        .then((res) => {
          const data = res.data?.data ?? res.data ?? res;
          const cid = data.categoryId;
          const categoryIdStr =
            typeof cid === 'object' && cid?._id ? String(cid._id) : cid ? String(cid) : '';
          setForm({
            categoryId: categoryIdStr,
            sku: data.sku ?? '',
            name: data.name ?? '',
            quantity: data.quantity ?? 0,
            minQuantity: data.minQuantity ?? 0,
            location: data.location ?? '',
          });
        })
        .catch((err) => setError(err.response?.data?.message || 'Failed to load item'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return;
    setError('');
    if (!form.sku.trim()) {
      setError('SKU is required.');
      return;
    }
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      categoryId: form.categoryId.trim() || null,
      quantity: Number(form.quantity) || 0,
      minQuantity: Number(form.minQuantity) || 0,
      location: form.location.trim() || undefined,
    };
    const promise = isEditRoute ? inventoryApi.update(id, payload) : inventoryApi.create(payload);
    promise
      .then(() => navigate('/inventory'))
      .catch((err) => setError(err.response?.data?.message || 'Failed to save item'))
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: 200 }}>
        <div className="loading-spinner" aria-label="Loading" />
      </div>
    );
  }

  return (
    <>
      <div className="page-toolbar">
        <h2 className="page-title">
          {readOnly ? 'Inventory item' : isEditRoute ? 'Edit item' : 'New inventory item'}
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {readOnly && id ? (
            <Link to={`/inventory/${id}/edit`} className="btn btn-primary">
              Edit
            </Link>
          ) : null}
          <Link to="/inventory" className="btn btn-secondary">
            Back to list
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card card-body" style={{ maxWidth: 560 }}>
        {error && <div className="form-error" role="alert">{error}</div>}

        <div className="form-section">
          <h3 className="form-section-title">Item details</h3>
          <div className="form-group">
            <label className="label" htmlFor="categoryId">Category</label>
            <select
              id="categoryId"
              className="input"
              value={form.categoryId}
              onChange={(e) => update('categoryId', e.target.value)}
              disabled={readOnly || categoriesLoading}
            >
              <option value="">
                {categoriesLoading ? 'Loading categories…' : 'Select a category (optional)'}
              </option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {!categoriesLoading && categories.length === 0 && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                No categories yet.{' '}
                <Link to="/inventory/categories/register">Register categories</Link> first — you can add as many as you need.
              </p>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label" htmlFor="sku">SKU *</label>
              <input
                id="sku"
                type="text"
                className="input"
                value={skuLoading ? '' : form.sku}
                onChange={(e) => update('sku', e.target.value)}
                placeholder={skuLoading ? 'Generating SKU…' : 'WIDGET-001'}
                required
                readOnly={readOnly || isEditRoute || skuLoading}
                disabled={skuLoading}
                aria-busy={skuLoading}
              />
              {isCreate && !skuLoading && (
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Auto-generated (WIDGET-###). You can edit before saving if needed.
                </p>
              )}
              {isEditRoute && !readOnly && (
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  SKU cannot be changed when editing.
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="label" htmlFor="name">Name *</label>
              <input
                id="name"
                type="text"
                className="input"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Product or part name"
                readOnly={readOnly}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label" htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                type="number"
                className="input"
                min={0}
                value={form.quantity}
                onChange={(e) => update('quantity', e.target.value)}
                readOnly={readOnly}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="minQuantity">Min. quantity (reorder)</label>
              <input
                id="minQuantity"
                type="number"
                className="input"
                min={0}
                value={form.minQuantity}
                onChange={(e) => update('minQuantity', e.target.value)}
                readOnly={readOnly}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="label" htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              className="input"
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="Warehouse, shelf, bin..."
              readOnly={readOnly}
            />
          </div>
        </div>

        <div className="form-actions">
          {!readOnly ? (
            <>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : isEditRoute ? 'Update item' : 'Add item'}
              </button>
              <Link to="/inventory" className="btn btn-secondary">
                Cancel
              </Link>
            </>
          ) : null}
        </div>
      </form>
    </>
  );
}

