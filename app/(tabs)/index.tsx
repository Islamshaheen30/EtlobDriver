
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, TouchableOpacity } from 'react-native';
import { supabase } from '@/services/supabaseClient';
import { Database } from '@/services/supabase_types';

type Order = Database['public']['Tables']['orders']['Row'];

export default function DriverDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableOrders();

    const subscription = supabase
      .channel('available_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchAvailableOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchAvailableOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending');
    
    if (data) setOrders(data);
    setLoading(false);
  };

  const acceptOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'accepted', driver_id: (await supabase.auth.getUser()).data.user?.id })
      .eq('id', orderId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>الطلبات المتاحة</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <Text>طلب رقم: {item.id}</Text>
            <Text>المبلغ: {item.total_amount} ج.م</Text>
            <TouchableOpacity onPress={() => acceptOrder(item.id)} style={styles.button}>
              <Text style={styles.buttonText}>قبول الطلب</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  orderCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15 },
  button: { backgroundColor: '#2ecc71', padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});
