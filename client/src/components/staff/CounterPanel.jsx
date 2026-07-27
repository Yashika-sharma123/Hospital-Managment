import { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { callNextToken, markServed, markNoShow, setCounterStatus } from '../../services/queueApi';

export default function CounterPanel({ counter, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.emit('joinServiceRoom', counter.service._id);
    socket.on('queue:update', onRefresh);
    return () => socket.off('queue:update', onRefresh);
  }, [socket, counter.service._id, onRefresh]);

  const handleCallNext = async () => {
    setLoading(true);
    setEmptyMessage(false);
    try {
      const { data } = await callNextToken(counter._id);
      if (!data.data.token) {
        setEmptyMessage(true);
      }
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleServed = async () => {
    setLoading(true);
    try {
      await markServed(counter._id);
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleNoShow = async () => {
    setLoading(true);
    try {
      await markNoShow(counter._id);
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async () => {
    const next = counter.status === 'active' ? 'inactive' : 'active';
    await setCounterStatus(counter._id, next);
    onRefresh();
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 17 }}>{counter.name}</h2>
          <p style={{ fontSize: 13, color: 'var(--muted-text)', margin: '4px 0 0' }}>{counter.service.name}</p>
        </div>
        <span className={`pill ${counter.status === 'active' ? 'pill-green' : 'pill-danger'}`}>{counter.status}</span>
      </div>

      {counter.currentToken ? (
        <div style={{ textAlign: 'center', padding: '20px 0', borderTop: '0.5px solid var(--border)' }}>
          <p style={{ fontSize: 13, color: 'var(--muted-text)' }}>Now serving</p>
          <h1 style={{ fontSize: 36, margin: '6px 0 20px' }}>{counter.currentToken.tokenNumber}</h1>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn-primary" onClick={handleServed} disabled={loading}>Mark Served</button>
            <button className="btn-secondary" onClick={handleNoShow} disabled={loading}>Mark No-Show</button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0', borderTop: '0.5px solid var(--border)' }}>
          <p style={{ fontSize: 13, color: 'var(--muted-text)', marginBottom: 16 }}>No token being served</p>
          <button className="btn-primary" onClick={handleCallNext} disabled={loading || counter.status !== 'active'}>
            Call Next
          </button>
          {emptyMessage && (
            <p style={{ fontSize: 12, color: 'var(--muted-text)', marginTop: 8 }}>
              No one is waiting for this department right now.
            </p>
          )}
          {counter.status !== 'active' && (
            <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 8 }}>Activate this counter first</p>
          )}
        </div>
      )}

      <button onClick={toggleActive} className="btn-secondary" style={{ marginTop: 16, fontSize: 12 }}>
        {counter.status === 'active' ? 'Go Inactive' : 'Go Active'}
      </button>
    </div>
  );
}
