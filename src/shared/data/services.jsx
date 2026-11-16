import { Camera, MessageCircle, Music2 } from 'lucide-react'

export const services = [
  {
    name: 'YouTube',
    description: 'Connect YouTube for AI Assistance',
    href: '/flow?step=1',
    available: true,
    icon: (
      <svg width="26" height="20" viewBox="0 0 24 18" aria-hidden="true">
        <rect x="1" y="1" width="22" height="16" rx="5" fill="currentColor" />
        <path d="M10 5v8l6-4-6-4Z" fill="white" />
      </svg>
    ),
    iconClass: 'bg-red-50 text-red-600',
  },
  {
    name: 'Facebook',
    description: 'Manage conversations from your Facebook audience.',
    href: '/facebook',
    available: true,
    icon: <span className="text-2xl font-bold leading-none" aria-hidden="true">f</span>,
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    name: 'Instagram',
    description: 'Respond to Instagram messages and comments.',
    href: null,
    available: false,
    icon: <Camera size={24} aria-hidden="true" />,
    iconClass: 'bg-pink-50 text-pink-600',
  },
  {
    name: 'TikTok',
    description: 'Discover AI-powered engagement for TikTok.',
    href: null,
    available: false,
    icon: <Music2 size={24} aria-hidden="true" />,
    iconClass: 'bg-gray-100 text-gray-900',
  },
  {
    name: 'WhatsApp',
    description: 'Manage WhatsApp Business conversations and leads.',
    href: '/whatsapp',
    available: true,
    icon: <MessageCircle size={24} aria-hidden="true" />,
    iconClass: 'bg-green-50 text-green-600',
  },
]
