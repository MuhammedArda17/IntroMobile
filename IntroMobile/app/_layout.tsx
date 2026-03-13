import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="register" options={{ title: 'Registreren' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="create-match" options={{ title: 'Wedstrijd aanmaken' }} />
      <Stack.Screen name="search-match" options={{ title: 'Wedstrijd zoeken' }} />
    </Stack>
  );
}