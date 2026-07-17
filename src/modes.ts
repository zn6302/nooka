import { BookOpen, Zap, Users, Coffee, type LucideIcon } from 'lucide-react'

export type ModeId = 'focus' | 'open' | 'meeting' | 'recovery'

export interface Mode {
  id: ModeId
  name: string
  en: string
  desc: string
  color: string
  chipTextColor: string
  soft: string
  icon: LucideIcon
  defaultTransparency: number
}

export const MODES: Mode[] = [
  {
    id: 'focus',
    name: '專注模式',
    en: 'Focus',
    desc: '最高遮蔽，打造深度工作不受干擾的環境',
    color: '#d65a57',
    chipTextColor: '#d65a57',
    soft: '#fef0f0',
    icon: BookOpen,
    defaultTransparency: 80,
  },
  {
    id: 'open',
    name: '開放模式',
    en: 'Open',
    desc: '完全透明，適合輕鬆交流與非正式討論',
    color: '#6db08b',
    chipTextColor: '#6db08b',
    soft: '#ebf4ee',
    icon: Zap,
    defaultTransparency: 20,
  },
  {
    id: 'meeting',
    name: '會議模式',
    en: 'Meeting',
    desc: '完全模糊，適合線上會議與正式討論',
    color: '#3d5fa8',
    chipTextColor: '#3d5fa8',
    soft: '#eef2fa',
    icon: Users,
    defaultTransparency: 95,
  },
  {
    id: 'recovery',
    name: '恢復模式',
    en: 'Recovery',
    desc: '半透明，視覺適度遮蔽，營造輕鬆氛圍',
    color: '#8a5a9a',
    chipTextColor: '#7a4a8a',
    soft: '#f3eef9',
    icon: Coffee,
    defaultTransparency: 50,
  },
]

export const modeById = (id: ModeId): Mode => MODES.find((m) => m.id === id)!
