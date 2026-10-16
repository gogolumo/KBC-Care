// Adviser workspace (web: view === 'adviser'), stacked into one column for phones.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import Logo from '../components/Logo';
import { SHARE_FIELDS, confidenceLabel, fmtDate } from '../data';
import { colors } from '../theme';

export default function AdviserScreen({ passport, confidence = 0, signalCount = 0, onBack }) {
  const insets = useSafeAreaInsets();
  const fields = passport?.fields || {};
  const completed = Array.isArray(fields.journeyProgress) ? fields.journeyProgress : [];
  const pct = Math.max(0, Math.min(confidence, 100));

  return (
    <View style={styles.page}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerInner}>
          <Logo small />
          <View style={styles.headerRight}>
            <Text style={styles.headerLabel}>Adviser workspace</Text>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>KL</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 40 + insets.bottom }]}>
        <Pressable onPress={onBack} hitSlop={10} accessibilityRole="button" style={styles.back}>
          <Text style={styles.backText}>← Back to customer view</Text>
        </Pressable>

        <View style={styles.title}>
          <Text style={styles.overline}>CUSTOMER CONTEXT</Text>
          <Text style={styles.h1} accessibilityRole="header">Elise</Text>
          <Text style={styles.subtitle}>Home exploration · customer-approved context</Text>
          <View style={styles.consent}>
            <Icon name="shield" size={16} color={colors.consentText} />
            <Text style={styles.consentText}>Consent active</Text>
          </View>
        </View>

        <View style={styles.main}>
          <Section title="Current situation" first>
            <View style={styles.situation}>
              <View style={styles.careIcon}>
                <Icon name="home" color={colors.blue} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.strong}>Exploring a home purchase</Text>
                <Text style={styles.small}>Elise confirmed this goal and chose to share it for this conversation.</Text>
              </View>
            </View>
          </Section>

          <Section title="What Elise shared">
            {Object.entries(fields).map(([key, value]) => (
              <View style={styles.sharedRow} key={key}>
                <Text style={styles.sharedLabel}>{SHARE_FIELDS.find(([f]) => f === key)?.[1] || key}</Text>
                <Text style={styles.sharedValue}>
                  {Array.isArray(value) ? (value.length ? value.join(' · ') : 'None shared') : String(value)}
                </Text>
              </View>
            ))}
          </Section>

          <Section title="Decision confidence">
            <View style={styles.confidenceCard}>
              <View style={styles.confidenceHead}>
                <Text style={styles.confidenceTitle}>Home purchase intent</Text>
                <Text style={styles.confidenceValue}>
                  {confidence}% · {confidenceLabel(confidence)} confidence
                </Text>
              </View>
              <View style={styles.track} accessibilityLabel={`Decision confidence ${confidence}%`}>
                <View style={[styles.fill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.confidenceNote}>
                Based on {signalCount} relevant customer signal{signalCount === 1 ? '' : 's'}.
              </Text>
            </View>
          </Section>

          <Section title="Recommended approach">
            <View style={styles.approach}>
              <Text style={styles.strong}>Continue from where Elise left off</Text>
              <Text style={styles.small}>
                {completed.length
                  ? `${completed.length} journey step(s) completed. Ask what she would like to cover next.`
                  : 'Start by clarifying what Elise wants to understand before discussing products.'}
              </Text>
            </View>
          </Section>
        </View>

        <View style={styles.kate}>
          <View style={styles.kateTitle}>
            <View style={styles.kateIcon}>
              <Icon name="spark" color={colors.blue} />
            </View>
            <View>
              <Text style={styles.kateLabel}>KATE</Text>
              <Text style={styles.kateName}>Conversation assistant</Text>
            </View>
          </View>
          <View style={styles.scope}>
            <Icon name="lock" size={15} color="#657983" />
            <Text style={styles.scopeText}>Uses only customer-approved context.</Text>
          </View>
          <View style={styles.brief}>
            <Text style={styles.briefLabel}>SUGGESTED OPENING</Text>
            <Text style={styles.quote}>“Hi Elise. I can see you’re exploring a home purchase. Where would you like to pick up today?”</Text>
          </View>
          <View style={styles.brief}>
            <Text style={styles.briefLabel}>NEXT STEP</Text>
            <Text style={styles.briefText}>Focus on guidance first. Let Elise choose when she wants to discuss a product.</Text>
          </View>
          <Text style={styles.guardrail}>Kate can prepare the conversation. The adviser remains responsible for every action.</Text>
        </View>

        <View style={styles.consentCard}>
          <Icon name="shield" color={colors.blue} />
          <View style={styles.flex}>
            <Text style={styles.consentCardTitle}>Shared for 24 hours</Text>
            <Text style={styles.consentCardText}>Raw transactions and unrelated account data are not included.</Text>
            <Text style={styles.consentCardText}>Expires {fmtDate(passport?.expiresAt)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, first, children }) {
  return (
    <View style={[styles.section, !first && styles.sectionDivider]}>
      <Text style={styles.h2}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { flex: 1, backgroundColor: colors.adviserBg },
  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.line },
  headerInner: { height: 58, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerLabel: { fontSize: 12, color: '#687a84' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.avatarBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '800', color: colors.dark },

  content: { paddingHorizontal: 15, paddingTop: 22, width: '100%', maxWidth: 760, alignSelf: 'center', gap: 14 },
  back: { alignSelf: 'flex-start' },
  backText: { color: colors.blue, fontSize: 14 },
  title: { marginTop: 8, marginBottom: 8 },
  overline: { fontSize: 11, letterSpacing: 1.3, fontWeight: '800', color: '#55717f' },
  h1: { fontSize: 32, fontWeight: '700', color: '#17384b', marginVertical: 5, letterSpacing: -1 },
  subtitle: { fontSize: 13, color: '#71818a' },
  consent: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 7, backgroundColor: colors.consentBg, paddingVertical: 8, paddingHorizontal: 11, marginTop: 12 },
  consentText: { color: colors.consentText, fontSize: 12, fontWeight: '700' },

  main: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, paddingVertical: 20, paddingHorizontal: 17 },
  section: {},
  sectionDivider: { borderTopWidth: 1, borderTopColor: colors.line, marginTop: 24, paddingTop: 24 },
  h2: { fontSize: 16, fontWeight: '700', color: '#263f4e', marginBottom: 14 },
  situation: { flexDirection: 'row', gap: 14 },
  careIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.careBg, alignItems: 'center', justifyContent: 'center' },
  strong: { fontSize: 15, fontWeight: '700', color: colors.text },
  small: { fontSize: 13, color: '#6d7f88', lineHeight: 20, marginTop: 5 },
  sharedRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.lineSoft, gap: 4 },
  sharedLabel: { fontSize: 12, color: '#73848c' },
  sharedValue: { fontSize: 13, color: '#304956', fontWeight: '700' },
  confidenceCard: { backgroundColor: colors.confidenceBg, borderWidth: 1, borderColor: colors.confidenceBorder, borderRadius: 6, padding: 16 },
  confidenceHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' },
  confidenceTitle: { fontSize: 14, fontWeight: '700', color: '#2a4352' },
  confidenceValue: { fontSize: 12, color: '#5f727d', fontWeight: '700' },
  track: { height: 8, backgroundColor: colors.confidenceTrack, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.blue, borderRadius: 999 },
  confidenceNote: { marginTop: 9, fontSize: 11, color: '#7a8a92' },
  approach: { borderLeftWidth: 3, borderLeftColor: colors.blue, paddingLeft: 14, paddingVertical: 3 },

  kate: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, padding: 20 },
  kateTitle: { flexDirection: 'row', gap: 11, alignItems: 'center' },
  kateIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.avatarBg, alignItems: 'center', justifyContent: 'center' },
  kateLabel: { fontSize: 10, letterSpacing: 1.2, color: colors.blue, fontWeight: '800' },
  kateName: { fontSize: 14, fontWeight: '700', marginTop: 2, color: colors.text },
  scope: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#f2f6f7', padding: 9, marginVertical: 16 },
  scopeText: { fontSize: 12, color: '#657983' },
  brief: { paddingVertical: 15, borderTopWidth: 1, borderTopColor: colors.line },
  briefLabel: { fontSize: 10, letterSpacing: 1, fontWeight: '800', color: '#72848d' },
  quote: { fontSize: 13, lineHeight: 20, color: '#405966', marginTop: 8, borderLeftWidth: 2, borderLeftColor: colors.blue, paddingLeft: 10 },
  briefText: { fontSize: 13, lineHeight: 20, color: '#405966', marginTop: 8 },
  guardrail: { fontSize: 12, lineHeight: 18, color: '#7b8b92' },

  consentCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, padding: 18, flexDirection: 'row', gap: 10 },
  consentCardTitle: { fontSize: 14, fontWeight: '700', color: '#426371' },
  consentCardText: { fontSize: 12, lineHeight: 18, color: '#75868e', marginTop: 4 },
});
