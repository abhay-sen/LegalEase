import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import LogoutButton from '../components/LogoutButton';
const HomeScreen = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  return (
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  info: { fontSize: 16, marginVertical: 4 },
});

export default HomeScreen;
