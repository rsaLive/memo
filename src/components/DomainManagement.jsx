import React, { useState, useEffect, useCallback } from 'react';
import './DomainManagement.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const DomainManagement = ({ onBack }) => {
  const [domains, setDomains] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [alert, setAlert] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // 筛选状态
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVersion, setFilterVersion] = useState('');
  const [filterKeyword, setFilterKeyword] = useState('');

  // 表单状态
  const [formGameID, setFormGameID] = useState(0);
  const [formDomain, setFormDomain] = useState('');
  const [formStatus, setFormStatus] = useState(0);
  const [formVersion, setFormVersion] = useState('');

  const showAlertMsg = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchDomains = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (filterStatus !== '') params.append('status', filterStatus);
      if (filterVersion) params.append('version', filterVersion);
      if (filterKeyword) params.append('keyword', filterKeyword);

      const res = await fetch(`${API_BASE_URL}/api/domain/list?${params}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setDomains(data.data.list || []);
        setTotal(data.data.total || 0);
      }
    } catch (err) {
      console.error('获取域名列表失败:', err);
      showAlertMsg('error', '获取域名列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterVersion, filterKeyword]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formDomain.trim()) {
      showAlertMsg('error', '域名不能为空');
      return;
    }
    if (!formVersion.trim()) {
      showAlertMsg('error', '版本类别不能为空');
      return;
    }

    try {
      let res;
      const body = {
        gameid: Number(formGameID),
        domain: formDomain.trim(),
        status: Number(formStatus),
        version: formVersion.trim(),
      };

      if (editingDomain) {
        res = await fetch(`${API_BASE_URL}/api/domain/update?id=${editingDomain.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/api/domain/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      const data = await res.json();
      if (res.ok) {
        showAlertMsg('success', editingDomain ? '更新成功' : '添加成功');
        closeForm();
        fetchDomains();
      } else {
        showAlertMsg('error', data.message || '操作失败');
      }
    } catch (err) {
      showAlertMsg('error', '网络错误: ' + err.message);
    }
  };

  const handleDelete = async (id, domain) => {
    if (!window.confirm(`确定要删除域名「${domain}」吗？`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/domain/delete?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showAlertMsg('success', '删除成功');
        fetchDomains();
      } else {
        const data = await res.json();
        showAlertMsg('error', data.message || '删除失败');
      }
    } catch (err) {
      showAlertMsg('error', '删除失败: ' + err.message);
    }
  };

  const openEditForm = (item) => {
    setEditingDomain(item);
    setFormGameID(item.gameid || 0);
    setFormDomain(item.domain || '');
    setFormStatus(item.status || 0);
    setFormVersion(item.version || '');
    setShowForm(true);
  };

  const openAddForm = () => {
    setEditingDomain(null);
    setFormGameID(0);
    setFormDomain('');
    setFormStatus(1);
    setFormVersion('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingDomain(null);
    setFormGameID(0);
    setFormDomain('');
    setFormStatus(0);
    setFormVersion('');
  };

  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === '0001-01-01T00:00:00Z') return '-';
    try {
      return new Date(timeStr).toLocaleString('zh-CN');
    } catch {
      return timeStr;
    }
  };

  const totalPages = Math.ceil(total / pageSize);
  const stats = {
    total: total,
    on: domains.filter(d => d.status === 1).length,
    off: domains.filter(d => d.status !== 1).length,
  };

  return (
    <div className="domain-management">
      <div className="domain-container">
        {/* 头部 */}
        <div className="domain-header">
          <div className="domain-header-left">
            {onBack && (
              <button onClick={onBack} className="domain-back-btn">← 返回</button>
            )}
            <div>
              <h1 className="domain-title">域名管理</h1>
              <p className="domain-subtitle">管理域名配置，支持按游戏ID、状态、版本筛选</p>
            </div>
          </div>
          <div className="domain-header-actions">
            <button className="dm-btn-primary" onClick={openAddForm}>
              + 添加域名
            </button>
          </div>
        </div>

        {/* 提示信息 */}
        {alert && (
          <div className={`domain-alert domain-alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        {/* 筛选栏 */}
        <div className="domain-filters">
          <div className="domain-filter-item">
            <label>状态</label>
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
              <option value="">全部</option>
              <option value="1">开启</option>
              <option value="0">关闭</option>
            </select>
          </div>
          <div className="domain-filter-item">
            <label>版本</label>
            <input
              type="text"
              placeholder="如 high / low"
              value={filterVersion}
              onChange={(e) => { setFilterVersion(e.target.value); setPage(1); }}
              style={{ width: 140 }}
            />
          </div>
          <div className="domain-filter-item">
            <label>搜索</label>
            <input
              type="text"
              placeholder="搜索域名..."
              value={filterKeyword}
              onChange={(e) => { setFilterKeyword(e.target.value); setPage(1); }}
              style={{ width: 200 }}
            />
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="domain-stats">
          <div className="domain-stat-card">
            <div className="domain-stat-number">{stats.total}</div>
            <div className="domain-stat-label">域名总数</div>
          </div>
          <div className="domain-stat-card stat-on">
            <div className="domain-stat-number">{stats.on}</div>
            <div className="domain-stat-label">已开启</div>
          </div>
          <div className="domain-stat-card stat-off">
            <div className="domain-stat-number">{stats.off}</div>
            <div className="domain-stat-label">已关闭</div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="domain-loading">
            <span className="domain-spinner"></span>加载中...
          </div>
        )}

        {/* 空状态 */}
        {!loading && domains.length === 0 && (
          <div className="domain-empty">
            <div className="domain-empty-icon">🌐</div>
            <h3>还没有域名</h3>
            <p>添加域名配置，系统将统一管理</p>
            <button className="dm-btn-primary" onClick={openAddForm}>
              + 添加第一个域名
            </button>
          </div>
        )}

        {/* 域名表格 */}
        {!loading && domains.length > 0 && (
          <div className="domain-table-wrapper">
            <table className="domain-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>游戏ID</th>
                  <th>域名</th>
                  <th>状态</th>
                  <th>版本</th>
                  <th>创建时间</th>
                  <th>更新时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.gameid}</td>
                    <td style={{ fontWeight: 500 }}>{item.domain}</td>
                    <td>
                      <span className={`domain-status-badge ${item.status === 1 ? 'domain-status-on' : 'domain-status-off'}`}>
                        {item.status === 1 ? '开启' : '关闭'}
                      </span>
                    </td>
                    <td>
                      <span className="domain-version-badge">{item.version}</span>
                    </td>
                    <td>{formatTime(item.created_at)}</td>
                    <td>{formatTime(item.updated_at)}</td>
                    <td>
                      <div className="domain-table-actions">
                        <button
                          className="dm-btn-secondary dm-btn-small"
                          style={{ color: '#333', background: '#f0f0f0', border: '1px solid #ddd' }}
                          onClick={() => openEditForm(item)}
                        >
                          编辑
                        </button>
                        <button
                          className="dm-btn-danger dm-btn-small"
                          onClick={() => handleDelete(item.id, item.domain)}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="domain-pagination">
                <div className="domain-pagination-info">
                  共 {total} 条，第 {page}/{totalPages} 页
                </div>
                <div className="domain-pagination-btns">
                  <button disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button>
                  <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 添加/编辑弹窗 */}
        {showForm && (
          <div className="domain-modal-overlay" onClick={closeForm}>
            <div className="domain-modal" onClick={(e) => e.stopPropagation()}>
              <div className="domain-modal-header">
                <h3>{editingDomain ? '编辑域名' : '添加域名'}</h3>
                <button className="domain-modal-close-btn" onClick={closeForm}>×</button>
              </div>
              <form className="domain-form" onSubmit={handleSubmit}>
                <div className="domain-form-group">
                  <label>域名 *</label>
                  <input
                    type="text"
                    value={formDomain}
                    onChange={(e) => setFormDomain(e.target.value)}
                    placeholder="例如：example.com"
                    required
                  />
                </div>
                <div className="domain-form-group">
                  <label>游戏ID</label>
                  <input
                    type="number"
                    value={formGameID}
                    onChange={(e) => setFormGameID(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="domain-form-group">
                  <label>版本类别 *</label>
                  <input
                    type="text"
                    value={formVersion}
                    onChange={(e) => setFormVersion(e.target.value)}
                    placeholder="例如：high、low"
                    required
                  />
                  <div className="domain-form-hint">域名的分类标识，如 high、low 等</div>
                </div>
                <div className="domain-form-group">
                  <label>状态</label>
                  <select value={formStatus} onChange={(e) => setFormStatus(parseInt(e.target.value))}>
                    <option value={1}>开启</option>
                    <option value={0}>关闭</option>
                  </select>
                </div>
                <div className="domain-form-actions">
                  <button type="button" className="dm-btn-cancel" onClick={closeForm}>取消</button>
                  <button type="submit" className="dm-btn-primary">
                    {editingDomain ? '保存修改' : '添加域名'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainManagement;
