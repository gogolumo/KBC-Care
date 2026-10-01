// .kbc-logo from globals.css: "KBC" + "Care" wordmark set in text.
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function Logo({ small }) {
  return (
    <View style={styles.logo} accessibilityLabel="KBC Care">
      <Text style={[styles.kbc, small && styles.kbcSmall]}>KBC</Text>
      <Text style={[styles.care, small && styles.careSmall]}>Care</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  kbc: { fontSize: 21, fontWeight: '900', color: colors.dark, letterSpacing: -0.8 },
  kbcSmall: { fontSize: 19 },
  care: { fontSize: 14, fontWeight: '700', color: colors.blue },
  careSmall: { fontSize: 13 },
});
