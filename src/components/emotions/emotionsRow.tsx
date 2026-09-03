import { useState } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { EmotionButton } from './emotions';

const feliz = require('../../../assets/Emotion_Icons/Feliz.png');
const bem = require('../../../assets/Emotion_Icons/Bem.png');
const cansado = require('../../../assets/Emotion_Icons/Cansado.png');
const triste = require('../../../assets/Emotion_Icons/Triste.png');
const ansioso = require('../../../assets/Emotion_Icons/Ansioso.png');
const irritado = require('../../../assets/Emotion_Icons/Irritado.png');

const EMOTIONS = [
    { id: 'feliz', emoji: feliz, label: 'Feliz' },
    { id: 'Bem', emoji: bem, label: 'Bem' },
    { id: 'Cansado', emoji: cansado, label: 'Cansado' },
    { id: 'triste', emoji: triste, label: 'Triste' },
    { id: 'ansioso', emoji: ansioso, label: 'Ansioso' },
    { id: 'irritado', emoji: irritado, label: 'Irritado' },
];

interface EmotionsRowProps {
    onSelectEmotion?: (emotion: string) => void;
}

export function EmotionsRow({ onSelectEmotion }: EmotionsRowProps) {
    const [selected, setSelected] = useState<string | null>(null);

    const handlePress = (emotionId: string) => {
        const next = selected === emotionId ? null : emotionId;
        setSelected(next);
        if (onSelectEmotion && next) {
            onSelectEmotion(next);
        }
    };

    return (
        <View style={styles.box}>
            <Text>Como você está se sentindo hoje?</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                persistentScrollbar={false}
                contentContainerStyle={styles.scrollContent}
            >
                {EMOTIONS.map((item) => (
                    <EmotionButton
                        key={item.id}
                        emoji={item.emoji}
                        label={item.label}
                        isSelected={selected === item.id}
                        onPress={() => handlePress(item.id)}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        width: '90%',
        marginVertical: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#d5dcd7',
        borderRadius: 16,
        backgroundColor: '#f8faf8',
        overflow: 'hidden',
    },
    scrollContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
        paddingBottom: 6,
    },
});