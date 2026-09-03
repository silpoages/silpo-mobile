import {Image, ImageSourcePropType, Pressable, Text, StyleSheet} from 'react-native';

interface EmotionsProps {
    label: string;
    emoji: ImageSourcePropType;
    onPress: () => void;
    isSelected?: boolean;
}

export function EmotionButton({label, emoji, onPress, isSelected}: EmotionsProps) {
    return (
        <Pressable
            style={({pressed}) => [
                styles.btn,
                isSelected ? styles.selected : undefined,
                pressed ? styles.pressed : undefined,
            ]}
            onPress={onPress}
        >
            <Image source={emoji}/>
            <Text style={[styles.label, isSelected ? styles.selectedLabel : undefined]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    btn: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        minWidth: 80,
        maxWidth: 80,
    },
    pressed: {
        backgroundColor: "#eef2ff",
        transform: [{ scale: 0.96 }],
    },
    selected: {
        backgroundColor: "#e0e7ff",
        borderColor: "#55685D",
        borderWidth: 2,
    },
    emoji: {
        fontSize: 28,
    },
    label: {
        marginTop: 4,
        fontSize: 14,
        fontWeight: "500",
        color: "#55685D",
    },
    selectedLabel: {
        color: "#55685D",
        fontWeight: "700",
    },
});