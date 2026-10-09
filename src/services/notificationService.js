import { playNotificationSound } from './soundService';

export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const sendLocalNotification = (title, body, options = {}) => {
  try {
    playNotificationSound();
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        silent: true, // We handle audio via soundService
        ...options
      });
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
      return notif;
    }
  } catch (e) {
    console.debug('Notification error:', e);
  }
  return null;
};
