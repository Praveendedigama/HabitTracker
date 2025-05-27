import React from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

const App: React.FC = () => {
  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#F9FAFB" 
        translucent={false}
      />
      <AppNavigator />
    </>
  );
};

export default App;