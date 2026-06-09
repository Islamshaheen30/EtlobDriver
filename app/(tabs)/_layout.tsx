import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { useOrders } from '@/hooks/useOrders';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { theme, t } = useApp();
  const { activeOrder, pendingOrders } = useOrders();
  const c = theme.colors;

  const tabBarStyle = {
    height: Platform.select({
      ios: insets.bottom + 64,
      android: insets.bottom + 64,
      default: 70,
    }),
    paddingTop: 8,
    paddingBottom: Platform.select({
      ios: insets.bottom + 8,
      android: insets.bottom + 8,
      default: 8,
    }),
    paddingHorizontal: 16,
    backgroundColor: c.surface,
    borderTopWidth: 1,
    borderTopColor: c.border,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('orders'),
          tabBarIcon: ({ color, size }) => (
            <View>
              <MaterialIcons name="receipt-long" size={size} color={color} />
              {pendingOrders.length > 0 && (
                <View style={{
                  position: 'absolute', top: -4, right: -6,
                  width: 16, height: 16, borderRadius: 8,
                  backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
                }}>
                  <MaterialIcons name="circle" size={6} color="#1A1A1A" />
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="active"
        options={{
          title: t('active'),
          tabBarIcon: ({ color, size }) => (
            <View>
              <MaterialIcons name="directions-bike" size={size} color={color} />
              {activeOrder && (
                <View style={{
                  position: 'absolute', top: -4, right: -6,
                  width: 10, height: 10, borderRadius: 5,
                  backgroundColor: '#4CAF50',
                }} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: t('earnings'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="account-balance-wallet" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
