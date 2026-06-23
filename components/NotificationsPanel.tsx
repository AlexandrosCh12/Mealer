/**
 * Dropdown notifications panel on the Home screen.
 *
 * Slides down from the top-right with spring animation. Uses mock data today;
 * parent manages read state via onMarkRead. Tapping a notification routes
 * by type (e.g. streak → profile).
 */
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';

export interface Notification {
  id: string;
  type: 'plan' | 'streak' | 'water' | 'motivation';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onNotificationPress: (notification: Notification) => void;
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'plan',
    title: 'Your daily plan is ready',
    body: 'Scrambled Eggs & Toast for breakfast. Tap to view.',
    time: 'Just now',
    read: false,
  },
  {
    id: '2',
    type: 'motivation',
    title: 'Daily inspiration',
    body: '"Take care of your body. It\'s the only place you have to live." — Jim Rohn',
    time: '8:00 AM',
    read: false,
  },
  {
    id: '3',
    type: 'water',
    title: 'Stay hydrated 💧',
    body: "You've had 3 glasses today. Goal is 8. Keep it up!",
    time: '11:00 AM',
    read: true,
  },
  {
    id: '4',
    type: 'streak',
    title: '7 day streak! 🔥',
    body: "You've been hitting your goals for 7 days in a row.",
    time: 'Yesterday',
    read: true,
  },
];

/** Count of unread items in the static mock notification list. */
export function getUnreadNotificationCount(): number {
  return MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
}

/** Slide-down panel listing notifications with type-colored icons. */
export default function NotificationsPanel({
  visible,
  onClose,
  notifications,
  onNotificationPress,
}: Props) {
  const slideAnim = React.useRef(new Animated.Value(-320)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 12,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -320,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  if (!visible) return null;

  const typeColors = {
    plan: '#8b5cf6',
    streak: '#f59e0b',
    water: '#60a5fa',
    motivation: '#4ade80',
  };

  const typeIcons = {
    plan: '🍽️',
    streak: '🔥',
    water: '💧',
    motivation: '✨',
  };

  return (
    <>
      <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[styles.panel, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Notifications</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {notifications.map((notif) => (
            <Pressable
              key={notif.id}
              onPress={() => onNotificationPress(notif)}
              style={({ pressed }) => [
                styles.notifRow,
                !notif.read && styles.notifUnread,
                pressed && { backgroundColor: 'rgba(139,92,246,0.08)' },
              ]}
            >
              <View
                style={[
                  styles.notifIcon,
                  { backgroundColor: typeColors[notif.type] + '20' },
                ]}
              >
                <Text style={styles.notifEmoji}>{typeIcons[notif.type]}</Text>
              </View>
              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={styles.notifBody}>{notif.body}</Text>
                <Text style={styles.notifTime}>{notif.time}</Text>
              </View>
              {!notif.read ? <View style={styles.unreadDot} /> : null}
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 99,
  },
  panel: {
    position: 'absolute',
    top: 80,
    right: 14,
    width: 300,
    backgroundColor: '#110d1f',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
    zIndex: 100,
    maxHeight: 400,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 20,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139,92,246,0.1)',
  },
  panelTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  notifUnread: {
    backgroundColor: 'rgba(139,92,246,0.04)',
  },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifEmoji: {
    fontSize: 16,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 3,
  },
  notifBody: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 4,
  },
  notifTime: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 10,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8b5cf6',
    marginTop: 4,
    flexShrink: 0,
  },
});
