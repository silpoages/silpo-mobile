import { View, Text, StyleSheet, ImageSourcePropType } from 'react-native';
import ButtonProfile from './ButtonProfile';

type SectionButtonProfileProps = {
  title: string;
  items: {
    title: string;
    icon: ImageSourcePropType;
    info?: string;
    action: () => void;
  }[];
};

export default function SectionButtonProfile({ title, items }: SectionButtonProfileProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.section}>
        {items.map((item, index) => (
          <ButtonProfile key={index} {...item} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },

  section: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    gap: 1,

    borderColor: '#DEE8DF',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },

  title: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.72,
    color: '#55685D',
  },
});
