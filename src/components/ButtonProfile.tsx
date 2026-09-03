import { View, Pressable, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';

type ProfileButtonProps = {
  title: string;
  icon: ImageSourcePropType;
  info?: string;
  action: () => void;
};

const iconArrow = require('../../assets/profileScreen/icon-arrow.svg');

export default function ButtonProfile({ title, icon, info, action }: ProfileButtonProps) {
  return (
    <Pressable style={styles.button} onPress={action}>
      <View style={styles.content}>
        <View style={styles.left}>
          <Image source={icon} />

          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.right}>
          {info && <Text style={styles.info}>{info}</Text>}
          <Image source={iconArrow} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 15,
    paddingVertical: 18,
    backgroundColor: 'white',
    alignSelf: 'stretch',
  },

  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  title: {
    color: '#37443D',
    fontSize: 15,
    fontWeight: 600,
    textAlign: 'left',
  },

  info: {
    color: '#9AAAA0',
    fontSize: 15,
    fontWeight: 400,
    textAlign: 'right',
  },
});
