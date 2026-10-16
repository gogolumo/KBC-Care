// .notice.success / .notice.error from globals.css (+ an "info" tone for mobile-only messages).
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from './Icon';
import { colors } from '../theme';

const TONES = {
  success: { bg: colors.successBg, fg: colors.successText, icon: 'check' },
  info: { bg: colors.infoBg, fg: colors.infoText, icon: 'spark' },
  error: { bg: colors.errorBg, fg: colors.errorText, icon: null },
};

export default function Notice({ tone = 'success', text, onClose, onRetry }) {
  const t = TONES[tone] || TONES.success;
  return (
    <View style={[styles.notice, { backgroundColor: t.bg }]} accessibilityRole="alert" accessibilityLiveRegion="polite">
      {t.icon && <Icon name={t.icon} size={17} color={t.fg} />}
      <Text style={[styles.text, { color: t.fg }]}>{text}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} hitSlop={8} accessibilityRole="button">
          <Text style={[styles.action, { color: t.fg }]}>Retry</Text>
        </Pressable>
      )}
      {onClose && (
        <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button">
          <Text style={[styles.action, { color: t.fg }]}>Close</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  notice: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 18 },
  text: { flex: 1, fontSize: 13, lineHeight: 18 },
  action: { fontSize: 13, fontWeight: '700', marginLeft: 6 },
});
