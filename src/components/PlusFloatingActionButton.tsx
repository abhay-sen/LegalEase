import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { FAB, Portal, Provider } from 'react-native-paper';
import { pick } from '@react-native-documents/picker';
import DocumentScanner from 'react-native-document-scanner-plugin';
import ConvertImagesToPDF from '../services/ConvertImagesToPdf'; // Ensure this service is implemented
const PlusFloatingActionButton: React.FC = () => {
  const handlePickPDF = async () => {
    try {
      const result = await pick({
        type: ['application/pdf'],
        allowMultiSelection: false,
      });

      console.log('📄 Picked PDF:', result[0]);
      // TODO: Handle PDF file upload/storage
    } catch (err: any) {
      if (err?.message !== 'USER_CANCELED') {
        console.error('❌ PDF Picker Error:', err);
      }
    }
  };

  const handleDocumentScan = async () => {
    try {
      const result = await DocumentScanner.scanDocument({
        maxNumDocuments: 10,
      });

      if (result?.scannedImages?.length > 0) {
        console.log('📄 Scanned Images:', result.scannedImages);
        try {
          const convertedPdfPath = await ConvertImagesToPDF(
            result.scannedImages,
          );
          console.log('✅ Converted PDF Path:', convertedPdfPath);

          // Upload to Supabase here
        } catch (pdfErr) {
          console.error('❌ PDF Conversion Error:', pdfErr);
        }
        
        // TODO: Convert scannedImages to PDF
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
