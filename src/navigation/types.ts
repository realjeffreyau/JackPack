import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';

export type RootStackParamList = {
  Home: undefined;
  GameDetail: { gameId: string };
  GamePlay: { gameId: string; roundLength: number; totalRounds: number; revealChoices: boolean };
  CreateLobby: undefined;
  JoinLobby: undefined;
  WaitingRoom: { lobbyId: string };
  MultiGameDetail: { game?: 'witlash' | 'out-of-the-loop' | 'spymaster' } | undefined;
  WitlashGame: { lobbyId: string };
  OotlGame: { lobbyId: string };
  SpymasterGame: { lobbyId: string };
};

export type HomeTabParamList = {
  SinglePhone: undefined;
  MultiPhone: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type GameDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'GameDetail'>;
export type GamePlayScreenProps = NativeStackScreenProps<RootStackParamList, 'GamePlay'>;
export type CreateLobbyScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateLobby'>;
export type JoinLobbyScreenProps = NativeStackScreenProps<RootStackParamList, 'JoinLobby'>;
export type WaitingRoomScreenProps = NativeStackScreenProps<RootStackParamList, 'WaitingRoom'>;
export type MultiGameDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'MultiGameDetail'>;
export type WitlashGameScreenProps = NativeStackScreenProps<RootStackParamList, 'WitlashGame'>;
export type OotlGameScreenProps = NativeStackScreenProps<RootStackParamList, 'OotlGame'>;
export type SpymasterGameScreenProps = NativeStackScreenProps<RootStackParamList, 'SpymasterGame'>;

export type SinglePhoneScreenProps = CompositeScreenProps<
  MaterialTopTabScreenProps<HomeTabParamList, 'SinglePhone'>,
  NativeStackScreenProps<RootStackParamList>
>;
export type MultiPhoneScreenProps = CompositeScreenProps<
  MaterialTopTabScreenProps<HomeTabParamList, 'MultiPhone'>,
  NativeStackScreenProps<RootStackParamList>
>;
