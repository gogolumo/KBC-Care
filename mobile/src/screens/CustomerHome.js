// Customer home: the mobile layout of the web page's customer view
// (header, money, quick actions, care panel, journey, everyday card, recent activity, Ask Kate).
import { useRef } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import Logo from '../components/Logo';
import Notice from '../components/Notice';
import { PrimaryButton, TextButton } from '../components/Buttons';
import { TRANSACTIONS, greeting } from '../data';
import { TAB_BAR_HEIGHT, colors, radius, shadow } from '../theme';

const TABS = [
  ['Home', 'home'],
  ['Payments', 'transfer'],
  ['Products', 'card'],
  ['Support', 'help'],
];

export default function CustomerHome({ c }) {
  const insets = useSafeAreaInsets();
  const scroll = useRef(null);
  const showEveryday = !c.visible && !c.confirmed && !c.paused && c.state?.status !== 'rejected';

  function outsideDemo(name) {
    c.showInfo(`${name} is not part of this demo.`);
    scroll.current?.scrollTo({ y: 0, animated: true });
  }

  return (
    <View style={styles.app}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerInner}>
          <Logo />
          <View style={styles.headerActions}>
            <Pressable onPress={() => c.setModal('kate')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Help">
              <Icon name="help" color="#415661" />
            </Pressable>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>EL</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scroll}
        contentContainerStyle={[styles.page, { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 90 }]}
        refreshControl={<RefreshControl refreshing={c.refreshing} onRefresh={c.refresh} tintColor={colors.blue} colors={[colors.blue]} />}
      >
        <View style={styles.welcome}>
          <View>
            <Text style={styles.welcomeSmall}>{greeting()}</Text>
            <Text style={styles.welcomeName} accessibilityRole="header">Elise</Text>
          </View>
          <TextButton title="Demo controls" small underline color={colors.caption} onPress={() => c.setModal('demo')} style={styles.demoControl} />
        </View>

        {c.error ? <Notice tone="error" text={c.error} onRetry={c.refresh} onClose={() => c.setError('')} /> : null}
        {c.notice ? <Notice tone={c.notice.tone} text={c.notice.text} /> : null}

        <View style={styles.sectionHeading}>
          <Text style={styles.h2}>Your money</Text>
          <Text style={styles.headingLink}>View all</Text>
        </View>
        <View style={styles.accounts}>
          <View style={[styles.account, styles.primaryAccount]}>
            <Text style={styles.accountName}>Current account</Text>
            <Text style={styles.accountSmall}>BE•• •••• •••• 4829</Text>
            <Text style={styles.accountAmount}>€ 12,480.50</Text>
          </View>
          <View style={styles.account}>
            <Text style={styles.accountName}>Savings account</Text>
            <Text style={styles.accountSmall}>Goal savings</Text>
            <Text style={styles.accountAmount}>€ 24,320.00</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          {[
            ['Transfer', 'transfer'],
            ['Cards', 'card'],
            ['Home', 'home'],
          ].map(([label, icon]) => (
            <Pressable key={label} style={styles.quickAction} onPress={() => outsideDemo(label)} accessibilityRole="button">
              <View style={styles.quickIcon}>
                <Icon name={icon} color={colors.blue} />
              </View>
              <Text style={styles.quickLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {c.visible && (
          <View style={styles.carePanel} testID="care-panel">
            <Text style={styles.overline}>FOR YOU</Text>
            <Text style={styles.careTitle}>Thinking about a home?</Text>
            <Text style={styles.careText}>
              Some recent activity suggests you may be exploring a home purchase. If that’s right, we can help you take the next
              steps at your pace.
            </Text>
            <View style={styles.careActions}>
              <PrimaryButton title="Yes, help me explore" onPress={c.confirm} disabled={c.busy} style={styles.careButton} />
              <TextButton title="Not right now" onPress={c.reject} disabled={c.busy} />
            </View>
            <TextButton title="Why am I seeing this?" small underline onPress={() => c.setModal('why')} style={styles.whyLink} />
          </View>
        )}

        {c.paused && (
          <View style={styles.pausedCard} testID="paused-card">
            <View style={styles.pausedIcon}>
              <Icon name="pause" color={colors.muted} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.pausedTitle}>Home-purchase help is paused</Text>
              <Text style={styles.pausedText}>
                You paused this kind of help. Nothing is suggested until you turn it back on, and no decision is made about you.
              </Text>
              <TextButton title="Turn help back on" onPress={c.resume} disabled={c.busy} icon={<Icon name="play" size={15} color={colors.blue} />} />
            </View>
          </View>
        )}

        {c.confirmed && (
          <View style={styles.card} testID="journey">
            <View style={styles.sectionHeading}>
              <View style={styles.flex}>
                <Text style={styles.overline}>YOUR HOME JOURNEY</Text>
                <Text style={[styles.h2, styles.journeyTitle]}>One step at a time</Text>
                <Text style={styles.journeyText}>Pick up where you left off. You decide what happens next.</Text>
              </View>
              <Icon name="home" size={26} color={colors.blue} />
            </View>
            <View style={styles.journeyList}>
              {(c.journey?.steps || []).map((step, i) => {
                const done = step.status === 'done';
                const active = step.status === 'active';
                return (
                  <Pressable
                    key={step.id}
                    style={({ pressed }) => [styles.journeyRow, pressed && active && styles.rowPressed]}
                    disabled={!active || c.busy}
                    onPress={() => c.completeStep(step.id)}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !active || c.busy }}
                  >
                    <View style={[styles.step, done && styles.stepDone]}>
                      {done ? <Icon name="check" size={16} color={colors.green} /> : <Text style={styles.stepNumber}>{i + 1}</Text>}
                    </View>
                    <Text style={[styles.stepTitle, active && styles.stepActive, done && styles.stepDoneText]}>{step.title}</Text>
                    <Text style={styles.stepStatus}>{done ? 'Done' : active ? 'Continue' : 'Later'}</Text>
                  </Pressable>
                );
              })}
            </View>
            <PrimaryButton
              title="Talk to a KBC adviser"
              icon={<Icon name="lock" size={16} color="#fff" />}
              onPress={() => c.setModal('share')}
              style={styles.shareButton}
            />
          </View>
        )}

        {showEveryday && (
          <View style={styles.card}>
            <Text style={styles.overline}>KBC CARE</Text>
            <Text style={[styles.h2, styles.everydayTitle]}>Banking that adapts to what matters to you</Text>
            <Text style={styles.everydayText}>
              When your situation changes, KBC Care can make useful help easier to find — without turning every signal into an offer.
            </Text>
            <PrimaryButton
              title={c.busy ? 'Updating…' : c.nextEvent ? 'See the demo' : 'Demo complete'}
              onPress={c.playAll}
              disabled={c.busy || !c.nextEvent}
              style={styles.everydayButton}
            />
          </View>
        )}

        <View style={[styles.card, styles.activity]}>
          <View style={styles.sectionHeading}>
            <Text style={styles.h2}>Recent activity</Text>
            <Text style={styles.headingLink}>See all</Text>
          </View>
          <View style={styles.transactions}>
            {TRANSACTIONS.map(([name, date, amount]) => (
              <View style={styles.transaction} key={name}>
                <View style={styles.merchant}>
                  <Text style={styles.merchantLetter}>{name[0]}</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.txName}>{name}</Text>
                  <Text style={styles.txDate}>{date}</Text>
                </View>
                <Text style={[styles.txAmount, amount.startsWith('+') && styles.positive]}>{amount}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.kateFab, { bottom: TAB_BAR_HEIGHT + insets.bottom + 14 }, pressed && styles.rowPressed]}
        onPress={() => c.setModal('kate')}
        accessibilityRole="button"
        accessibilityLabel="Ask Kate"
      >
        <View style={styles.kateFabIcon}>
          <Icon name="spark" size={18} color="#fff" />
        </View>
        <Text style={styles.kateFabText}>Ask Kate</Text>
      </Pressable>

      <View style={[styles.tabBar, { paddingBottom: insets.bottom, height: TAB_BAR_HEIGHT + insets.bottom }]} accessibilityRole="tablist">
        {TABS.map(([label, icon]) => {
          const active = label === 'Home';
          return (
            <Pressable
              key={label}
              style={styles.tab}
              onPress={() => (active ? scroll.current?.scrollTo({ y: 0, animated: true }) : outsideDemo(label))}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Icon name={icon} size={22} color={active ? colors.blue : '#8a99a1'} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.line },
  headerInner: { height: 58, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.avatarBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '800', color: colors.dark },

  page: { paddingHorizontal: 16, paddingTop: 24, width: '100%', maxWidth: 760, alignSelf: 'center' },
  welcome: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 },
  welcomeSmall: { color: colors.muted, fontSize: 14, marginBottom: 4 },
  welcomeName: { fontSize: 30, fontWeight: '700', color: colors.heading, letterSpacing: -1.1 },
  demoControl: { paddingVertical: 4 },

  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, gap: 12 },
  h2: { fontSize: 19, fontWeight: '700', color: colors.headingSoft, letterSpacing: -0.4 },
  headingLink: { color: colors.blue, fontSize: 13, fontWeight: '700' },
  overline: { fontSize: 11, letterSpacing: 1.3, fontWeight: '800', color: '#55717f' },

  accounts: { gap: 12 },
  account: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, paddingVertical: 19, paddingHorizontal: 20 },
  primaryAccount: { borderTopWidth: 4, borderTopColor: colors.blue },
  accountName: { fontWeight: '700', color: colors.label, fontSize: 15 },
  accountSmall: { color: colors.caption, fontSize: 12, marginTop: 6 },
  accountAmount: { fontSize: 23, color: colors.amount, fontWeight: '700', letterSpacing: -0.8, marginTop: 18 },

  quickActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 18, marginBottom: 30 },
  quickAction: { alignItems: 'center', gap: 6, minWidth: 72 },
  quickIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.quickActionBg, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { color: '#334b58', fontSize: 12, fontWeight: '700' },

  carePanel: { backgroundColor: colors.careBg, borderLeftWidth: 4, borderLeftColor: colors.blue, paddingVertical: 20, paddingHorizontal: 18, marginBottom: 30 },
  careTitle: { fontSize: 22, color: '#173b52', fontWeight: '700', marginTop: 7, marginBottom: 8, letterSpacing: -0.3 },
  careText: { color: colors.body, fontSize: 14, lineHeight: 22, marginBottom: 18 },
  careActions: { gap: 10, alignItems: 'flex-start' },
  careButton: { alignSelf: 'stretch' },
  whyLink: { marginTop: 10 },

  pausedCard: { flexDirection: 'row', gap: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderLeftWidth: 4, borderLeftColor: colors.secondaryBorder, padding: 18, marginBottom: 30 },
  pausedIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.stepBg, alignItems: 'center', justifyContent: 'center' },
  pausedTitle: { fontSize: 16, fontWeight: '700', color: colors.headingSoft },
  pausedText: { fontSize: 13, lineHeight: 20, color: colors.body, marginTop: 5, marginBottom: 6 },

  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, paddingVertical: 20, paddingHorizontal: 17, marginBottom: 30 },
  journeyTitle: { marginTop: 6 },
  journeyText: { fontSize: 13, color: '#70818a', marginTop: 5, lineHeight: 19 },
  journeyList: { borderTopWidth: 1, borderTopColor: colors.line },
  journeyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: colors.lineSoft, backgroundColor: '#fff' },
  rowPressed: { opacity: 0.7 },
  step: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.stepBg, alignItems: 'center', justifyContent: 'center' },
  stepDone: { backgroundColor: colors.stepDoneBg },
  stepNumber: { fontSize: 12, color: '#304753' },
  stepTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#304753' },
  stepActive: { color: colors.blue },
  stepDoneText: { color: '#667a84' },
  stepStatus: { fontSize: 12, color: '#84939a' },
  shareButton: { marginTop: 20 },

  everydayTitle: { marginTop: 7, marginBottom: 7 },
  everydayText: { fontSize: 14, color: '#647782', lineHeight: 21 },
  everydayButton: { marginTop: 18, alignSelf: 'flex-start' },

  activity: { marginTop: 0 },
  transactions: { borderTopWidth: 1, borderTopColor: colors.lineSoft },
  transaction: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  merchant: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.merchantBg, alignItems: 'center', justifyContent: 'center' },
  merchantLetter: { color: colors.body, fontWeight: '800' },
  txName: { fontSize: 14, color: colors.label, fontWeight: '700' },
  txDate: { fontSize: 12, color: '#89969d', marginTop: 3 },
  txAmount: { fontSize: 14, color: '#314752', fontWeight: '700' },
  positive: { color: colors.green },

  kateFab: {
    position: 'absolute',
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.fabBorder,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 15,
    ...shadow,
  },
  kateFabIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  kateFabText: { color: '#173e57', fontSize: 13, fontWeight: '700' },

  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, height: TAB_BAR_HEIGHT },
  tabLabel: { fontSize: 11, color: '#8a99a1', fontWeight: '600' },
  tabLabelActive: { color: colors.blue, fontWeight: '800' },
});
