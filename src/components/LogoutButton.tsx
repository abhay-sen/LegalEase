import React from 'react';
import { Button, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  // Add more routes if needed
};

type LogoutButtonProps = {
  title?: string;
};

const LogoutButton: React.FC<LogoutButtonProps> = ({ title = 'Sign Out' }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const signOutFromGoogle = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await auth().signOut();
      navigation.replace('Login'); // 👈 Redirect to login screen
    } catch (error) {
      console.error('Sign-out error:', error);
      Alert.alert('Error', 'Could not sign out. Try again.');
    }
  };

  return <Button title={title} onPress={signOutFromGoogle} />;
};

export default LogoutButton;
