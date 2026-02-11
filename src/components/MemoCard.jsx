import React, { useState } from 'react'
import { Check, Clock, Mail, Edit2, Trash2, Calendar, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDistanceToNow, format, isPast } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const MemoCard = ({ memo, onComplete, onUncomplete, onDelete, onEdit, onPostpone }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [showPostpone, setShowPostpone] = useState(false)

  // 支持后端返回的字段名（snake_case）和前端的字段名（camelCase）
  const dueDateField = memo.due_date || memo.dueDate
  const reminderMinutesField = memo.reminder_minutes || memo.reminderMinutes
  
  const dueDate = new Date(dueDateField)
  const isExpired = isPast(dueDate) && memo.status === 'pending'
  const isCompleted = memo.status === 'completed'

  const getStatusColor = () => {
    if (isCompleted) return 'border-green-500 bg-green-50'
    if (isExpired) return 'border-red-500 bg-red-50'
    return 'border-blue-500 bg-white'
  }

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Check className="w-3 h-3 mr-1" />
          已完成
        </span>
      )
    }
    if (isExpired) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          已过期
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <Clock className="w-3 h-3 mr-1" />
        进行中
      </span>
    )
  }

  const getReminderText = () => {
    const minutes = reminderMinutesField
    if (minutes === 0) return '到期时提醒'
    if (minutes < 60) return `提前${minutes}分钟`
    if (minutes < 1440) return `提前${minutes / 60}小时`
    if (minutes < 10080) return `提前${minutes / 1440}天`
    return `提前${minutes / 10080}周`
  }

  const handlePostpone = (days) => {
    onPostpone(memo.id, days)
    setShowPostpone(false)
  }

  return (
    <div className={`border-l-4 ${getStatusColor()} rounded-lg shadow-sm hover:shadow-md transition-all animate-slide-in`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className={`text-lg font-semibold mb-2 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {memo.title}
            </h3>
            {getStatusBadge()}
          </div>
          <div className="flex space-x-1 ml-2">
            {!isCompleted && (
              <>
                <button
                  onClick={() => onEdit(memo)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="编辑"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onComplete(memo.id)}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="标记完成"
                >
                  <Check className="w-4 h-4" />
                </button>
              </>
            )}
            {isCompleted && (
              <button
                onClick={() => onUncomplete(memo.id)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="取消完成"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onDelete(memo.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Due Date */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span className={isExpired ? 'text-red-600 font-medium' : ''}>
              {format(dueDate, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
            </span>
            <span className="ml-2 text-gray-400">
              ({formatDistanceToNow(dueDate, { locale: zhCN, addSuffix: true })})
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>{getReminderText()}</span>
          </div>

          {memo.email && (
            <div className="flex items-center text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              <span className="truncate">{memo.email}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {memo.description && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {showDetails ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
              {showDetails ? '收起详情' : '查看详情'}
            </button>
            {showDetails && (
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                {memo.description}
              </p>
            )}
          </div>
        )}

        {/* Postpone */}
        {!isCompleted && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            {!showPostpone ? (
              <button
                onClick={() => setShowPostpone(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                延期备忘录
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">延期至：</p>
                <div className="flex flex-wrap gap-2">
                  {[1, 3, 7, 14, 30].map(days => (
                    <button
                      key={days}
                      onClick={() => handlePostpone(days)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      {days}天后
                    </button>
                  ))}
                  <button
                    onClick={() => setShowPostpone(false)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MemoCard
