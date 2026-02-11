import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Mail, AlertCircle } from 'lucide-react'

const MemoForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '09:00',
    reminderMinutes: 30,
    email: ''
  })

  useEffect(() => {
    if (initialData) {
      // 支持后端返回的字段名（snake_case）和前端的字段名（camelCase）
      const dueDateField = initialData.due_date || initialData.dueDate
      const reminderMinutesField = initialData.reminder_minutes || initialData.reminderMinutes
      
      const dueDateTime = new Date(dueDateField)
      const date = dueDateTime.toISOString().split('T')[0]
      const time = dueDateTime.toTimeString().slice(0, 5)
      
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        dueDate: date,
        dueTime: time,
        reminderMinutes: reminderMinutesField,
        email: initialData.email || ''
      })
    }
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 组合日期和时间
    const dueDateTimeString = `${formData.dueDate}T${formData.dueTime}:00`
    const dueDateTime = new Date(dueDateTimeString)
    
    // 后端API使用snake_case
    onSubmit({
      title: formData.title,
      description: formData.description,
      due_date: dueDateTime.toISOString(),
      reminder_minutes: parseInt(formData.reminderMinutes),
      email: formData.email
    })
  }

  const reminderOptions = [
    { value: 0, label: '到期时提醒' },
    { value: 15, label: '提前15分钟' },
    { value: 30, label: '提前30分钟' },
    { value: 60, label: '提前1小时' },
    { value: 120, label: '提前2小时' },
    { value: 360, label: '提前6小时' },
    { value: 1440, label: '提前1天' },
    { value: 2880, label: '提前2天' },
    { value: 10080, label: '提前1周' }
  ]

  // 获取当前日期时间（用于最小值）
  const now = new Date()
  const minDate = now.toISOString().split('T')[0]
  const minTime = formData.dueDate === minDate ? now.toTimeString().slice(0, 5) : '00:00'

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* 标题 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          标题 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="输入备忘录标题..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* 描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          描述
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="添加详细描述..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
        />
      </div>

      {/* 到期日期和时间 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            到期日期 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            min={minDate}
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            到期时间 <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            required
            min={formData.dueDate === minDate ? minTime : undefined}
            value={formData.dueTime}
            onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* 提醒时间 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <AlertCircle className="w-4 h-4 inline mr-1" />
          提醒时间 <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.reminderMinutes}
          onChange={(e) => setFormData({ ...formData, reminderMinutes: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
        >
          {reminderOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 邮箱 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Mail className="w-4 h-4 inline mr-1" />
          通知邮箱
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="your@email.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        <p className="mt-2 text-sm text-gray-500">
          到期时后端会发送邮件提醒到此邮箱
        </p>
      </div>

      {/* 按钮 */}
      <div className="flex space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          取消
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg"
        >
          {initialData ? '保存修改' : '创建备忘录'}
        </button>
      </div>
    </form>
  )
}

export default MemoForm
