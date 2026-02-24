import React, { useState, useEffect, useCallback } from 'react';
import './IPAMonitor.css';

// API 基础地址 - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const IPAMonitor = ({ onBack }) => {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState(null);
  const [showLogs, setShowLogs] = useState(null); // monitorId
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPage, setLogsTotalPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const [alert, setAlert] = useState(null);

  // 表单状态
  const [formName, setFormName] = useState('');
  const [formURL, setFormURL] = useState('');
  const [formEmail, setFormEmail] = useState('570956418@qq.com');
  const [formVersion, setFormVersion] = useState('');

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  // 加载监控列表
  const fetchMonitors = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ipa-monitor/list`);
      const data = await res.json();
      if (res.ok) {
        setMonitors(data.data || []);
      }
    } catch (err) {
      console.error('获取监控列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitors();
  }, [fetchMonitors]);

  // 添加/编辑监控
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formURL.trim() || !formEmail.trim()) {
      showAlert('error', '下载链接和通知邮箱不能为空');
      return;
    }

    try {
      let res;
      if (editingMonitor) {
        res = await fetch(`${API_BASE_URL}/api/ipa-monitor/update?id=${editingMonitor.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim() || '未命名监控',
            download_url: formURL.trim(),
            notify_email: formEmail.trim(),
            version: formVersion.trim() || editingMonitor.version || 'v1',
            enabled: editingMonitor.enabled,
          }),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/api/ipa-monitor/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim() || '未命名监控',
            download_url: formURL.trim(),
            notify_email: formEmail.trim(),
            version: formVersion.trim() || 'v1',
          }),
        });
      }

      const data = await res.json();
      if (res.ok) {
        showAlert('success', editingMonitor ? '更新成功' : '添加成功');
        closeForm();
        fetchMonitors();
      } else {
        showAlert('error', data.message || '操作失败');
      }
    } catch (err) {
      showAlert('error', '网络错误: ' + err.message);
    }
  };

  // 删除监控
  const handleDelete = async (id, name) => {
    if (!window.confirm(`确定要删除监控「${name}」吗？`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ipa-monitor/delete?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showAlert('success', '删除成功');
        fetchMonitors();
      }
    } catch (err) {
      showAlert('error', '删除失败: ' + err.message);
    }
  };

  // 切换启用状态
  const handleToggle = async (monitor) => {
    try {
      await fetch(`${API_BASE_URL}/api/ipa-monitor/update?id=${monitor.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: monitor.name,
          download_url: monitor.download_url,
          notify_email: monitor.notify_email,
          version: monitor.version || 'v1',
          enabled: !monitor.enabled,
        }),
      });
      fetchMonitors();
    } catch (err) {
      showAlert('error', '切换失败: ' + err.message);
    }
  };

  // 立即检测所有
  const handleCheckNow = async () => {
    setChecking(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ipa-monitor/check-now`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showAlert('success', '检测完成');
        fetchMonitors();
      } else {
        showAlert('error', data.message || '检测失败');
      }
    } catch (err) {
      showAlert('error', '检测失败: ' + err.message);
    } finally {
      setChecking(false);
    }
  };

  // 获取日志（分页）
  const fetchLogs = async (monitorId, page) => {
    setLogsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ipa-monitor/logs?id=${monitorId}&page=${page}&page_size=10`);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.data.list || []);
        setLogsTotal(data.data.total || 0);
        setLogsTotalPage(data.data.total_page || 1);
        setLogsPage(page);
      }
    } catch (err) {
      console.error('获取日志失败:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  // 查看日志
  const handleViewLogs = async (monitorId) => {
    setShowLogs(monitorId);
    setLogsPage(1);
    fetchLogs(monitorId, 1);
  };

  // 翻页
  const handleLogPageChange = (page) => {
    if (showLogs !== null) {
      fetchLogs(showLogs, page);
    }
  };

  // 打开编辑表单
  const openEditForm = (monitor) => {
    setEditingMonitor(monitor);
    setFormName(monitor.name);
    setFormURL(monitor.download_url);
    setFormEmail(monitor.notify_email);
    setFormVersion(monitor.version || 'v1');
    setShowForm(true);
  };

  // 打开新增表单
  const openAddForm = () => {
    setEditingMonitor(null);
    setFormName('');
    setFormURL('');
    setFormEmail('570956418@qq.com');
    setFormVersion('v1');
    setShowForm(true);
  };

  // 关闭表单
  const closeForm = () => {
    setShowForm(false);
    setEditingMonitor(null);
    setFormName('');
    setFormURL('');
    setFormEmail('570956418@qq.com');
    setFormVersion('');
  };

  // 格式化时间
  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === '0001-01-01T00:00:00Z') return '-';
    return new Date(timeStr).toLocaleString('zh-CN');
  };

  // 获取状态标签
  const getStatusBadge = (status, enabled) => {
    if (enabled === false) {
      return <span className="m-status-badge m-status-disabled">已暂停</span>;
    }
    switch (status) {
      case 'valid':
        return <span className="m-status-badge m-status-valid">✓ 正常</span>;
      case 'revoked':
        return <span className="m-status-badge m-status-revoked">✗ 已掉签</span>;
      case 'expired':
        return <span className="m-status-badge m-status-expired">✗ 已过期</span>;
      default:
        return <span className="m-status-badge m-status-unknown">待检测</span>;
    }
  };

  // 打包类型
  const getProvisionType = (type) => {
    const map = { development: '开发版', adhoc: 'AdHoc', enterprise: '企业版', appstore: 'AppStore' };
    return map[type] || type || '-';
  };

  // 统计
  const stats = {
    total: monitors.length,
    valid: monitors.filter(m => m.last_cert_status === 'valid' && m.enabled).length,
    revoked: monitors.filter(m => m.last_cert_status === 'revoked').length,
    expired: monitors.filter(m => m.last_cert_status === 'expired').length,
  };

  return (
    <div className="ipa-monitor">
      <div className="monitor-container">
        {/* 头部 */}
        <div className="monitor-header">
          <div className="monitor-header-left">
            {onBack && (
              <button onClick={onBack} className="monitor-back-btn">← 返回</button>
            )}
            <div>
              <h1 className="monitor-title">IPA 掉签监控</h1>
              <p className="monitor-subtitle">自动监控 IPA 证书状态，掉签即时邮件通知</p>
            </div>
          </div>
          <div className="monitor-header-actions">
            <button
              className="btn-secondary"
              onClick={handleCheckNow}
              disabled={checking || monitors.length === 0}
            >
              {checking ? <><span className="spinner"></span>检测中...</> : '立即检测全部'}
            </button>
            <button className="btn-primary" onClick={openAddForm}>
              + 添加监控
            </button>
          </div>
        </div>

        {/* 提示信息 */}
        {alert && (
          <div className={`monitor-alert monitor-alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        {/* 统计卡片 */}
        <div className="monitor-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">监控总数</div>
          </div>
          <div className="stat-card stat-valid">
            <div className="stat-number">{stats.valid}</div>
            <div className="stat-label">证书正常</div>
          </div>
          <div className="stat-card stat-revoked">
            <div className="stat-number">{stats.revoked}</div>
            <div className="stat-label">已掉签</div>
          </div>
          <div className="stat-card stat-expired">
            <div className="stat-number">{stats.expired}</div>
            <div className="stat-label">已过期</div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="monitor-loading">
            <span className="spinner"></span>加载中...
          </div>
        )}

        {/* 空状态 */}
        {!loading && monitors.length === 0 && (
          <div className="monitor-empty">
            <div className="monitor-empty-icon">📡</div>
            <h3>还没有监控链接</h3>
            <p>添加 IPA 下载链接，系统将每 5 分钟自动检测证书状态</p>
            <button className="btn-primary" onClick={openAddForm}>
              + 添加第一个监控
            </button>
          </div>
        )}

        {/* 监控列表 */}
        {!loading && monitors.length > 0 && (
          <div className="monitor-list">
            {monitors.map((m) => (
              <div className="monitor-card" key={m.id}>
                <div className="monitor-card-header">
                  <div className="monitor-card-name">
                    {getStatusBadge(m.last_cert_status, m.enabled)}
                    <span>{m.name || '未命名'}</span>
                  </div>
                  <div className="monitor-card-actions">
                    <button
                      className={`toggle-switch ${m.enabled ? 'active' : ''}`}
                      onClick={() => handleToggle(m)}
                      title={m.enabled ? '点击暂停' : '点击启用'}
                    />
                    <button className="btn-primary btn-small" onClick={() => handleViewLogs(m.id)}>
                      日志
                    </button>
                    <button className="btn-secondary btn-small" style={{color:'#333',background:'#f0f0f0',border:'1px solid #ddd'}} onClick={() => openEditForm(m)}>
                      编辑
                    </button>
                    <button className="btn-danger btn-small" onClick={() => handleDelete(m.id, m.name)}>
                      删除
                    </button>
                  </div>
                </div>

                <div className="monitor-card-body">
                  <div className="monitor-info-item">
                    <span className="monitor-info-label">应用名称</span>
                    <span className="monitor-info-value">{m.last_app_name || '-'}</span>
                  </div>
                  <div className="monitor-info-item">
                    <span className="monitor-info-label">IPA版本号</span>
                    <span className="monitor-info-value" style={{fontWeight: 600, color: '#667eea'}}>
                      {m.version || 'v1'}
                    </span>
                  </div>
                  <div className="monitor-info-item">
                    <span className="monitor-info-label">证书名称</span>
                    <span className="monitor-info-value">{m.last_cert_name || '-'}</span>
                  </div>
                  <div className="monitor-info-item">
                    <span className="monitor-info-label">证书过期时间</span>
                    <span className="monitor-info-value">{formatTime(m.last_cert_expire_time)}</span>
                  </div>
                  <div className="monitor-info-item">
                    <span className="monitor-info-label">打包方式</span>
                    <span className="monitor-info-value">{getProvisionType(m.last_provision_type)}</span>
                  </div>
                  {m.last_cert_status === 'revoked' && m.last_cert_revoked_time && m.last_cert_revoked_time !== '0001-01-01T00:00:00Z' && (
                    <div className="monitor-info-item">
                      <span className="monitor-info-label" style={{color: '#e74c3c'}}>掉签时间</span>
                      <span className="monitor-info-value" style={{color: '#e74c3c', fontWeight: 600}}>
                        {formatTime(m.last_cert_revoked_time)}
                      </span>
                    </div>
                  )}
                  <div className="monitor-info-item">
                    <span className="monitor-info-label">通知邮箱</span>
                    <span className="monitor-info-value">{m.notify_email}</span>
                  </div>
                </div>

                <div className="monitor-card-footer">
                  <span className="monitor-url" title={m.download_url}>
                    🔗 {m.download_url}
                  </span>
                  <span style={{fontSize: 12, color: '#999'}}>
                    最后检测: {formatTime(m.last_check_time)}
                  </span>
                </div>

                {m.last_error_msg && (
                  <div style={{marginTop: 8, padding: '8px 12px', background: '#fff3cd', borderRadius: 6, fontSize: 13, color: '#856404'}}>
                    ⚠️ {m.last_error_msg}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 添加/编辑弹窗 */}
        {showForm && (
          <div className="monitor-modal-overlay" onClick={closeForm}>
            <div className="monitor-modal" onClick={(e) => e.stopPropagation()}>
              <div className="monitor-modal-header">
                <h3>{editingMonitor ? '编辑监控' : '添加监控'}</h3>
                <button className="modal-close-btn" onClick={closeForm}>×</button>
              </div>
              <form className="monitor-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>监控名称</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="例如：生产环境 App"
                  />
                  <div className="form-hint">用于区分不同的监控项</div>
                </div>
                <div className="form-group">
                  <label>IPA 下载链接 *</label>
                  <input
                    type="url"
                    value={formURL}
                    onChange={(e) => setFormURL(e.target.value)}
                    placeholder="https://example.com/app.ipa"
                    required
                  />
                  <div className="form-hint">可直接下载 IPA 文件的链接地址</div>
                </div>
                <div className="form-group">
                  <label>通知邮箱 *</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                  />
                  <div className="form-hint">掉签或过期时将发送邮件通知到此邮箱</div>
                </div>
                <div className="form-group">
                  <label>版本号</label>
                  <input
                    type="text"
                    value={formVersion}
                    onChange={(e) => setFormVersion(e.target.value)}
                    placeholder="v1"
                  />
                  <div className="form-hint">
                    用于本地缓存管理，修改版本号会触发重新下载（建议：v1、v2、v1.0、2024-02-13）
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={closeForm}>取消</button>
                  <button type="submit" className="btn-primary">
                    {editingMonitor ? '保存修改' : '添加监控'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 日志弹窗 */}
        {showLogs !== null && (
          <div className="monitor-modal-overlay" onClick={() => { setShowLogs(null); setLogs([]); }}>
            <div className="monitor-modal logs-modal" onClick={(e) => e.stopPropagation()}>
              <div className="monitor-modal-header">
                <h3>
                  检测日志
                  {(() => {
                    const currentMonitor = monitors.find(m => m.id === showLogs);
                    return currentMonitor ? (
                      <span style={{fontSize: 14, fontWeight: 'normal', color: '#667eea', marginLeft: 12}}>
                        {currentMonitor.name} (版本: {currentMonitor.version || 'v1'})
                      </span>
                    ) : null;
                  })()}
                </h3>
                <button className="modal-close-btn" onClick={() => { setShowLogs(null); setLogs([]); }}>×</button>
              </div>
              <div className="logs-list">
                {logsLoading && (
                  <div className="monitor-loading" style={{color:'#999'}}>
                    <span className="spinner" style={{borderTopColor:'#667eea', borderColor:'#eee'}}></span>加载中...
                  </div>
                )}
                {!logsLoading && logs.length === 0 && (
                  <div className="logs-empty">暂无检测记录</div>
                )}
                {!logsLoading && logs.map((log) => (
                  <div className="log-item" key={log.id}>
                    <span className="log-time">{formatTime(log.created_at)}</span>
                    <span className="log-status">
                      {getStatusBadge(log.cert_status, true)}
                    </span>
                    <span className="log-detail">
                      {log.cert_name || '-'}
                      {log.error_msg && (
                        <span style={{color:'#e74c3c', marginLeft:8, fontSize:12}}>({log.error_msg})</span>
                      )}
                    </span>
                    {log.email_sent && (
                      <span className="log-email-badge">已发邮件</span>
                    )}
                  </div>
                ))}
              </div>
              {/* 分页 */}
              {!logsLoading && logs.length > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 24px',
                  borderTop: '1px solid #f0f0f0',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  <span>共 {logsTotal} 条记录</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleLogPageChange(logsPage - 1)}
                      disabled={logsPage <= 1}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        background: logsPage <= 1 ? '#f5f5f5' : 'white',
                        cursor: logsPage <= 1 ? 'not-allowed' : 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      上一页
                    </button>
                    <span style={{ padding: '6px 12px' }}>
                      {logsPage} / {logsTotalPage}
                    </span>
                    <button
                      onClick={() => handleLogPageChange(logsPage + 1)}
                      disabled={logsPage >= logsTotalPage}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        background: logsPage >= logsTotalPage ? '#f5f5f5' : 'white',
                        cursor: logsPage >= logsTotalPage ? 'not-allowed' : 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IPAMonitor;
