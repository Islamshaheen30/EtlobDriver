import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { useOrders } from '@/hooks/useOrders';
import { useAlert } from '@/template';
import { RatingStars } from '@/components';

export default function ProfileScreen() {
  const { theme, t, isDark, toggleTheme, language, toggleLanguage, isRTL } = useApp();
  const { driver, isOnline, toggleOnlineStatus } = useOrders();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const c = theme.colors;

  const handleLogout = () => {
    showAlert(t('logout'), 'Are you sure you want to log out?', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logout'), style: 'destructive', onPress: () => {} },
    ]);
  };

  const menuSections = [
    {
      title: t('settings'),
      items: [
        {
          icon: 'dark-mode',
          label: t('darkMode'),
          right: <Switch value={isDark} onValueChange={toggleTheme} thumbColor={isDark ? Colors.primary : '#fff'} trackColor={{ false: '#555', true: Colors.primary + '55' }} />,
          onPress: toggleTheme,
        },
        {
          icon: 'language',
          label: t('language'),
          right: (
            <View style={[styles.langToggle, { backgroundColor: c.cardElevated }]}>
              {(['en', 'ar'] as const).map((lang) => (
                <Pressable
                  key={lang}
                  style={[styles.langBtn, language === lang && { backgroundColor: Colors.primary }]}
                  onPress={() => lang !== language && toggleLanguage()}
                >
                  <Text style={[styles.langBtnText, { color: language === lang ? '#1A1A1A' : c.textSecondary }]}>
                    {lang === 'en' ? 'EN' : 'AR'}
                  </Text>
                </Pressable>
              ))}
            </View>
          ),
          onPress: toggleLanguage,
        },
        {
          icon: 'notifications',
          label: t('notifications'),
          right: <MaterialIcons name="chevron-right" size={20} color={c.textMuted} />,
          onPress: () => showAlert(t('notifications'), 'Notification settings coming soon!'),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: 'history',
          label: t('deliveryHistory'),
          right: <MaterialIcons name="chevron-right" size={20} color={c.textMuted} />,
          onPress: () => showAlert(t('deliveryHistory'), 'Full history coming soon!'),
        },
        {
          icon: 'emoji-events',
          label: t('achievements'),
          right: <MaterialIcons name="chevron-right" size={20} color={c.textMuted} />,
          onPress: () => showAlert(t('achievements'), 'Achievements coming soon!'),
        },
        {
          icon: 'support-agent',
          label: t('support'),
          right: <MaterialIcons name="chevron-right" size={20} color={c.textMuted} />,
          onPress: () => showAlert(t('support'), 'Support chat coming soon!'),
        },
      ],
    },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingTop: insets.top }]}>

        {/* Profile Hero */}
        <View style={[styles.profileHero, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: driver.avatarUrl }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
            <View style={[styles.onlineBadge, { backgroundColor: isOnline ? '#4CAF50' : c.textMuted, borderColor: c.surface }]} />
          </View>

          <Text style={[styles.driverName, { color: c.text }]}>
            {language === 'ar' ? driver.nameAr : driver.name}
          </Text>
          <Text style={[styles.driverPhone, { color: c.textSecondary }]}>{driver.phone}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <RatingStars rating={driver.rating} size={20} />
            <Text style={[styles.ratingNumber, { color: c.text }]}>  {driver.rating.toFixed(1)}</Text>
            <Text style={[styles.ratingCount, { color: c.textMuted }]}>({driver.totalRatings} {t('totalRatings')})</Text>
          </View>

          {/* Stats */}
          <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>{driver.totalDeliveries.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: c.textMuted }]}>{t('totalDeliveries')}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: c.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>{driver.totalDistance.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: c.textMuted }]}>{t('km')}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: c.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>{driver.streakDays}</Text>
              <Text style={[styles.statLabel, { color: c.textMuted }]}>{t('streakDays')}</Text>
            </View>
          </View>

          {/* Online Toggle */}
          <Pressable
            style={[styles.onlineBtn, { backgroundColor: isOnline ? '#4CAF5022' : c.card, borderColor: isOnline ? '#4CAF50' : c.border }]}
            onPress={toggleOnlineStatus}
          >
            <View style={[styles.onlineDot, { backgroundColor: isOnline ? '#4CAF50' : c.textMuted }]} />
            <Text style={[styles.onlineBtnText, { color: isOnline ? '#4CAF50' : c.textSecondary }]}>
              {isOnline ? t('goOffline') : t('goOnline')}
            </Text>
          </Pressable>
        </View>

        {/* Vehicle Badge */}
        <View style={[styles.vehicleCard, { backgroundColor: c.card, borderColor: c.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.vehicleIcon, { backgroundColor: Colors.primary + '22' }]}>
            <MaterialIcons name="directions-bike" size={24} color={Colors.primary} />
          </View>
          <View style={[styles.vehicleInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start', marginLeft: isRTL ? 0 : Spacing.sm, marginRight: isRTL ? Spacing.sm : 0 }]}>
            <Text style={[styles.vehicleLabel, { color: c.textMuted }]}>{t('vehicleType')}</Text>
            <Text style={[styles.vehicleValue, { color: c.text }]}>{t('bicycle')}</Text>
          </View>
          <MaterialIcons name="verified" size={22} color={Colors.primary} />
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.textMuted }]}>{section.title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: c.card, borderColor: c.border }]}>
              {section.items.map((item, ii) => (
                <View key={ii}>
                  {ii > 0 && <View style={[styles.itemDivider, { backgroundColor: c.border }]} />}
                  <Pressable
                    style={({ pressed }) => [styles.menuItem, { flexDirection: isRTL ? 'row-reverse' : 'row', opacity: pressed ? 0.7 : 1 }]}
                    onPress={item.onPress}
                    hitSlop={{ top: 4, bottom: 4 }}
                  >
                    <View style={[styles.menuIcon, { backgroundColor: Colors.primary + '22' }]}>
                      <MaterialIcons name={item.icon as any} size={18} color={Colors.primary} />
                    </View>
                    <Text style={[styles.menuLabel, { color: c.text, marginLeft: isRTL ? 0 : Spacing.md, marginRight: isRTL ? Spacing.md : 0, flex: 1, textAlign: isRTL ? 'right' : 'left' }]}>
                      {item.label}
                    </Text>
                    {item.right}
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, { backgroundColor: c.card, borderColor: c.error + '44', opacity: pressed ? 0.7 : 1 }]}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={20} color={c.error} />
          <Text style={[styles.logoutText, { color: c.error }]}>{t('logout')}</Text>
        </Pressable>

        <Text style={[styles.version, { color: c.textMuted }]}>{t('version')}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingBottom: Spacing.xxl,
  },
  profileHero: {
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  driverName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  driverPhone: {
    fontSize: FontSize.md,
    marginBottom: Spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  ratingNumber: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  ratingCount: {
    fontSize: FontSize.sm,
    marginLeft: 4,
  },
  statsRow: {
    width: '100%',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  statLabel: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  onlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  vehicleCard: {
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  vehicleIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: {
    flex: 1,
    gap: 2,
  },
  vehicleLabel: {
    fontSize: FontSize.xs,
  },
  vehicleValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  section: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: FontSize.md,
  },
  itemDivider: {
    height: 1,
    marginLeft: 64,
  },
  langToggle: {
    flexDirection: 'row',
    borderRadius: Radius.full,
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    minWidth: 36,
    alignItems: 'center',
  },
  langBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  logoutBtn: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  logoutText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  version: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    marginTop: Spacing.lg,
  },
});
