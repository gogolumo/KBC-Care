// "Ask Kate" sheet (web: modal === 'kate').
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '../components/Icon';
import { SheetTitle } from '../components/Sheet';
import { colors, radius } from '../theme';

export default function KateSheet({ c }) {
  const suggestions = [
    c.visible ? 'Why did my home guidance change?' : 'What changed this month?',
    'Can I afford my upcoming payments?',
    'What can KBC help me with?',
  ];
  return (
    <View>
      <SheetTitle
        overline="KATE · KBC CARE"
        title="Hi Elise, how can I help?"
        text="I can explain what changed, help you understand your next steps, or point you to the right KBC support."
      />
      <View style={styles.suggestions}>
        {suggestions.map(text => (
          <Pressable key={text} style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]} accessibilityRole="button">
            <Text style={styles.suggestionText}>{text}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.answer}>
        <Icon name="spark" size={18} color={colors.blue} />
        <Text style={styles.answerText}>
          {c.visible
            ? 'I noticed a few signals that may fit with exploring a home purchase. Nothing has been decided for you — you can confirm whether that is relevant.'
            : 'Your accounts look ready for everyday banking. If something changes, I can help you understand the options available.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  suggestions: { gap: 8, marginVertical: 22 },
  suggestion: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.suggestionBorder, borderRadius: radius.button, padding: 13 },
  pressed: { backgroundColor: colors.background },
  suggestionText: { color: '#284b60', fontSize: 14 },
  answer: { flexDirection: 'row', gap: 11, backgroundColor: colors.careBg, padding: 16 },
  answerText: { flex: 1, fontSize: 13, lineHeight: 21, color: '#315b70' },
});
