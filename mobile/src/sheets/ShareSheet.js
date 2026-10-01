// "Choose what your adviser can see" (web: modal === 'share') -> Context Passport.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '../components/Icon';
import { PrimaryButton, TextButton } from '../components/Buttons';
import { SheetTitle } from '../components/Sheet';
import { SHARE_FIELDS } from '../data';
import { colors } from '../theme';

export default function ShareSheet({ c }) {
  return (
    <View>
      <SheetTitle
        overline="TALK TO KBC LIVE"
        title="Choose what your adviser can see"
        text="Only the context you select below will be shared for this conversation."
      />
      <View style={styles.fields}>
        {SHARE_FIELDS.map(([key, title, detail]) => {
          const checked = c.selectedFields.includes(key);
          return (
            <Pressable
              key={key}
              style={styles.field}
              onPress={() => c.toggleField(key)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              accessibilityLabel={title}
            >
              <View style={[styles.box, checked && styles.boxChecked]}>
                {checked && <Icon name="check" size={15} color="#fff" />}
              </View>
              <View style={styles.flex}>
                <Text style={styles.fieldTitle}>{title}</Text>
                <Text style={styles.fieldDetail}>{detail}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <PrimaryButton title="Continue to KBC Live" onPress={c.share} disabled={!c.selectedFields.length || c.busy} full />
      {c.passport && <TextButton title="Open adviser view" onPress={c.openAdviser} disabled={c.busy} full />}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fields: { marginVertical: 22, borderTopWidth: 1, borderTopColor: colors.line },
  field: { flexDirection: 'row', gap: 12, paddingVertical: 15, paddingHorizontal: 2, borderBottomWidth: 1, borderBottomColor: colors.line, alignItems: 'flex-start' },
  box: { width: 22, height: 22, borderRadius: 4, borderWidth: 1.5, borderColor: colors.secondaryBorder, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  boxChecked: { backgroundColor: colors.blue, borderColor: colors.blue },
  fieldTitle: { fontSize: 14, fontWeight: '700', color: '#304956' },
  fieldDetail: { fontSize: 12, color: '#7d8d95', marginTop: 3 },
});
