import React, { useState } from 'react';
import './IOSCertCheck.css';

const IOSCertCheck = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('ipa'); // 'ipa' or 'p12'
  const [checkResult, setCheckResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // IPA检测
  const [ipaFile, setIpaFile] = useState(null);

  // P12检测
  const [p12File, setP12File] = useState(null);
  const [provisionFile, setProvisionFile] = useState(null);
  const [password, setPassword] = useState('');

  // API 基础地址 - 从环境变量读取
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

  // 处理拖拽
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e, fileType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0], fileType);
    }
  };

  const handleFileSelect = (file, fileType) => {
    if (fileType === 'ipa') {
      if (!file.name.endsWith('.ipa')) {
        setError('请上传.ipa格式的文件');
        return;
      }
      setIpaFile(file);
    } else if (fileType === 'p12') {
      if (!file.name.endsWith('.p12')) {
        setError('请上传.p12格式的证书文件');
        return;
      }
      setP12File(file);
    } else if (fileType === 'provision') {
      if (!file.name.endsWith('.mobileprovision')) {
        setError('请上传.mobileprovision格式的描述文件');
        return;
      }
      setProvisionFile(file);
    }
    setError('');
  };

  // 检测IPA
  const checkIPA = async () => {
    if (!ipaFile) {
      setError('请选择IPA文件');
      return;
    }

    setLoading(true);
    setError('');
    setCheckResult(null);

    const formData = new FormData();
    formData.append('file', ipaFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ios-cert/check-ipa`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setCheckResult(data.data);
      } else {
        setError(data.message || '检测失败');
      }
    } catch (err) {
      setError('网络错误: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 检测P12证书
  const checkP12 = async () => {
    if (!p12File || !provisionFile) {
      setError('请上传P12证书文件和mobileprovision文件');
      return;
    }

    setLoading(true);
    setError('');
    setCheckResult(null);

    const formData = new FormData();
    formData.append('p12', p12File);
    formData.append('mobileprovision', provisionFile);
    formData.append('password', password);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ios-cert/check-p12`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setCheckResult(data.data);
      } else {
        setError(data.message || '检测失败');
      }
    } catch (err) {
      setError('网络错误: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 格式化时间
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN');
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // 获取状态显示
  const getStatusBadge = (status) => {
    if (status === 'valid') {
      return <span className="status-badge status-valid">✓ 有效</span>;
    } else if (status === 'expired') {
      return <span className="status-badge status-expired">✗ 已过期</span>;
    } else if (status === 'revoked') {
      return <span className="status-badge status-revoked">✗ 已掉签(撤销)</span>;
    }
    return <span className="status-badge status-unknown">未知</span>;
  };

  // 获取打包类型显示
  const getProvisionType = (type) => {
    const typeMap = {
      development: '开发版',
      adhoc: 'AdHoc',
      enterprise: '企业版',
      appstore: 'AppStore',
    };
    return typeMap[type] || type;
  };

  return (
    <div className="ios-cert-check">
      <div className="check-container">
        {onBack && (
          <button onClick={onBack} className="back-button">
            ← 返回备忘录
          </button>
        )}
        <h1 className="title">iOS 证书在线检测</h1>
        <p className="subtitle">检查证书到期时间 | 检测签名是否掉签 | 支持IPA包和P12证书</p>

        {/* 选项卡 */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'ipa' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('ipa');
              setCheckResult(null);
              setError('');
            }}
          >
            IPA包检测
          </button>
          <button
            className={`tab ${activeTab === 'p12' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('p12');
              setCheckResult(null);
              setError('');
            }}
          >
            P12证书检测
          </button>
        </div>

        {/* IPA检测 */}
        {activeTab === 'ipa' && (
          <div className="check-panel">
            <div
              className={`upload-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, 'ipa')}
              onClick={() => document.getElementById('ipa-file-input').click()}
            >
              <div className="upload-icon">📦</div>
              <p className="upload-text">
                {ipaFile ? ipaFile.name : '点击选择或拖拽IPA文件到此处'}
              </p>
              <p className="upload-hint">支持 .ipa 格式文件</p>
              <input
                id="ipa-file-input"
                type="file"
                accept=".ipa"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0], 'ipa')}
              />
            </div>

            <button
              className="check-button"
              onClick={checkIPA}
              disabled={loading || !ipaFile}
            >
              {loading ? '检测中...' : '立即检测'}
            </button>
          </div>
        )}

        {/* P12检测 */}
        {activeTab === 'p12' && (
          <div className="check-panel">
            <h3 className="panel-title">请上传 iOS 证书 p12 和 mobileprovision 文件</h3>

            <div
              className={`upload-area small ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, 'p12')}
              onClick={() => document.getElementById('p12-file-input').click()}
            >
              <div className="upload-icon">🔐</div>
              <p className="upload-text">
                {p12File ? p12File.name : '点击选择P12证书文件'}
              </p>
              <p className="upload-hint">支持 .p12 格式文件</p>
              <input
                id="p12-file-input"
                type="file"
                accept=".p12"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0], 'p12')}
              />
            </div>

            <div
              className={`upload-area small ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, 'provision')}
              onClick={() => document.getElementById('provision-file-input').click()}
            >
              <div className="upload-icon">📄</div>
              <p className="upload-text">
                {provisionFile ? provisionFile.name : '点击选择mobileprovision文件'}
              </p>
              <p className="upload-hint">支持 .mobileprovision 格式文件</p>
              <input
                id="provision-file-input"
                type="file"
                accept=".mobileprovision"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0], 'provision')}
              />
            </div>

            <div className="password-input">
              <label>P12 证书密码（可选）:</label>
              <input
                type="password"
                placeholder="请输入P12证书密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              className="check-button"
              onClick={checkP12}
              disabled={loading || !p12File || !provisionFile}
            >
              {loading ? '检测中...' : '立即检测'}
            </button>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* 检测结果 */}
        {checkResult && (
          <div className="result-panel">
            <h2 className="result-title">
              {checkResult.is_valid ? (
                <span className="result-valid">✓ 检测结果</span>
              ) : (
                <span className="result-invalid">✗ 检测发现问题</span>
              )}
            </h2>

            <div className="result-grid">
              {/* 证书信息 */}
              <div className="result-section">
                <h3>📜 证书信息</h3>
                <div className="result-item">
                  <span className="label">证书状态:</span>
                  {getStatusBadge(checkResult.cert_status)}
                </div>
                <div className="result-item">
                  <span className="label">证书名称:</span>
                  <span className="value">{checkResult.cert_name || '-'}</span>
                </div>
                <div className="result-item">
                  <span className="label">过期时间:</span>
                  <span className="value">{formatDate(checkResult.cert_expire_time)}</span>
                </div>
                {checkResult.cert_status === 'revoked' && checkResult.cert_revoked_time && (
                  <div className="result-item">
                    <span className="label">掉签时间:</span>
                    <span className="value" style={{color: '#e74c3c', fontWeight: 'bold'}}>
                      {formatDate(checkResult.cert_revoked_time)}
                    </span>
                  </div>
                )}
                <div className="result-item">
                  <span className="label">证书颁发者:</span>
                  <span className="value">{checkResult.cert_issuer || '-'}</span>
                </div>
              </div>

              {/* 描述文件信息 */}
              <div className="result-section">
                <h3>📋 Mobileprovision 信息</h3>
                <div className="result-item">
                  <span className="label">描述文件状态:</span>
                  {getStatusBadge(checkResult.provision_status)}
                </div>
                <div className="result-item">
                  <span className="label">描述文件名称:</span>
                  <span className="value">{checkResult.provision_name || '-'}</span>
                </div>
                <div className="result-item">
                  <span className="label">过期时间:</span>
                  <span className="value">{formatDate(checkResult.provision_expire_time)}</span>
                </div>
                <div className="result-item">
                  <span className="label">打包方式:</span>
                  <span className="value">{getProvisionType(checkResult.provision_type)}</span>
                </div>
              </div>

              {/* 应用信息 */}
              {activeTab === 'ipa' && checkResult.app_name && (
                <div className="result-section">
                  <h3>📱 应用信息</h3>
                  <div className="result-item">
                    <span className="label">应用名称:</span>
                    <span className="value">{checkResult.app_name}</span>
                  </div>
                  <div className="result-item">
                    <span className="label">Bundle ID:</span>
                    <span className="value">{checkResult.bundle_id || '-'}</span>
                  </div>
                  <div className="result-item">
                    <span className="label">版本号:</span>
                    <span className="value">{checkResult.app_version || '-'}</span>
                  </div>
                </div>
              )}

              {/* 文件信息 */}
              {activeTab === 'ipa' && (
                <div className="result-section">
                  <h3>📦 文件信息</h3>
                  <div className="result-item">
                    <span className="label">文件名:</span>
                    <span className="value">{checkResult.file_name}</span>
                  </div>
                  <div className="result-item">
                    <span className="label">文件大小:</span>
                    <span className="value">{formatFileSize(checkResult.file_size)}</span>
                  </div>
                  <div className="result-item">
                    <span className="label">文件MD5:</span>
                    <span className="value small">{checkResult.file_md5}</span>
                  </div>
                </div>
              )}
            </div>

            {checkResult.error_msg && (
              <div className="result-error">
                <strong>错误信息:</strong> {checkResult.error_msg}
              </div>
            )}

            <button className="continue-button" onClick={() => {
              setCheckResult(null);
              setIpaFile(null);
              setP12File(null);
              setProvisionFile(null);
              setPassword('');
            }}>
              继续检测
            </button>
          </div>
        )}

        {/* 说明 */}
        <div className="info-section">
          <h3>💡 说明</h3>
          <ul>
            <li>IPA包检测：上传已签名的IPA文件，自动提取证书和描述文件信息</li>
            <li>P12证书检测：分别上传P12证书和mobileprovision文件进行检测</li>
            <li>检测项目：证书有效期、证书撤销状态、描述文件过期时间等</li>
            <li>数据安全：所有文件仅用于本次检测，不会被保存或上传到第三方</li>
            <li>掉签检测：系统会验证证书是否被Apple撤销（掉签）</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IOSCertCheck;
