// .primary-btn / .secondary-btn / .text-btn from globals.css as native Pressables.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

function Base({ onPress, disabled, style, pressedStyle, children, label, testID }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      hitSlop={6}
      testID={testID}
      style={({ pressed }) => [style, pressed && !disabled && pressedStyle, disabled && styles.disabled]}
    >
      {children}
    </Pressable>
  );
}

export function PrimaryButton({ title, icon, full, style, ...props }) {
  return (
    <Base {...props} label={title} style={[styles.primary, full && styles.full, style]} pressedStyle={styles.primaryPressed}>
      <View style={styles.row}>
        {icon}
        <Text style={styles.primaryText}>{title}</Text>
      </View>
    </Base>
  );
}

export function SecondaryButton({ title, icon, full, style, ...props }) {
  return (
    <Base {...props} label={title} style={[styles.secondary, full && styles.full, style]} pressedStyle={styles.secondaryPressed}>
      <View style={styles.row}>
        {icon}
        <Text style={styles.secondaryText}>{title}</Text>
      </View>
    </Base>
  );
}

export function TextButton({ title, icon, full, underline, small, color = colors.blue, style, ...props }) {
  return (
    <Base {...props} label={title} style={[styles.text, full && styles.textFull, style]} pressedStyle={styles.textPressed}>
      <View style={styles.row}>
        {icon}
        <Text style={[styles.textLabel, { color }, small && styles.small, underline && styles.underline]}>{title}</Text>
      </View>
    </Base>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primary: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
    borderWidth: 1,
    borderRadius: radius.button,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryPressed: { backgroundColor: colors.dark, borderColor: colors.dark },
  primaryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  secondary: {
    backgroundColor: '#fff',
    borderColor: colors.secondaryBorder,
    borderWidth: 1,
    borderRadius: radius.button,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryPressed: { backgroundColor: colors.background },
  secondaryText: { color: '#34505f', fontSize: 14, fontWeight: '700' },
  text: { paddingVertical: 6, alignSelf: 'flex-start' },
  textFull: { alignSelf: 'stretch', paddingVertical: 12, marginTop: 6 },
  textPressed: { opacity: 0.6 },
  textLabel: { fontSize: 14, fontWeight: '700' },
  small: { fontSize: 12 },
  underline: { textDecorationLine: 'underline' },
  full: { alignSelf: 'stretch', marginTop: 10 },
  disabled: { opacity: 0.5 },
});
