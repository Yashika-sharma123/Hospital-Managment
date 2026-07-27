import { useEffect, useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import {
  getServices,
  createCounter,
  updateCounter,
  deleteCounter,
  assignStaffToCounter,
  getStaffList,
  listCounters,
} from '../../services/queueApi';

export default function CounterManagement() {
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [counters, setCounters] = useState([]);
  const [newCounterName, setNewCounterName] = useState('');
  const [newCounterService, setNewCounterService] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editService, setEditService] = useState('');
  const [error, setError] = useState('');

  const refresh = async () => {
    const [{ data: svc }, { data: staff }, { data: ctr }] = await Promise.all([
      getServices(),
      getStaffList(),
      listCounters(),
    ]);
    setServices(svc.data.services);
    setStaffList(staff.data.staff);
    setCounters(ctr.data.counters);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreateCounter = async (e) => {
    e.preventDefault();
    if (!newCounterName || !newCounterService) return;
    await createCounter({ name: newCounterName, serviceId: newCounterService });
    setNewCounterName('');
    refresh();
  };

  const handleAssign = async (counterId, staffId) => {
    if (!staffId) return;
    await assignStaffToCounter(counterId, staffId);
    refresh();
  };

  const startEdit = (counter) => {
    setEditingId(counter._id);
    setEditName(counter.name);
    setEditService(counter.service._id);
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError('');
  };

  const saveEdit = async (counterId) => {
    setError('');
    try {
      await updateCounter(counterId, { name: editName, serviceId: editService });
      setEditingId(null);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update counter');
    }
  };

  const handleDelete = async (counterId) => {
    if (!window.confirm('Delete this counter? This cannot be undone.')) return;
    setError('');
    try {
      await deleteCounter(counterId);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete counter');
    }
  };

  return (
    <div className="aurora-card" style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 16, marginBottom: 16 }}>Counters &amp; Staff</h2>

      <form onSubmit={handleCreateCounter} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input placeholder="Counter name (e.g. Counter 3)" value={newCounterName} onChange={(e) => setNewCounterName(e.target.value)} />
        <select value={newCounterService} onChange={(e) => setNewCounterService(e.target.value)}>
          <option value="">Select department</option>
          {services.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Add</button>
      </form>

      {error && <p style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 12 }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {counters.map((c) => (
          <div key={c._id} style={{ padding: '10px 12px', background: 'var(--bg-alt)', borderRadius: 10 }}>
            {editingId === c._id ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ flex: 1 }} />
                <select value={editService} onChange={(e) => setEditService(e.target.value)}>
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
                <button onClick={() => saveEdit(c._id)} className="btn btn-primary" style={{ padding: 8 }}>
                  <Check size={14} />
                </button>
                <button onClick={cancelEdit} className="btn btn-secondary" style={{ padding: 8 }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{c.name} · {c.service?.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '2px 0 0' }}>
                    {c.assignedStaff ? `Assigned: ${c.assignedStaff.name}` : 'No staff assigned'}
                    {c.currentToken ? ` · Currently serving ${c.currentToken.tokenNumber}` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <select defaultValue="" onChange={(e) => handleAssign(c._id, e.target.value)}>
                    <option value="">Assign staff...</option>
                    {staffList.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                  <button onClick={() => startEdit(c)} className="btn btn-ghost" title="Edit" style={{ padding: 8 }}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(c._id)} className="btn btn-ghost" title="Delete" style={{ padding: 8, color: 'var(--danger)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
