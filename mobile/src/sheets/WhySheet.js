// "Why am I seeing this?" sheet (web: modal === 'why') + mobile "Pause this kind of help".
import { StyleSheet, Text, View } from 'react-native';
import Icon from '../components/Icon';
import { PrimaryButton, TextButton } from '../components/Buttons';
import { SheetTitle } from '../components/Sheet';
import { colors } from '../theme';

export default function WhySheet({ c }) {
  return (
    <View>
      <SheetTitle
        overline="WHY THIS APPEARED"
        title="You stay in control"
        text="We noticed a pattern across recent activity that may fit with exploring a home purchase. We use it only to decide whether this guidance might be useful."
      />
      <View style={styles.privacy}>
        <Icon name="shield" color={colors.blue} />
        <View style={styles.flex}>
          <Text style={styles.privacyTitle}>This is not a credit decision.</Text>
          <Text style={styles.privacyText}>
            It does not approve a loan or automatically start an application. You can dismiss it at any time.
          </Text>
        </View>
      </View>
      <PrimaryButton title="Yes, this is relevant" onPress={c.confirm} disabled={c.busy || !c.state} full />
      {c.state?.status === 'inferred' && (
        <TextButton
          title="Pause this kind of help"
          onPress={c.pause}
          disabled={c.busy}
          full
          icon={<Icon name="pause" size={15} color={colors.blue} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  privacy: { flexDirection: 'row', gap: 12, backgroundColor: colors.privacyBg, padding: 16, marginVertical: 22 },
  privacyTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  privacyText: { fontSize: 12, lineHeight: 18, marginTop: 5, color: '#667983' },
});
