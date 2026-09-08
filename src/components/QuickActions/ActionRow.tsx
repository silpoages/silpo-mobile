import { useState } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { ActionButton } from './actions';

const respire = require('../../../assets/qck_acts/Breathe.png');
const medite = require('../../../assets/qck_acts/Meditate.png');
const momento = require('../../../assets/qck_acts/Moment.png');

const ACTIONS = [
    { id: 'respire', emoji: respire, label: 'Respiração', time: '3-5 min' },
    { id: 'medite', emoji: medite, label: 'Meditação', time: '4-10 min' },
    { id: 'momento', emoji: momento, label: 'Um momento', time: 'interativo' },
];

interface ActionRowProps {
    onSelectAction?: (action: string) => void;
}

export function ActionRow({ onSelectAction }: ActionRowProps) {
    const [selected, setSelected] = useState<string | null>(null);

    const handlePress = (actionId: string) => {
        const next = selected === actionId ? null : actionId;
        setSelected(next);
        if (onSelectAction && next) {
            onSelectAction(next);
        }
    };

    return (
        <View style={styles.box}>
            <Text style={styles.title}>Exercícios Rápidos</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                persistentScrollbar={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.scrollContent}>
                    {ACTIONS.map((item) => (
                        <ActionButton
                            key={item.id}
                            emoji={item.emoji}
                            label={item.label}
                            time={item.time}
                            isSelected={selected === item.id}
                            onPress={() => handlePress(item.id)}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        width: '95%',
        marginVertical: 16,
        paddingHorizontal: 0,
        paddingVertical: 8,
        borderWidth: 0,
        borderColor: '#d5dcd700',
        borderRadius: 16,
        backgroundColor: '#f8faf804',
        overflow: 'hidden',
    },
    scrollContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
        paddingHorizontal: 2,
        paddingBottom: 6,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#55685D',
        marginBottom: 8,
    }
});