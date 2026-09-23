import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getQueuedReadings, syncQueuedReadings } from '../services/offlineQueue';
import { isSupabaseConfigured, supabase } from '../services/supabase';
import { colors } from '../theme/colors';

export const OfflineBanner: React.FC = () => {
  const [queuedCount, setQueuedCount] = useState<number>(0);
  const [syncing, setSyncing] = useState<boolean>(false);

  useEffect(() => {
    async function checkQueue() {
      const list = await getQueuedReadings();
      setQueuedCount(list.length);
    }
    checkQueue();
    const interval = setInterval(checkQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncNow = async () => {
    if (!isSupabaseConfigured || queuedCount === 0) return;
    setSyncing(true);
    try {
      await syncQueuedReadings(supabase);
      const remaining = await getQueuedReadings();
      setQueuedCount(remaining.length);
    } finally {
      setSyncing(false);
    }
  };

  if (queuedCount === 0) return null;

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="cloud-sync-outline" size={18} color="#FFFFFF" />
      <Text style={styles.text}>
        {queuedCount} lectura{queuedCount > 1 ? 's' : ''} manual{queuedCount > 1 ? 'es' : ''} pendiente{queuedCount > 1 ? 's' : ''} de sincronizar
      </Text>
      {isSupabaseConfigured && (
        <TouchableOpacity
          style={styles.button}
          onPress={handleSyncNow}
          disabled={syncing}
        >
          <Text style={styles.buttonText}>{syncing ? '...' : 'Sincronizar'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.accentAmber,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  buttonText: {
    color: colors.accentAmber,
    fontSize: 11,
    fontWeight: '700',
  },
});
