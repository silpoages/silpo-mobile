import { View, ScrollView, Text, StyleSheet } from 'react-native';
import SectionButtonProfile from '../../components/profileScreen/SectionButtonProfile';
import type { ProfileIconName } from '../../components/profileScreen/ButtonProfile';
import { fontFamily } from '@/theme';

type ProfileSection = {
  title: string;
  items: {
    title: string;
    icon: ProfileIconName | null;
    iconColor?: string;
    info?: string;
    action: () => void;
  }[];
};

const sections: ProfileSection[] = [
  {
    title: 'CONTA',
    items: [
      {
        title: 'Dados pessoais',
        icon: 'user',
        action: () => {},
      },
      {
        title: 'Pessoa de conforto',
        icon: 'heart',
        info: 'Jaskier',
        action: () => {},
      },
      {
        title: 'Privacidade',
        icon: 'lock',
        action: () => {},
      },
    ],
  },

  {
    title: 'EXPERIÊNCIA',
    items: [
      {
        title: 'Acessibilidade',
        icon: 'circle',
        action: () => {},
      },
      {
        title: 'Notificações',
        icon: 'bell',
        action: () => {},
      },
      {
        title: 'Aparência',
        icon: 'moon',
        action: () => {},
      },
      {
        title: 'Mensagens Apagadas',
        icon: 'moon',
        action: () => {},
      },
    ],
  },

  {
    title: 'ASSINATURA',
    items: [
      {
        title: 'Silpo Premium',
        icon: 'star',
        iconColor: '#8A6423',
        info: 'Conhecer',
        action: () => {},
      },
      {
        title: 'Pagamentos',
        icon: 'credit-card',
        action: () => {},
      },
    ],
  },

  {
    title: '',
    items: [
      {
        title: 'Sair',
        icon: 'log-out',
        action: () => {},
      },
      {
        title: 'Excluir Conta',
        icon: null,
        action: () => {},
      },
    ],
  },
];

export default function UserProfileScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Perfil</Text>
      <View style={styles.profileContainer}>
        <View style={styles.profileIcon}>
          <Text style={styles.profileIconText}>M</Text>
        </View>
        <View>
          <Text style={styles.profileName}>Mago dos Games</Text>
          <Text style={styles.profileEmail}>mago@gmail.com</Text>
        </View>
      </View>

      {sections.map((section) => (
        <SectionButtonProfile key={section.title} title={section.title} items={section.items} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 116,
  },

  title: {
    fontFamily: fontFamily.extraBold,
    color: '#1F3329',
    fontSize: 24,
    fontWeight: 800,
  },

  profileContainer: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,

    borderColor: '#DEE8DF',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },

  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,

    backgroundColor: '#1F3329',

    justifyContent: 'center',
    alignItems: 'center',
  },

  profileIconText: {
    fontFamily: fontFamily.extraBold,
    fontSize: 22,
    color: '#FFFFFF',
  },

  profileName: {
    fontFamily: fontFamily.extraBold,
    color: '#1F3329',
    fontSize: 17,
  },

  profileEmail: {
    fontFamily: fontFamily.regular,
    color: '#55685D',
    fontSize: 13,
  },
});
