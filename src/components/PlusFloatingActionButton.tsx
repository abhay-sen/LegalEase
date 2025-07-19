import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { FAB } from 'react-native-paper';

interface PlusFloatingActionButtonProps {
  onScan: () => void;
  onPickPDF: () => void;
  disabled: boolean;
}

const PlusFloatingActionButton: React.FC<PlusFloatingActionButtonProps> = ({
  onScan,
  onPickPDF,
  disabled,
}) => {
  const handleFABPress = () => {
    Alert.alert(
      'Choose an Option',
      'What would you like to do?',
      [
        { text: 'Scan Document', onPress: onScan },
        { text: 'Pick PDF', onPress: onPickPDF },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  return (
    <FAB
      icon="plus"
      label="Upload"
      onPress={handleFABPress}
      style={styles.fab}
      disabled={disabled}
    />
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', // This is key to making it "float"
    right: 16,
    bottom: 32,
  },
});

export default PlusFloatingActionButton;