import { useState } from 'react';
import { Link } from 'react-router-dom';
import { parseDate, toISODate, today } from '../utils/dateUtils.js';

const EMPTY = { productName: '', purchaseDate: '', warrantyDurationMonths: '', serviceDate: '', notes: '' };

// Returns an object like { productName: "message" }. Empty object = form is valid.
function validate(v) {
  const e = {};
  if (!v.productName.trim()) e.productName = 'Enter the product name.';
  else if (v.productName.trim().length > 100) e.productName = 'Use 100 characters or fewer.';

  const purchase = parseDate(v.purchaseDate);
  if (!v.purchaseDate) e.purchaseDate = 'Choose the purchase date.';
  else if (!purchase) e.purchaseDate = 'Enter a valid date.';
  else if (purchase > today()) e.purchaseDate = 'Purchase date cannot be in the future.';

  const months = Number(v.warrantyDurationMonths);
  if (v.warrantyDurationMonths === '') e.warrantyDurationMonths = 'Enter the warranty length in months.';
  else if (!Number.isInteger(months)) e.warrantyDurationMonths = 'Use a whole number of months.';
  else if (months < 1) e.warrantyDurationMonths = 'Warranty must be at least 1 month.';
  else if (months > 120) e.warrantyDurationMonths = 'Warranty cannot be longer than 120 months.';

  if (v.serviceDate) {
    const service = parseDate(v.serviceDate);
    if (!service) e.serviceDate = 'Enter a valid date.';
    else if (purchase && service < purchase) e.serviceDate = 'Service date cannot be before the purchase date.';
  }
  if (v.notes.length > 500) e.notes = 'Use 500 characters or fewer.';
  return e;
}

export default function ProductForm({ initialValues, onSubmit, submitting, submitLabel }) {
  const [values, setValues] = useState({ ...EMPTY, ...initialValues });
  const [errors, setErrors] = useState({});

  const change = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (submitting) return; // prevents duplicate submissions
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    onSubmit({
      productName: values.productName.trim(),
      purchaseDate: values.purchaseDate,
      warrantyDurationMonths: Number(values.warrantyDurationMonths),
      serviceDate: values.serviceDate || null,
      notes: values.notes.trim(),
    });
  };

  const field = (name, label, input, hint, required) => (
    <div className={`field ${errors[name] ? 'has-error' : ''}`}>
      <label htmlFor={name}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      {input}
      {hint && !errors[name] && <p className="hint" id={`${name}-hint`}>{hint}</p>}
      {errors[name] && <p className="error-text" id={`${name}-err`} role="alert">{errors[name]}</p>}
    </div>
  );
  const common = (name) => ({ id: name, name, value: values[name], onChange: change, 'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `${name}-err` : `${name}-hint` });

  return (
    <form className="card form" onSubmit={submit} noValidate>
      {field('productName', 'Product name', <input type="text" {...common('productName')} placeholder="e.g. Laptop" maxLength={100} />, null, true)}
      <div className="form-row">
        {field('purchaseDate', 'Purchase date', <input type="date" {...common('purchaseDate')} max={toISODate(today())} />, null, true)}
        {field('warrantyDurationMonths', 'Warranty duration (months)', <input type="number" {...common('warrantyDurationMonths')} min="1" max="120" step="1" placeholder="24" />, '12 months = 1 year', true)}
      </div>
      {field('serviceDate', 'Service date', <input type="date" {...common('serviceDate')} />, 'Optional. Next or last service date.')}
      {field('notes', 'Notes', <textarea rows="4" {...common('notes')} placeholder="e.g. Keep the invoice safely" maxLength={500} />, 'Optional.')}
      <div className="form-actions">
        <Link to="/products" className="btn">Cancel</Link>
        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : submitLabel}</button>
      </div>
    </form>
  );
}
