import { useRef } from 'react'

export function useNotificationSound() {
  const audioRef = useRef(null)

  const playSound = () => {
    // Son de notification simple (beep)
    if (!audioRef.current) {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi78OScTQwNUKng77RgGwU7k9n0yH8rBSl+zPLaizsKFlux6+WgUBELTKXh8bllHAU2jdXzzIAuBSh60fDajDwKFl2354KdTgwOUqvm8LJeHAU8lNv1w38qBSyCz/TciDsIG2u98OF+WBAKTKjl8bZhGgU5kdn1yoUsBSh70O/akDsJF16z6uihUREMTqni8bllHAU3jdXzzIAuBSh60fDbizwKF12z5+GgUBEM');
      audioRef.current.volume = 0.3
    }
    try {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    } catch {}
  }

  return { playSound }
}