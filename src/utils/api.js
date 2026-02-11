// API 配置和请求工具

// API 基础地址
const API_BASE_URL = 'http://localhost:8001/api/v1'

// 从 localStorage 获取 token
const getToken = () => {
  const user = localStorage.getItem('memo_user')
  if (user) {
    try {
      const userData = JSON.parse(user)
      return userData.token
    } catch (e) {
      return null
    }
  }
  return null
}

// 从 localStorage 获取 user_id
const getUserId = () => {
  const user = localStorage.getItem('memo_user')
  if (user) {
    try {
      const userData = JSON.parse(user)
      return userData.user_id || userData.userId
    } catch (e) {
      return null
    }
  }
  return null
}

// 通用请求函数
const request = async (url, options = {}) => {
  const token = getToken()
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }

    return null
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}

// 登录 API
export const login = async (username, password) => {
  const data = await request('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
  
  // 保存用户信息
  const userData = {
    username: data.username,
    user_id: data.user_id,
    userId: data.user_id, // 兼容两种命名
    token: data.token,
    loginTime: data.login_time
  }
  localStorage.setItem('memo_user', JSON.stringify(userData))
  
  return userData
}

// 获取备忘录列表
export const fetchMemos = async (params = {}) => {
  const { page = 1, pageSize = 100, status = 'all' } = params
  const queryParams = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    status
  })
  
  return await request(`/memos?${queryParams}`)
}

// 创建备忘录
export const createMemo = async (memo) => {
  return await request('/memos', {
    method: 'POST',
    body: JSON.stringify(memo)
  })
}

// 更新备忘录
export const updateMemo = async (id, memo) => {
  return await request(`/memos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(memo)
  })
}

// 删除备忘录
export const deleteMemo = async (id) => {
  return await request(`/memos/${id}`, {
    method: 'DELETE'
  })
}

// 延期备忘录
export const postponeMemo = async (id, days) => {
  return await request(`/memos/${id}/postpone`, {
    method: 'POST',
    body: JSON.stringify({ days })
  })
}

// 获取备忘录详情
export const getMemo = async (id) => {
  return await request(`/memos/${id}`)
}

export default {
  login,
  fetchMemos,
  createMemo,
  updateMemo,
  deleteMemo,
  postponeMemo,
  getMemo
}
