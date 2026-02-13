import React, { useState, useEffect } from 'react'
import { Bell, Plus, Check, Clock, X, Edit2, Calendar, Mail, LogOut, User, Shield } from 'lucide-react'
import MemoForm from './components/MemoForm'
import MemoCard from './components/MemoCard'
import Login from './components/Login'
import IOSCertCheck from './components/IOSCertCheck'
import { getMemos, saveMemos, updateMemoStatus, deleteMemo, postponeMemo } from './utils/storage'
import { isLoggedIn, getCurrentUser, logout } from './utils/auth'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [memos, setMemos] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingMemo, setEditingMemo] = useState(null)
  const [filter, setFilter] = useState('all') // all, pending, completed, expired
  const [currentView, setCurrentView] = useState('memos') // 'memos' or 'ios-cert'

  useEffect(() => {
    // 检查登录状态
    if (isLoggedIn()) {
      setIsAuthenticated(true)
      setCurrentUser(getCurrentUser())
      loadMemos()
    }
  }, [])

  const loadMemos = async () => {
    try {
      const { fetchMemos } = await import('./utils/api')
      const response = await fetchMemos({ status: 'all' })
      const memosData = response.memos || []
      setMemos(memosData)
    } catch (error) {
      console.error('Failed to load memos:', error)
      // 降级到本地存储
      const loadedMemos = getMemos()
      setMemos(loadedMemos)
    }
  }

  const handleAddMemo = async (memoData) => {
    try {
      const { createMemo, updateMemo } = await import('./utils/api')
      
      if (editingMemo) {
        // 编辑现有备忘录
        const updated = await updateMemo(editingMemo.id, {
          ...memoData,
          status: editingMemo.status
        })
        const newMemos = memos.map(memo => 
          memo.id === editingMemo.id ? updated : memo
        )
        setMemos(newMemos)
      } else {
        // 添加新备忘录
        const created = await createMemo(memoData)
        setMemos([created, ...memos])
      }
      
      setShowForm(false)
      setEditingMemo(null)
    } catch (error) {
      console.error('Failed to save memo:', error)
      alert('保存失败：' + error.message)
    }
  }

  const handleComplete = async (id) => {
    try {
      const { updateMemo } = await import('./utils/api')
      const memo = memos.find(m => m.id === id)
      if (memo) {
        const updated = await updateMemo(id, { ...memo, status: 'completed' })
        const newMemos = memos.map(m => m.id === id ? updated : m)
        setMemos(newMemos)
      }
    } catch (error) {
      console.error('Failed to complete memo:', error)
      alert('操作失败：' + error.message)
    }
  }

  const handleUncomplete = async (id) => {
    try {
      const { updateMemo } = await import('./utils/api')
      const memo = memos.find(m => m.id === id)
      if (memo) {
        const updated = await updateMemo(id, { ...memo, status: 'pending' })
        const newMemos = memos.map(m => m.id === id ? updated : m)
        setMemos(newMemos)
      }
    } catch (error) {
      console.error('Failed to uncomplete memo:', error)
      alert('操作失败：' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这条备忘录吗？')) {
      try {
        const { deleteMemo: deleteMemoAPI } = await import('./utils/api')
        await deleteMemoAPI(id)
        const newMemos = memos.filter(m => m.id !== id)
        setMemos(newMemos)
      } catch (error) {
        console.error('Failed to delete memo:', error)
        alert('删除失败：' + error.message)
      }
    }
  }

  const handleEdit = (memo) => {
    setEditingMemo(memo)
    setShowForm(true)
  }

  const handlePostpone = async (id, days) => {
    try {
      const { postponeMemo: postponeMemoAPI } = await import('./utils/api')
      const updated = await postponeMemoAPI(id, days)
      const newMemos = memos.map(m => m.id === id ? updated : m)
      setMemos(newMemos)
    } catch (error) {
      console.error('Failed to postpone memo:', error)
      alert('延期失败：' + error.message)
    }
  }

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setCurrentUser(userData)
    loadMemos()
  }

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      logout()
      setIsAuthenticated(false)
      setCurrentUser(null)
      setMemos([])
    }
  }

  const getFilteredMemos = () => {
    const now = new Date()
    
    switch (filter) {
      case 'pending':
        return memos.filter(memo => memo.status === 'pending' && new Date(memo.dueDate) > now)
      case 'completed':
        return memos.filter(memo => memo.status === 'completed')
      case 'expired':
        return memos.filter(memo => memo.status === 'pending' && new Date(memo.dueDate) <= now)
      default:
        return memos
    }
  }

  const filteredMemos = getFilteredMemos()

  const stats = {
    total: memos.length,
    pending: memos.filter(m => m.status === 'pending').length,
    completed: memos.filter(m => m.status === 'completed').length,
    expired: memos.filter(m => m.status === 'pending' && new Date(m.dueDate) <= new Date()).length
  }

  // 如果未登录，显示登录界面
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  // 如果是IOS证书检测视图，直接返回该组件
  if (currentView === 'ios-cert') {
    return <IOSCertCheck onBack={() => setCurrentView('memos')} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">智能备忘录</h1>
                {currentUser && (
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <User className="w-3 h-3 mr-1" />
                    {currentUser.username}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentView('ios-cert')}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-purple-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                title="iOS证书检测"
              >
                <Shield className="w-5 h-5" />
                <span className="hidden sm:inline">证书检测</span>
              </button>
              <button
                onClick={() => {
                  setEditingMemo(null)
                  setShowForm(true)
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">新建备忘</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                title="退出登录"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-600">全部</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm text-blue-600">进行中</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm text-green-600">已完成</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm text-red-600">已过期</div>
            <div className="text-2xl font-bold text-red-600 mt-1">{stats.expired}</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="bg-white rounded-xl p-1 shadow-sm inline-flex space-x-1">
          {[
            { key: 'all', label: '全部' },
            { key: 'pending', label: '进行中' },
            { key: 'completed', label: '已完成' },
            { key: 'expired', label: '已过期' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === key
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Memos List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {filteredMemos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无备忘录</h3>
            <p className="text-gray-500 mb-6">点击右上角按钮创建第一条备忘录吧！</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMemos.map(memo => (
              <MemoCard
                key={memo.id}
                memo={memo}
                onComplete={handleComplete}
                onUncomplete={handleUncomplete}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onPostpone={handlePostpone}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                {editingMemo ? '编辑备忘录' : '新建备忘录'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingMemo(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <MemoForm
              initialData={editingMemo}
              onSubmit={handleAddMemo}
              onCancel={() => {
                setShowForm(false)
                setEditingMemo(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
