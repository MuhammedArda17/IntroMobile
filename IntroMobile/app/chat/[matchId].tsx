import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { sendMessage, subscribeToMessages, getMatchDetails } from '../../src/firebase/chat';

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [messages, setMessages] = useState<any[]>([]);
  const [matchDetails, setMatchDetails] = useState<any>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    getMatchDetails(matchId as string).then((match) => {
      setMatchDetails(match);
    });

    const unsubscribe = subscribeToMessages(matchId as string, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [matchId]);

  const handleSend = async () => {
    if (!text.trim()) return;

    try {
      await sendMessage(matchId as string, {
        userId: user!.uid,
        userName: user!.name,
        text: text.trim()
      });
      setText('');
    } catch (error) {
      console.error('Fout bij versturen bericht');
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.userId === user?.uid;
    const isSystem = item.type === 'system';

    if (isSystem) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemText}>{item.text}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        {!isMe && <Text style={styles.senderName}>{item.userName}</Text>}
        <View style={[styles.messageBubble, isMe && styles.messageBubbleMe]}>
          <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
            {item.createdAt?.toDate?.()?.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen options={{
        title: 'Match chat',
        headerShown: true,
        headerBackTitle: 'Terug'
      }} />

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Schrijf een bericht..."
          placeholderTextColor="#888"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  messagesList: { padding: 16, paddingBottom: 8 },
  systemMessage: { alignItems: 'center', marginVertical: 8 },
  systemText: { fontSize: 12, color: '#888', backgroundColor: '#e8e8e8', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  messageRow: { marginBottom: 12, alignItems: 'flex-start' },
  messageRowMe: { alignItems: 'flex-end' },
  senderName: { fontSize: 12, color: '#888', marginBottom: 2, marginLeft: 4 },
  messageBubble: { backgroundColor: '#fff', borderRadius: 16, padding: 12, maxWidth: '75%', borderBottomLeftRadius: 4 },
  messageBubbleMe: { backgroundColor: '#007AFF', borderBottomLeftRadius: 16, borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, color: '#333' },
  messageTextMe: { color: '#fff' },
  messageTime: { fontSize: 11, color: '#aaa', marginTop: 4, alignSelf: 'flex-end' },
  messageTimeMe: { color: 'rgba(255,255,255,0.7)' },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'flex-end' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, fontSize: 15, maxHeight: 100, backgroundColor: '#f9f9f9' },
  sendButton: { marginLeft: 8, backgroundColor: '#007AFF', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: '#aaa' },
  sendButtonText: { color: '#fff', fontSize: 18 },
});