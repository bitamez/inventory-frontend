import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, Clock, FileText } from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

const ApprovalPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => { fetchApprovals(); }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/approvals');
      if (res.data?.success) setApprovals(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id, approval_status) => {
    setProcessing(id + approval_status);
    try {
      await api.put(`/approvals/${id}/process`, { approval_status });
      await fetchApprovals();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process approval');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = approvals.filter(a => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = String(a.invoice_number || '').toLowerCase().includes(searchLower) ||
                        String(a.requested_by_name || '').toLowerCase().includes(searchLower);
    const matchFilter = filter === 'all' || a.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain">Transaction Approvals</h1>
          <p className="text-sm text-textMuted mt-1">Review and manage pending high-value transactions</p>
        </div>
        <div className="px-4 py-2 bg-warning/10 border border-warning/20 rounded-lg text-warning text-sm font-medium">
          {approvals.filter(a => a.status === 'pending').length} Pending
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface p-4 rounded-xl border border-border">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            placeholder="Search by invoice or requester..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-sm text-textMain focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex bg-background rounded-lg border border-border overflow-hidden">
          {['all', 'pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={clsx(
                "px-4 py-2 text-sm font-medium transition-colors capitalize",
                filter === status ? "bg-surfaceHighlight text-textMain" : "text-textMuted hover:text-textMain hover:bg-surfaceHighlight/50"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Approvals List */}
      <div className="grid grid-cols-1 gap-4 flex-1 overflow-y-auto">
        {loading ? (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center text-textMuted">Loading approvals...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-textMuted mb-4" />
            <h3 className="text-lg font-medium text-textMain mb-1">No approvals found</h3>
            <p className="text-textMuted">All caught up! No transactions need your attention right now.</p>
          </div>
        ) : filtered.map((approval) => (
          <div key={approval.id} className="bg-surface border border-border rounded-2xl p-6 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center hover:border-surfaceHighlight transition-colors">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-textMuted shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-textMain">{approval.invoice_number}</h3>
                  <span className={clsx(
                    "px-2.5 py-0.5 text-xs font-medium rounded-full border",
                    approval.status === 'pending'  && "text-warning border-warning/20 bg-warning/10",
                    approval.status === 'approved' && "text-secondary border-secondary/20 bg-secondary/10",
                    approval.status === 'rejected' && "text-danger border-danger/20 bg-danger/10"
                  )}>
                    {approval.status?.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-textMuted">
                  <span className="font-medium text-textMain">{approval.requested_by_name}</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {new Date(approval.requested_at).toLocaleDateString()}
                  </span>
                </div>
                {approval.manager_notes && (
                  <p className="text-sm mt-2 text-textMuted">Note: <span className="text-textMain">{approval.manager_notes}</span></p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-4 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border">
              <div className="text-right">
                <p className="text-xs text-textMuted mb-1">Total Amount</p>
                <p className="text-xl font-bold text-textMain">{Number(approval.total_amount).toLocaleString()} Birr</p>
              </div>
              {approval.status === 'pending' && (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    disabled={!!processing}
                    onClick={() => handleProcess(approval.id, 'approved')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    disabled={!!processing}
                    onClick={() => handleProcess(approval.id, 'rejected')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApprovalPage;
