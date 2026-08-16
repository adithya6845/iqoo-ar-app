import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Menu, Search, Bell, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <View style={styles.header}>
      {/* Left Hamburger Menu */}
      <TouchableOpacity style={styles.menuBtn}>
        <Menu size={20} color="#0F172A" />
      </TouchableOpacity>

      {/* Logo & Title */}
      <View style={styles.logoRow}>
        <View style={styles.logoIconBg}>
          <Activity size={20} color="#0284C7" />
        </View>
        <View>
          <Text style={styles.title}>MedTwin AR</Text>
          <Text style={styles.subtitle}>AI-Powered Health & Training</Text>
        </View>
      </View>

      {/* Right Icons: Search, Notification Bell with 3 Badge, and Avatar */}
      <View style={styles.iconRow}>
        <TouchableOpacity style={styles.iconBtn}>
          <Search size={17} color="#475569" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn}>
          <Bell size={17} color="#475569" />
          <View style={styles.notifBadge}>
            <Text style={styles.notifText}>3</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="John"
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuBtn: {
    padding: 4,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginLeft: 6,
  },
  logoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  title: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '500',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
});
