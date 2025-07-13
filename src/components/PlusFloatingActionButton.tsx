import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { FAB, Portal, Provider } from 'react-native-paper';
import { pick } from '@react-native-documents/picker';
import DocumentScanner from 'react-native-document-scanner-plugin';
import ConvertImagesToPDF from '../services/ConvertImagesToPdf'; // Ensure this service is implemented
import { useUserStore } from './../store/useUserStore'; // Ensure this store is implemented
 // Ensure this service is implemented
import {uploadToSupabase} from './../services/uploadToSupabase'; // Ensure this service is implemented
import uploadFileToSupabase from './../services/uploadFileToSupabase'; // Ensure this service is implemented
import { getLegalReport, inserReportToTable } from '../api/api';
const PlusFloatingActionButton: React.FC = () => {
  const user = useUserStore(state => state.user);
  const handlePickPDF = async () => {
    try {
      const file = await pick({
        type: ['application/pdf'],
        allowMultiSelection: false,
      });

      if (!file?.[0]?.uri || !user?.uid) {
        console.log('No file selected or user not logged in');
        return;
      }

      const publicUrl = await uploadToSupabase(
        file[0].uri,
        file[0].name,
        user.uid,
      );

      console.log('✅ Uploaded PDF URL:', publicUrl);
      const str=await getLegalReport(publicUrl);
      console.log(str);
      const data=await inserReportToTable(publicUrl,str,user?.uid);
      console.log(data);
      // Use `publicUrl` in your app (e.g., save to database)
    } catch (error) {
      if (error?.message !== 'USER_CANCELED') {
        console.error('❌ PDF Upload Error:', error);
        // Optional: Show error toast to user
      }
    }
  };

  const handleDocumentScan = async () => {
    try {
      const result = await DocumentScanner.scanDocument({
        maxNumDocuments: 20,
      });

      if (result?.scannedImages?.length > 0) {
        console.log('📄 Scanned Images:', result.scannedImages);
        try {
          const convertedPdfPath = await ConvertImagesToPDF(
            result.scannedImages,
          );
          console.log('✅ Converted PDF Path:', convertedPdfPath);

          // Upload to Supabase
          const publicUrl = await uploadFileToSupabase(
            convertedPdfPath,
            user?.uid,
          );
          console.log('📤 Supabase PDF URL:', publicUrl);
          const str = await getLegalReport(publicUrl);
          console.log(str);
          const data = await inserReportToTable(publicUrl, str, user?.uid);
          console.log(data);
        } catch (pdfErr) {
          console.error('❌ PDF Conversion Error:', pdfErr);
        }
      }
    } catch (err: any) {
      if (err?.message !== 'USER_CANCELED') {
        console.error('❌ Document Scan Error:', err);
      }
    }
  };
  const handleFABPress = () => {
    Alert.alert(
      'Choose an Option',
      'What do you want to do?',
      [
        {
          text: 'Scan Document',
          onPress: handleDocumentScan,
        },
        {
          text: 'Pick PDF',
          onPress: handlePickPDF,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <Provider>
      <Portal>
        <FAB
          icon="plus"
          label="Upload"
          onPress={handleFABPress}
          style={styles.fab}
        />
      </Portal>
    </Provider>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 32,
  },
});

export default PlusFloatingActionButton;
