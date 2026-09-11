import { useRef, useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import SectionButtonProfile from '@/components/profileScreen/SectionButtonProfile';
import type { ProfileButtonProps } from '@/components/profileScreen/ButtonProfile';
import DeleteAccountModal from '@/features/profileScreen/DeleteAccountModal';
import { deleteCurrentUser } from '@/services/user';
import { colors, fontFamily, fontSize } from '@/theme';

type ProfileSection = {
  title: string;
  items: ProfileButtonProps[];
};

export default function UserProfileScreen() {
  const router = useRouter();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const isDeletingAccountRef = useRef(false);

  function handlePersonalDataPress() {}
  function handleComfortPersonPress() {}
  function handlePrivacyPress() {}
  function handleAccessibilityPress() {}
  function handleNotificationsPress() {}
  function handleAppearancePress() {}
  function handleDeletedMessagesPress() {}
  function handlePremiumPress() {}
  function handlePaymentsPress() {}
  function handleLogoutPress() {}

  function handleDeleteAccountPress() {
    setIsDeleteModalVisible(true);
  }

  function handleCloseDeleteModal() {
    if (isDeletingAccount) {
      return;
    }

    setIsDeleteModalVisible(false);
  }

  async function handleConfirmDeleteAccount() {
    if (isDeletingAccountRef.current) {
      return;
    }

    isDeletingAccountRef.current = true;
    setIsDeletingAccount(true);

    try {
      await deleteCurrentUser();
      setIsDeleteModalVisible(false);
      router.replace('/login');
    } finally {
      isDeletingAccountRef.current = false;
      setIsDeletingAccount(false);
    }
  }

  const sections: ProfileSection[] = [
    {
      title: 'CONTA',
      items: [
        {
          title: 'Dados pessoais',
          icon: 'user',
          onPress: handlePersonalDataPress,
        },
        {
          title: 'Pessoa de conforto',
          icon: 'heart',
          info: 'Jaskier',
          onPress: handleComfortPersonPress,
        },
        {
          title: 'Privacidade',
          icon: 'lock',
          onPress: handlePrivacyPress,
        },
      ],
    },
    {
      title: 'EXPERIÊNCIA',
      items: [
        {
          title: 'Acessibilidade',
          icon: 'circle',
          onPress: handleAccessibilityPress,
        },
        {
          title: 'Notificações',
          icon: 'bell',
          onPress: handleNotificationsPress,
        },
        {
          title: 'Aparência',
          icon: 'moon',
          onPress: handleAppearancePress,
        },
        {
          title: 'Mensagens Apagadas',
          icon: 'moon',
          onPress: handleDeletedMessagesPress,
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
          onPress: handlePremiumPress,
        },
        {
          title: 'Pagamentos',
          icon: 'credit-card',
          onPress: handlePaymentsPress,
        },
      ],
    },
    {
      title: '',
      items: [
        {
          title: 'Sair',
          icon: 'log-out',
          onPress: handleLogoutPress,
        },
        {
          title: 'Excluir conta',
          icon: null,
          titleColor: colors.danger,
          showChevron: false,
          onPress: handleDeleteAccountPress,
        },
      ],
    },
  ];

  return (
    <>
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
          <SectionButtonProfile
            key={section.title || section.items[0]?.title}
            title={section.title}
            items={section.items}
          />
        ))}
      </ScrollView>

      <DeleteAccountModal
        visible={isDeleteModalVisible}
        loading={isDeletingAccount}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDeleteAccount}
      />
    </>
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
    color: colors.text,
    fontSize: fontSize.display,
  },

  profileContainer: {
    backgroundColor: colors.surface,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,

    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },

  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,

    backgroundColor: colors.text,

    justifyContent: 'center',
    alignItems: 'center',
  },

  profileIconText: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.heading,
    color: colors.textInverse,
  },

  profileName: {
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    fontSize: fontSize.title,
  },

  profileEmail: {
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
});
