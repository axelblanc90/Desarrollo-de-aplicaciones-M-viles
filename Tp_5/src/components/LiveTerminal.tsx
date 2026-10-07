import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';

interface LiveTerminalProps {
  logs: string[];
  title?: string;
}

export const LiveTerminal: React.FC<LiveTerminalProps> = ({ logs, title = 'Terminal SSH / SNMP' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
          <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
          <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <ScrollView style={styles.terminalBody} nestedScrollEnabled>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>
            {log}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.terminalBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.terminalBorder,
    overflow: 'hidden',
    marginVertical: 10,
  },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.terminalBorder,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  terminalBody: {
    padding: 12,
    maxHeight: 180,
  },
  logText: {
    color: Colors.terminalText,
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },
});
