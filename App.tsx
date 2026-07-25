import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DarkTheme, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';

import { colors } from './src/theme/theme';
import { SidequestProvider } from './src/sidequests/SidequestContext';
import type { RootStackParamList } from './src/navigation/types';
import { HomeScreen } from './src/screens/HomeScreen';
import { GameDetailScreen } from './src/screens/GameDetailScreen';
import { GamePlayScreen } from './src/screens/GamePlayScreen';
import { CreateLobbyScreen } from './src/screens/CreateLobbyScreen';
import { JoinLobbyScreen } from './src/screens/JoinLobbyScreen';
import { WaitingRoomScreen } from './src/screens/WaitingRoomScreen';
import { MultiGameDetailScreen } from './src/screens/MultiGameDetailScreen';
import { WitlashGameScreen } from './src/screens/WitlashGameScreen';
import { OotlGameScreen } from './src/screens/OotlGameScreen';
import { SpymasterGameScreen } from './src/screens/SpymasterGameScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    primary: colors.primary,
    border: colors.border,
    notification: colors.primary,
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading the party…</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SidequestProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="GameDetail" component={GameDetailScreen} />
          <Stack.Screen
            name="GamePlay"
            component={GamePlayScreen}
            options={{ gestureEnabled: false, animation: 'fade' }}
          />
          <Stack.Screen name="CreateLobby" component={CreateLobbyScreen} />
          <Stack.Screen name="JoinLobby" component={JoinLobbyScreen} />
          <Stack.Screen name="WaitingRoom" component={WaitingRoomScreen} />
          <Stack.Screen name="MultiGameDetail" component={MultiGameDetailScreen} />
          <Stack.Screen
            name="WitlashGame"
            component={WitlashGameScreen}
            options={{ gestureEnabled: false, animation: 'fade' }}
          />
          <Stack.Screen
            name="OotlGame"
            component={OotlGameScreen}
            options={{ gestureEnabled: false, animation: 'fade' }}
          />
          <Stack.Screen
            name="SpymasterGame"
            component={SpymasterGameScreen}
            options={{ gestureEnabled: false, animation: 'fade' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      </SidequestProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    gap: 16,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 16,
  },
});
