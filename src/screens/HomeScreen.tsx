import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import {
  Portal,
  Provider,
  Modal,
  Text,
  ProgressBar,
  MD3Colors,
} from 'react-native-paper';
import { pick } from '@react-native-documents/picker';
import DocumentScanner from 'react-native-document-scanner-plugin';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Local Imports
import ReportsDisplay from '../components/ReportDisplay';
import PlusFloatingActionButton from '../components/PlusFloatingActionButton';
import { getUserReports, getLegalReport, inserReportToTable } from '../api/api';
import ConvertImagesToPDF from '../services/ConvertImagesToPdf';
import { uploadToSupabase } from '../services/uploadToSupabase';
import uploadFileToSupabase from '../services/uploadFileToSupabase';
import type { RootStackParamList } from '../../App';
import { useUserStore } from '../store/useUserStore';

const HomeScreen = () => {
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState(auth().currentUser);
  const [reports, setReports] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true); // For fetching reports

  // State for the upload process
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const loggedInUser = user;

  // --- DATA FETCHING & SIDE EFFECTS ---
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(activeUser => {
      setUser(activeUser);
      // FIX: Ensure navigation is ready before trying to use it.
      if (!activeUser && navigation) {
        navigation.replace('Login');
      }
    });
    return subscriber; // Unsubscribe on unmount
  }, [navigation]); // Keep dependency on navigation

  const loadReports = useCallback(async () => {
    // Use loggedInUser from store for consistency
    if (!loggedInUser) {
      setReports([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Assuming getUserReports uses the logged-in user's ID implicitly or via a global state
    const data = await getUserReports();
    setReports(data || []);
    setLoading(false);
  }, [loggedInUser]); // Depend on the user from the store

  useEffect(() => {
    if (loggedInUser) {
      loadReports();
    }
  }, [loadReports, loggedInUser]);

  // --- UPLOAD LOGIC ---
  const resetUploadState = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadMessage('');
  };

  const handlePickPDF = async () => {
    setIsUploading(true);
    try {
      const file = await pick({
        type: ['application/pdf'],
        allowMultiSelection: false,
      });

      // FIX: Consistently use loggedInUser from the store
      if (!file?.[0]?.uri || !loggedInUser?.uid) {
        resetUploadState();
        return;
      }

      setUploadMessage('Uploading PDF...');
      setUploadProgress(0.25);
      const publicUrl = await uploadToSupabase(
        file[0].uri,
        file[0].name,
        loggedInUser.uid,
      );

      if (!publicUrl) {
        throw new Error('File upload failed: public URL is undefined.');
      }


      setUploadMessage('Analyzing document...');
      setUploadProgress(0.6);
      const str = await getLegalReport(publicUrl);

      setUploadMessage('Saving report...');
      setUploadProgress(0.9);
      await inserReportToTable(publicUrl, str, loggedInUser.uid);

      await loadReports();
      Alert.alert('Success', 'PDF uploaded and report generated successfully.');
    } catch (error: any) {
      if (error?.message !== 'USER_CANCELED') {
        console.error('❌ PDF Upload Error:', error);
        Alert.alert('Error', 'Failed to upload PDF. Please try again.');
      }
    } finally {
      resetUploadState();
    }
  };

  const handleDocumentScan = async () => {
    setIsUploading(true);
    try {
      const result = await DocumentScanner.scanDocument({
        maxNumDocuments: 20,
      });

      if (result?.scannedImages?.length > 0) {
        // FIX: Consistently use loggedInUser from the store
        if (!loggedInUser?.uid) {
          resetUploadState();
          Alert.alert('Error', 'User not found. Please log in again.');
          return;
        }

        setUploadMessage('Converting images to PDF...');
        setUploadProgress(0.2);
        const convertedPdfPath = await ConvertImagesToPDF(result.scannedImages);

        setUploadMessage('Uploading document...');
        setUploadProgress(0.5);
        const publicUrl = await uploadFileToSupabase(
          convertedPdfPath,
          loggedInUser.uid,
        );

        setUploadMessage('Analyzing document...');
        setUploadProgress(0.8);
        const str = await getLegalReport(publicUrl);

        setUploadMessage('Saving report...');
        setUploadProgress(0.95);
        await inserReportToTable(publicUrl, str, loggedInUser.uid);

        await loadReports();
        Alert.alert(
          'Success',
          'Document scanned and report generated successfully.',
        );
      }
    } catch (err: any) {
      if (err?.message !== 'USER_CANCELED') {
        console.error('❌ Document Scan Error:', err);
        Alert.alert('Error', 'Failed to process document. Please try again.');
      }
    } finally {
      resetUploadState();
    }
  };

  // --- RENDER LOGIC ---
  const renderContent = () => {
    if (loading && reports === null) {
      return <ActivityIndicator style={styles.centered} size="large" />;
    }

    if (reports && reports.length > 0) {
      return (
        <ReportsDisplay
          reports={reports}
          isRefreshing={loading}
          onRefresh={loadReports}
        />
      );
    }

    return (
      <View style={styles.centered}>
        <Text style={styles.info}>No reports available.</Text>
        <Text style={styles.info}>Pull down to refresh.</Text>
      </View>
    );
  };

  return (
    <Provider>
      <Portal>
        {/* Full-screen modal for loading indicator */}
        <Modal
          visible={isUploading}
          dismissable={false}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.loaderBox}>
            <Text style={styles.loadingText}>{uploadMessage}</Text>
            <ProgressBar
              progress={uploadProgress}
              color={MD3Colors.primary50}
              style={styles.progressBar}
            />
          </View>
        </Modal>
      </Portal>

      <View style={styles.screen}>
        {/* The main content now correctly fills the screen */}
        {user && renderContent()}

        {/* The FAB floats on top of the content */}
        {user && (
          <PlusFloatingActionButton
            onPickPDF={handlePickPDF}
            onScan={handleDocumentScan}
            disabled={isUploading || loading}
          />
        )}
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  info: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  // Styles for the upload modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  loaderBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  loadingText: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '500',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
  },
});

export default HomeScreen;
