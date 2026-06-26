import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  GameDetail: { gameId: string };
  GamePlay: { gameId: string; roundLength: number; totalRounds: number; revealChoices: boolean };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type GameDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'GameDetail'>;
export type GamePlayScreenProps = NativeStackScreenProps<RootStackParamList, 'GamePlay'>;
