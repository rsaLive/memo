// 日期相关的辅助函数
import { format as dateFnsFormat, formatDistanceToNow, isPast, isFuture, addDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 格式化日期
export const formatDate = (date, formatStr = 'yyyy-MM-dd HH:mm') => {
  return dateFnsFormat(new Date(date), formatStr, { locale: zhCN })
}

// 相对时间
export const relativeTime = (date) => {
  return formatDistanceToNow(new Date(date), { locale: zhCN, addSuffix: true })
}

// 检查是否过期
export const isExpired = (date) => {
  return isPast(new Date(date))
}

// 检查是否未来时间
export const isFutureDate = (date) => {
  return isFuture(new Date(date))
}

// 添加天数
export const addDaysToDate = (date, days) => {
  return addDays(new Date(date), days)
}

// 获取提醒时间文本
export const getReminderText = (minutes) => {
  if (minutes === 0) return '到期时'
  if (minutes < 60) return `提前${minutes}分钟`
  if (minutes < 1440) return `提前${Math.floor(minutes / 60)}小时`
  if (minutes < 10080) return `提前${Math.floor(minutes / 1440)}天`
  return `提前${Math.floor(minutes / 10080)}周`
}

// 计算提醒时间
export const calculateReminderTime = (dueDate, reminderMinutes) => {
  const due = new Date(dueDate)
  const reminderTime = new Date(due.getTime() - reminderMinutes * 60 * 1000)
  return reminderTime
}

// 检查是否需要提醒
export const shouldRemind = (dueDate, reminderMinutes) => {
  const reminderTime = calculateReminderTime(dueDate, reminderMinutes)
  const now = new Date()
  return now >= reminderTime && now < new Date(dueDate)
}
