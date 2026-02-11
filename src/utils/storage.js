// 本地存储工具函数
// 注意：这里使用 localStorage 作为临时存储
// 实际项目中，这些函数应该调用后端 API

const STORAGE_KEY = 'memos'

// 获取所有备忘录
export const getMemos = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('获取备忘录失败:', error)
    return []
  }
}

// 保存备忘录到存储
export const saveMemos = (memos) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memos))
    // TODO: 同步到后端 API
    // await fetch('/api/memos', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(memos)
    // })
    return true
  } catch (error) {
    console.error('保存备忘录失败:', error)
    return false
  }
}

// 更新备忘录状态
export const updateMemoStatus = (memos, id, status) => {
  const updatedMemos = memos.map(memo => {
    if (memo.id === id) {
      return {
        ...memo,
        status,
        updatedAt: new Date().toISOString(),
        completedAt: status === 'completed' ? new Date().toISOString() : null
      }
    }
    return memo
  })
  saveMemos(updatedMemos)
  return updatedMemos
}

// 删除备忘录
export const deleteMemo = (memos, id) => {
  const filteredMemos = memos.filter(memo => memo.id !== id)
  saveMemos(filteredMemos)
  // TODO: 调用后端 API 删除
  // await fetch(`/api/memos/${id}`, { method: 'DELETE' })
  return filteredMemos
}

// 延期备忘录
export const postponeMemo = (memos, id, days) => {
  const updatedMemos = memos.map(memo => {
    if (memo.id === id) {
      const currentDueDate = new Date(memo.dueDate)
      const newDueDate = new Date(currentDueDate.getTime() + days * 24 * 60 * 60 * 1000)
      return {
        ...memo,
        dueDate: newDueDate.toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
    return memo
  })
  saveMemos(updatedMemos)
  return updatedMemos
}

// API 接口函数（连接到后端）
export const api = {
  // 获取所有备忘录
  fetchMemos: async () => {
    try {
      const { fetchMemos } = await import('./api')
      const response = await fetchMemos()
      return response.memos || []
    } catch (error) {
      console.error('Failed to fetch memos from backend:', error)
      // 降级到本地存储
      return getMemos()
    }
  },

  // 创建备忘录
  createMemo: async (memo) => {
    try {
      const { createMemo } = await import('./api')
      return await createMemo(memo)
    } catch (error) {
      console.error('Failed to create memo:', error)
      // 降级到本地存储
      const memos = getMemos()
      const newMemo = { ...memo, id: Date.now().toString() }
      saveMemos([...memos, newMemo])
      return newMemo
    }
  },

  // 更新备忘录
  updateMemo: async (id, updates) => {
    try {
      const { updateMemo } = await import('./api')
      return await updateMemo(id, updates)
    } catch (error) {
      console.error('Failed to update memo:', error)
      // 降级到本地存储
      const memos = getMemos()
      const updated = updateMemoStatus(memos, id, updates.status)
      return updated.find(m => m.id === id)
    }
  },

  // 删除备忘录
  deleteMemo: async (id) => {
    try {
      const { deleteMemo: deleteMemoAPI } = await import('./api')
      await deleteMemoAPI(id)
      const memos = getMemos()
      return deleteMemo(memos, id)
    } catch (error) {
      console.error('Failed to delete memo:', error)
      // 降级到本地存储
      const memos = getMemos()
      return deleteMemo(memos, id)
    }
  }
}
