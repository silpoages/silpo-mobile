import { View, ScrollView, Text, StyleSheet, ImageSourcePropType } from 'react-native';
import SectionButtonProfile from '../components/SectionButtonProfile';

const iconProfile = require('../../assets/profileScreen/icon-profile.svg');
const iconHeart = require('../../assets/profileScreen/icon-heart.svg');
const iconLock = require('../../assets/profileScreen/icon-lock.svg');
const iconBall = require('../../assets/profileScreen/icon-ball.svg');
const iconBell = require('../../assets/profileScreen/icon-bell.svg');
const iconMoon = require('../../assets/profileScreen/icon-moon.svg');
const iconStar = require('../../assets/profileScreen/icon-star.svg');
const iconWallet = require('../../assets/profileScreen/icon-wallet.svg');
const iconExit = require('../../assets/profileScreen/icon-exit.svg');

const sections = [
  {
    title: 'CONTA',
    items: [
      {
        title: 'Dados pessoais',
        icon: iconProfile,
        action: () => {},
      },
      {
        title: 'Pessoa de conforto',
        icon: iconHeart,
        info: 'Jaskier',
        action: () => {},
      },
      {
        title: 'Privacidade',
        icon: iconLock,
        action: () => {},
      },
    ],
  },

  {
    title: 'EXPERIÊNCIA',
    items: [
      {
        title: 'Acessibilidade',
        icon: iconBall,
        action: () => {},
      },
      {
        title: 'Notificações',
        icon: iconBell,
        action: () => {},
      },
      {
        title: 'Aparência',
        icon: iconMoon,
        action: () => {},
      },
      {
        title: 'Mensagens Apagadas',
        icon: iconMoon,
        action: () => {},
      },
    ],
  },

  {
    title: 'ASSINATURA',
    items: [
      {
        title: 'Silpo Premium',
        icon: iconStar,
        info: 'Conhecer',
        action: () => {},
      },
      {
        title: 'Pagamentos',
        icon: iconWallet,
        action: () => {},
      },
    ],
  },

  {
    title: '',
    items: [
      {
        title: 'Sair',
        icon: iconExit,
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
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  profileName: {
    color: '#1F3329',
    fontSize: 17,
    fontWeight: 800,
  },

  profileEmail: {
    color: '#55685D',
    fontSize: 13,
    fontWeight: 400,
  },
});
