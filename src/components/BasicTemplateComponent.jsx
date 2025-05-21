import React from 'react';
import {Text, View, StyleSheet} from 'react-native';

const MyComponent = ({title}) => {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    padding: 16,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
  },
});

export default MyComponent;
