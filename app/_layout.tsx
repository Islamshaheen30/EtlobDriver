import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { AppProvider } from '@/contexts/AppContext';
import { OrderProvider } from '@/contexts/OrderContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AppProvider>
          <OrderProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </OrderProvider>
        </AppProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
