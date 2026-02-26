import { useAuthStore } from '@/src/store/useAuthStore';
import { Stack } from 'expo-router';


export default function RootLayout() {
  const user = useAuthStore((state) => state.user);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="register" options={{ title: 'Registreren' }} />
      {user && (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}


