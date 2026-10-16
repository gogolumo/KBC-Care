// Demo operator panel (web: modal === 'demo') + mobile-only "Server" settings.
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from '../components/Icon';
import { PrimaryButton, SecondaryButton, TextButton } from '../components/Buttons';
import { SheetTitle } from '../components/Sheet';
import { DEMO_EVENTS } from '../data';
import { colors, radius } from '../theme';

export default function DemoSheet({ c }) {
  const [address, setAddress] = useState(c.server.url);
  useEffect(() => setAddress(c.server.url), [c.server.url]);

  return (
    <View>
      <SheetTitle overline="HACKATHON DEMO" title="Elise’s story" text="This panel is for the demo operator, not the customer experience." />

      <View style={styles.status}>
        <Text style={styles.statusCount}>
          {c.events.length} / {DEMO_EVENTS.length}
        </Text>
        <Text style={styles.statusLabel}>signals applied</Text>
      </View>
      <View style={styles.events}>
        {c.events.map(event => (
          <View key={event.id} style={styles.event}>
            <Icon name="check" size={15} color={colors.green} />
            <Text style={styles.eventText}>{event.title}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttons}>
        <PrimaryButton title={c.nextEvent ? 'Run full story' : 'Story complete'} onPress={c.playAll} disabled={!c.nextEvent || c.busy} />
        <SecondaryButton title="Next signal" onPress={c.playNext} disabled={!c.nextEvent || c.busy} />
        <TextButton title="Reset" onPress={c.reset} disabled={c.busy} full icon={<Icon name="reset" size={15} color={colors.blue} />} />
      </View>
      <Text style={styles.technical}>Internal rule score: {c.confidence}/100. Hidden from the normal customer view.</Text>

      <View style={styles.server}>
        <View style={styles.serverHead}>
          <Icon name="server" size={18} color={colors.blue} />
          <Text style={styles.serverTitle}>Server</Text>
        </View>
        <Text style={styles.serverNow} selectable>
          {c.server.url}
        </Text>
        <Text style={styles.serverSource}>Source: {c.server.source}</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="http://192.168.1.23:8000"
          placeholderTextColor="#9aa7ad"
          autoCapitalize="none"
          autoCorrect={false}
          inputMode="url"
          returnKeyType="done"
          onSubmitEditing={() => c.changeServer(address)}
          style={styles.input}
          accessibilityLabel="Server address"
        />
        <View style={styles.serverButtons}>
          <SecondaryButton title="Connect" onPress={() => c.changeServer(address)} disabled={c.busy || !address.trim()} style={styles.flex} />
          <TextButton title="Use default" onPress={() => c.changeServer('')} disabled={c.busy} style={styles.defaultButton} />
        </View>
        <Text style={styles.serverHelp}>
          Phone: use your computer’s Wi-Fi IP with port 8000 (backend started with --host 0.0.0.0) or the Cloud Run URL. Don’t add /api.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  status: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.line, marginTop: 8 },
  statusCount: { fontSize: 28, fontWeight: '700', color: colors.dark },
  statusLabel: { fontSize: 12, color: '#7d8b92' },
  events: { marginVertical: 12 },
  event: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 6 },
  eventText: { fontSize: 13, color: colors.closeIcon },
  buttons: { gap: 9, marginVertical: 16 },
  technical: { fontSize: 11, color: '#8b989e' },
  server: { marginTop: 22, paddingTop: 18, borderTopWidth: 1, borderTopColor: colors.line },
  serverHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  serverTitle: { fontSize: 15, fontWeight: '700', color: colors.headingSoft },
  serverNow: { fontSize: 13, color: colors.label, marginTop: 10, fontWeight: '700' },
  serverSource: { fontSize: 11, color: colors.caption, marginTop: 3 },
  input: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    borderRadius: radius.button,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#fff',
  },
  serverButtons: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 },
  defaultButton: { alignSelf: 'center' },
  serverHelp: { fontSize: 11, color: colors.caption, lineHeight: 16, marginTop: 10 },
});
