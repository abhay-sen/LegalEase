import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Text, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
} from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useUserStore } from "./../store/useUserStore";

const LoginScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const user = useUserStore(state => state.user);
  const setUser = useUserStore(state => state.setUser);

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged(u => {
      setUser(u);
      if (u) {
        console.log('👤 User state changed:', u);
        console.log('👤 User signed in:', u.displayName);
        setUser(u);
      } else {
        console.log('🚪 User signed out');
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);
  useEffect(() => {
    if (user) {
      navigation.replace('Home');
    }
  }, [user, navigation]);
  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const response = await GoogleSignin.signIn();
      const { idToken } = response.data;

      if (!idToken) throw new Error('No idToken returned from Google Sign-In');

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(getAuth(), credential);
      navigation.replace('Home');
    } catch (error: any) {
      console.error('🔥 Sign-In Error:', JSON.stringify(error, null, 2));
      Alert.alert('Sign-In Failed', error.message || 'Unknown error');
    }
  };

  const signOutFromGoogle = async () => {
    try {
      await GoogleSignin.revokeAccess(); // revoke Google token
      await GoogleSignin.signOut(); // sign out from Google
      await getAuth().signOut(); // sign out from Firebase
      Alert.alert('Signed out', 'You have been signed out successfully.');
    } catch (error: any) {
      console.error('❌ Sign-Out Error:', error);
      Alert.alert('Sign-Out Failed', error.message || 'Unknown error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👋 Welcome to LegalEase</Text>
      <Button title="Sign In with Google" onPress={signInWithGoogle} />
      {user && (
        <>
          <Text style={styles.userText}>👤 {user.displayName}</Text>
          <Text style={styles.userText}>📧 {user.email}</Text>
          <Button title="Sign Out" onPress={signOutFromGoogle} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: { fontSize: 24, marginBottom: 16 },
  userText: { fontSize: 16, marginVertical: 10 },
});

export default LoginScreen;
