// src/services/authService.ts

import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '878260275499-0o6fd0hpn28ciceb7u6muitp36laofh1.apps.googleusercontent.com', 
    offlineAccess: true,// from Firebase Console
  });
};
