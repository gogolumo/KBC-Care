// Mobile replacement for the web's right-hand .sheet panel: a bottom sheet in a Modal.
// Tap the backdrop, the close icon or the Android back button to close it.
import { useEffect, useRef } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';
import { colors, radius } from '../theme';

export default function Sheet({ visible, onClose, children }) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const offset = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      offset.setValue(height * 0.4);
      Animated.spring(offset, { toValue: 0, useNativeDriver: Platform.OS !== 'web', bounciness: 0, speed: 16 }).start();
    }
  }, [visible, height, offset]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
        <Animated.View
          style={[
            styles.sheet,
            { maxHeight: height * 0.9 - insets.top, paddingBottom: 12 + insets.bottom, transform: [{ translateY: offset }] },
          ]}
        >
          <View style={styles.handle} />
          <Pressable style={styles.close} onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
            <Icon name="close" color={colors.closeIcon} />
          </Pressable>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" bounces={false}>
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Shared typography for sheet content (.overline, .sheet h2, .sheet>p).
export function SheetTitle({ overline, title, text }) {
  return (
    <View style={styles.titleBlock}>
      {overline ? <Text style={styles.overline}>{overline}</Text> : null}
      <Text style={styles.title} accessibilityRole="header">{title}</Text>
      {text ? <Text style={styles.text}>{text}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.backdrop, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    shadowColor: '#0e2635',
    shadowOpacity: 0.23,
    shadowRadius: 35,
    shadowOffset: { width: 0, height: -12 },
    elevation: 16,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line, marginTop: 10 },
  close: { position: 'absolute', right: 18, top: 18, zIndex: 2, padding: 4 },
  content: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 12 },
  titleBlock: { marginBottom: 4, paddingRight: 28 },
  overline: { fontSize: 11, letterSpacing: 1.3, fontWeight: '800', color: '#55717f' },
  title: { fontSize: 24, color: '#173b52', fontWeight: '700', marginTop: 9, marginBottom: 9, letterSpacing: -0.4 },
  text: { fontSize: 14, color: '#647782', lineHeight: 22 },
});
