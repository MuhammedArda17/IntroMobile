import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[matchId]" options={{ headerShown: false }} />
      <Stack.Screen name="create-match" options={{ title: 'Wedstrijd aanmaken', headerBackTitle: 'Terug' }} />
      <Stack.Screen name="search-match" options={{ title: 'Wedstrijd zoeken', headerBackTitle: 'Terug' }} />
      <Stack.Screen name="results" options={{ title: 'Resultaten', headerBackTitle: 'Terug' }} />
    </Stack>
  );
}