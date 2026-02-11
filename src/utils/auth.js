// 认证相关的工具函数

// 检查用户是否已登录
export const isLoggedIn = () => {
  const user = localStorage.getItem('memo_user')
  return !!user
}

// 获取当前登录用户
export const getCurrentUser = () => {
  const user = localStorage.getItem('memo_user')
  return user ? JSON.parse(user) : null
}

// 登出
export const logout = () => {
  localStorage.removeItem('memo_user')
  // 注意：不删除记住的用户名密码，以便下次登录时使用
  return true
}

// 登录（实际项目应该调用后端API）
export const login = async (username, password) => {
  // TODO: 调用后端API验证
  // const response = await fetch('/api/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ username, password })
  // })
  // const data = await response.json()
  
  // 模拟API调用
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username && password) {
        const userData = {
          username,
          loginTime: new Date().toISOString(),
          token: 'demo_token_' + Date.now()
        }
        localStorage.setItem('memo_user', JSON.stringify(userData))
        resolve(userData)
      } else {
        reject(new Error('用户名或密码不能为空'))
      }
    }, 500)
  })
}

// 更新用户信息
export const updateUserInfo = (updates) => {
  const user = getCurrentUser()
  if (user) {
    const updatedUser = { ...user, ...updates }
    localStorage.setItem('memo_user', JSON.stringify(updatedUser))
    return updatedUser
  }
  return null
}
