import React, { useState, useEffect, useCallback } from 'react';
import './CertManagement.css';

// API 基础地址 - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const CertManagement = ({ onBack }) => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [alert, setAlert] = useState(null);

  // 表单状态
  const [formDomain, setFormDomain] = useState('');
  const [formPort, setFormPort] = useState('443');
  const [formSource, setFormSource] = useState('manual');
  const [formRemark, setFormRemark] = useState('');

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  // 加载证书列表
  const fetchCerts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cert/list`);
      const data = await res.json();
      if (res.ok && data.data) {
        setCerts(data.data || []);
      }
    } catch (err) {
      console.error('获取证书列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCerts();
  }, [fetchCerts]);

  // 添加/编辑证书
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formDomain.trim()) {
      showAlert('error', '域名不能为空');
      return;
    }

    try {
      let res;
      if (editingCert) {
        res = await fetch(`${API_BASE_URL}/api/cert/update?id=${editingCert.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain_name: formDomain.trim(),
            port: formPort.trim() || '443',
            source: formSource.trim() || 'manual',
            remark: formRemark.trim(),
          }),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/api/cert/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain_name: formDomain.trim(),
            port: formPort.trim() || '443',
            source: formSource.trim() || 'manual',
            remark: formRemark.trim(),
          }),
        });
      }

      const data = await res.json();
      if (res.ok) {
        showAlert('success', editingCert ? '更新成功' : '添加成功');
        closeForm();
        fetchCerts();
      } else {
        showAlert('error', data.message || '操作失败');
      }
    } catch (err) {
      showAlert('error', '网络错误: ' + err.message);
    }
  };

  // 删除证书
  const handleDelete = async (id, domain) => {
    if (!window.confirm(`确定要删除证书「${domain}」吗？`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/cert/delete?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showAlert('success', '删除成功');
        fetchCerts();
      }
    } catch (err) {
      showAlert('error', '删除失败: ' + err.message);
    }
  };

  // 检测单个证书
  const handleCheckOne = async (id, domain) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cert/check?id=${id}`, {
        method: 'POST',
      });
      if (res.ok) {
        showAlert('success', `证书 ${domain} 检测完成`);
        fetchCerts();
      } else {
        const data = await res.json();
        showAlert('error', data.message || '检测失败');
      }
    } catch (err) {
      showAlert('error', '检测失败: ' + err.message);
    }
  };

  // 检测所有证书
  const handleCheckAll = async () => {
    setChecking(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/cert/check-all`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showAlert('success', '检测完成');
        fetchCerts();
      } else {
        showAlert('error', data.message || '检测失败');
      }
    } catch (err) {
      showAlert('error', '检测失败: ' + err.message);
    } finally {
      setChecking(false);
    }
  };

  // 打开编辑表单
  const openEditForm = (cert) => {
    setEditingCert(cert);
    setFormDomain(cert.domain_name);
    setFormPort(cert.port || '443');
    setFormSource(cert.source || 'manual');
    setFormRemark(cert.remark || '');
    setShowForm(true);
  };

  // 打开新增表单
  const openAddForm = () => {
    setEditingCert(null);
    setFormDomain('');
    setFormPort('443');
    setFormSource('manual');
    setFormRemark('');
    setShowForm(true);
  };

  // 关闭表单
  const closeForm = () => {
    setShowForm(false);
    setEditingCert(null);
    setFormDomain('');
    setFormPort('443');
    setFormSource('manual');
    setFormRemark('');
  };

  // 格式化时间
  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === '0001-01-01 00:00:00') return '-';
    return timeStr;
  };

  // 获取剩余时间状态
  const getLeftTimeStatus = (leftTime) => {
    if (!leftTime || leftTime <= 0) return 'unknown';
    const days = Math.floor(leftTime / 24);
    if (days > 30) return 'valid';
    if (days > 7) return 'expiring';
    return 'expired';
  };

  // 获取状态标签
  const getStatusBadge = (cert) => {
    if (!cert.expire_time || cert.expire_time === '0001-01-01 00:00:00') {
      return <span className="cert-status-badge cert-status-unknown">待检测</span>;
    }
    
    const status = getLeftTimeStatus(cert.left_time);
    const days = Math.floor((cert.left_time || 0) / 24);
    
    switch (status) {
      case 'valid':
        return <span className="cert-status-badge cert-status-valid">✓ 正常 ({days}天)</span>;
      case 'expiring':
        return <span className="cert-status-badge cert-status-expiring">⚠ 即将过期 ({days}天)</span>;
      case 'expired':
        return <span className="cert-status-badge cert-status-expired">✗ 已过期</span>;
      default:
        return <span className="cert-status-badge cert-status-unknown">待检测</span>;
    }
  };

  // 统计
  const stats = {
    total: certs.length,
    valid: certs.filter(c => getLeftTimeStatus(c.left_time) === 'valid').length,
    expiring: certs.filter(c => getLeftTimeStatus(c.left_time) === 'expiring').length,
    expired: certs.filter(c => getLeftTimeStatus(c.left_time) === 'expired' || c.left_time <= 0).length,
  };

  return (
    <div className="cert-management">
      <div className="cert-container">
        {/* 头部 */}
        <div className="cert-header">
          <div className="cert-header-left">
            {onBack && (
              <button onClick={onBack} className="cert-back-btn">← 返回</button>
            )}
            <div>
              <h1 className="cert-title">SSL证书管理</h1>
              <p className="cert-subtitle">监控SSL证书过期时间，自动邮件提醒</p>
            </div>
          </div>
          <div className="cert-header-actions">
            <button
              className="btn-secondary"
              onClick={handleCheckAll}
              disabled={checking || certs.length === 0}
            >
              {checking ? <><span className="spinner"></span>检测中...</> : '立即检测全部'}
            </button>
            <button className="btn-primary" onClick={openAddForm}>
              + 添加证书
            </button>
          </div>
        </div>

        {/* 提示信息 */}
        {alert && (
          <div className={`cert-alert cert-alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        {/* 统计卡片 */}
        <div className="cert-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">证书总数</div>
          </div>
          <div className="stat-card stat-valid">
            <div className="stat-number">{stats.valid}</div>
            <div className="stat-label">证书正常</div>
          </div>
          <div className="stat-card stat-expiring">
            <div className="stat-number">{stats.expiring}</div>
            <div className="stat-label">即将过期</div>
          </div>
          <div className="stat-card stat-expired">
            <div className="stat-number">{stats.expired}</div>
            <div className="stat-label">已过期</div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="cert-loading">
            <span className="spinner"></span>加载中...
          </div>
        )}

        {/* 空状态 */}
        {!loading && certs.length === 0 && (
          <div className="cert-empty">
            <div className="cert-empty-icon">🔒</div>
            <h3>还没有证书</h3>
            <p>添加SSL证书域名，系统将自动检测证书状态并在过期前提醒</p>
            <button className="btn-primary" onClick={openAddForm}>
              + 添加第一个证书
            </button>
          </div>
        )}

        {/* 证书列表 */}
        {!loading && certs.length > 0 && (
          <div className="cert-list">
            {certs.map((cert) => (
              <div className="cert-card" key={cert.id}>
                <div className="cert-card-header">
                  <div className="cert-card-name">
                    {getStatusBadge(cert)}
                    <span>{cert.domain_name}</span>
                  </div>
                  <div className="cert-card-actions">
                    <button
                      className="btn-primary btn-small"
                      onClick={() => handleCheckOne(cert.id, cert.domain_name)}
                    >
                      立即检测
                    </button>
                    <button
                      className="btn-secondary btn-small"
                      style={{color:'#333',background:'#f0f0f0',border:'1px solid #ddd'}}
                      onClick={() => openEditForm(cert)}
                    >
                      编辑
                    </button>
                    <button
                      className="btn-danger btn-small"
                      onClick={() => handleDelete(cert.id, cert.domain_name)}
                    >
                      删除
                    </button>
                  </div>
                </div>

                <div className="cert-card-body">
                  <div className="cert-info-item">
                    <span className="cert-info-label">域名</span>
                    <span className="cert-info-value">{cert.domain_name}</span>
                  </div>
                  <div className="cert-info-item">
                    <span className="cert-info-label">端口</span>
                    <span className="cert-info-value">{cert.port || '443'}</span>
                  </div>
                  <div className="cert-info-item">
                    <span className="cert-info-label">颁发者</span>
                    <span className="cert-info-value">{cert.issuer || '-'}</span>
                  </div>
                  <div className="cert-info-item">
                    <span className="cert-info-label">主题</span>
                    <span className="cert-info-value">{cert.subject || '-'}</span>
                  </div>
                  <div className="cert-info-item">
                    <span className="cert-info-label">过期时间</span>
                    <span className="cert-info-value" style={{
                      color: getLeftTimeStatus(cert.left_time) === 'expired' ? '#e74c3c' : 
                             getLeftTimeStatus(cert.left_time) === 'expiring' ? '#f39c12' : '#27ae60'
                    }}>
                      {formatTime(cert.expire_time)}
                    </span>
                  </div>
                  <div className="cert-info-item">
                    <span className="cert-info-label">剩余时间</span>
                    <span className="cert-info-value" style={{
                      color: getLeftTimeStatus(cert.left_time) === 'expired' ? '#e74c3c' : 
                             getLeftTimeStatus(cert.left_time) === 'expiring' ? '#f39c12' : '#27ae60',
                      fontWeight: 600
                    }}>
                      {cert.left_time ? `${Math.floor(cert.left_time / 24)} 天 (${cert.left_time} 小时)` : '-'}
                    </span>
                  </div>
                  <div className="cert-info-item">
                    <span className="cert-info-label">来源</span>
                    <span className="cert-info-value">{cert.source}</span>
                  </div>
                  <div className="cert-info-item">
                    <span className="cert-info-label">备注</span>
                    <span className="cert-info-value">{cert.remark || '-'}</span>
                  </div>
                </div>

                <div className="cert-card-footer">
                  <span>最后检测: {formatTime(cert.check_time)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 添加/编辑弹窗 */}
        {showForm && (
          <div className="cert-modal-overlay" onClick={closeForm}>
            <div className="cert-modal" onClick={(e) => e.stopPropagation()}>
              <div className="cert-modal-header">
                <h3>{editingCert ? '编辑证书' : '添加证书'}</h3>
                <button className="modal-close-btn" onClick={closeForm}>×</button>
              </div>
              <form className="cert-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>域名 *</label>
                  <input
                    type="text"
                    value={formDomain}
                    onChange={(e) => setFormDomain(e.target.value)}
                    placeholder="例如：example.com 或 www.example.com"
                    required
                  />
                  <div className="form-hint">输入要监控的域名（不包含 https:// 前缀）</div>
                </div>
                <div className="form-group">
                  <label>端口</label>
                  <input
                    type="text"
                    value={formPort}
                    onChange={(e) => setFormPort(e.target.value)}
                    placeholder="443"
                  />
                  <div className="form-hint">默认为 443（HTTPS标准端口）</div>
                </div>
                <div className="form-group">
                  <label>来源</label>
                  <input
                    type="text"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    placeholder="manual"
                  />
                  <div className="form-hint">标识证书来源，如：manual（手动添加）、auto（自动发现）</div>
                </div>
                <div className="form-group">
                  <label>备注</label>
                  <textarea
                    value={formRemark}
                    onChange={(e) => setFormRemark(e.target.value)}
                    placeholder="可选的备注信息"
                    rows="3"
                  />
                  <div className="form-hint">记录证书用途或其他说明信息</div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={closeForm}>取消</button>
                  <button type="submit" className="btn-primary">
                    {editingCert ? '保存修改' : '添加证书'}
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

export default CertManagement;
