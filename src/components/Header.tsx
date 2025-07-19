import React, { useState, useRef, useEffect } from 'react';
import { Menu, Divider } from 'react-native-paper';
import { Image, TouchableOpacity, StyleSheet, View } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
export const HeaderProfileMenu = () => {
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(visible);

  // Update ref when state changes
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const navigation =
      useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const handleAnchorPress = () => {
    if (visibleRef.current) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const user = auth().currentUser;

  const handleLogout = async () => {
    closeMenu();
    navigation.replace("Login");
    await auth().signOut();
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <TouchableOpacity
          onPress={handleAnchorPress}
          activeOpacity={0.7}
          style={styles.avatarContainer}
        >
          <Image
            source={{ uri: user?.photoURL || 'https://placehold.co/40x40' }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      }
    >
      <Menu.Item
        title={user?.email || 'No Email'}
        disabled
        titleStyle={styles.email}
      />
      <Divider />
      <Menu.Item onPress={handleLogout} title="Log out" />
    </Menu>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  email: {
    color: '#888',
    fontSize: 14,
  },
  avatarContainer: {
    padding: 8,
  },
});
