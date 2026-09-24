import React, { useEffect } from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { connectSession } from './state/session';
import {
  SessionHeader,
  SessionProjectSummary,
  SessionProjectPicker,
  SessionMetroPanel,
  SessionDevicesPanel,
  SessionActivityPanel,
  SessionErrors,
} from './components/SessionPanels';
import { s } from './components/styles';

export default function App() {
  const { width } = useWindowDimensions();
  useEffect(connectSession, []);
  return (
    <View style={s.root}>
      <SessionHeader />
      <ScrollView contentContainerStyle={s.page}>
        <SessionProjectSummary />
        <SessionProjectPicker />
        <SessionErrors />
        <View style={[s.columns, width < 900 && { flexDirection: 'column' }]}>
          <View style={[s.sidebar, width < 900 && { width: '100%' }]}>
            <SessionMetroPanel />
            <SessionDevicesPanel />
          </View>
          <SessionActivityPanel />
        </View>
        <Text style={s.footer}>EXPOSED UI / YOUR PROJECT, IN VIEW.</Text>
      </ScrollView>
    </View>
  );
}
