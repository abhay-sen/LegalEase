import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import LogoutButton from '../components/LogoutButton';
import PlusFloatingActionButton from '../components/PlusFloatingActionButton';
import { getUserReports } from '../api/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useNavigation } from '@react-navigation/native';
const HomeScreen = () => {
  const user = auth().currentUser;
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useEffect(() => {
    if(!user) return;
    const loadReports = async () => {
      setLoading(true);
      const data = await getUserReports();
      if (data) {
        setReports(data);
      }
      setLoading(false);
    };

    loadReports();
  }, [user]);
  useEffect(() => {
    if (user == null) {
      navigation.replace('Login');
    }
  }, [user, navigation]);
  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>🏠 Welcome to Home</Text>

        {user ? (
          <>
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            <Text style={styles.info}>👤 {user.displayName}</Text>
            <Text style={styles.info}>📧 {user.email}</Text>
            <LogoutButton title="Sign Out" />
          </>
        ) : (
          <Text style={styles.info}>User not logged in.</Text>
        )}
      </View>

      {/* Floating Action Button */}
      <PlusFloatingActionButton />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginVertical: 4,
  },
});

export default HomeScreen;
