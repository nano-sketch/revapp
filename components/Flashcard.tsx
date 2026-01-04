import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Audio } from 'expo-av';
import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { ThemedText } from './themed-text';
interface FlashcardProps {
    id: string;
    front: string;
    back: string;
    style?: ViewStyle;
}
export function Flashcard({ front, back, style }: FlashcardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const rotate = useSharedValue(0);
    const soundRef = React.useRef<Audio.Sound | null>(null);
    React.useEffect(() => {
        let isMounted = true;
        async function loadSound() {
            try {
                const { sound: newSound } = await Audio.Sound.createAsync(
                    require('../assets/sounds/flipcard.mp3')
                );
                if (isMounted) {
                    soundRef.current = newSound;
                } else {
                    await newSound.unloadAsync();
                }
            } catch (error) {
                console.log('Error loading sound:', error);
            }
        }
        loadSound();
        return () => {
            isMounted = false;
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);
    const playFlipSound = async () => {
        if (soundRef.current) {
            try {
                await soundRef.current.replayAsync();
            } catch (error) {
                console.log('Error playing sound:', error);
            }
        }
    };
    const handleFlip = () => {
        playFlipSound();
        setIsFlipped(!isFlipped);
        rotate.value = withTiming(isFlipped ? 0 : 1, { duration: 300 });
    };
    const frontAnimatedStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(rotate.value, [0, 1], [0, 180]);
        return {
            transform: [
                { rotateY: `${rotateValue}deg` },
            ],
            backfaceVisibility: 'hidden',
        };
    });
    const backAnimatedStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(rotate.value, [0, 1], [180, 360]);
        return {
            transform: [
                { rotateY: `${rotateValue}deg` },
            ],
            backfaceVisibility: 'hidden',
        };
    });
    return (
        <Pressable onPress={handleFlip} style={[styles.container, style]}>
            <Animated.View
                style={[
                    styles.card,
                    frontAnimatedStyle,
                    { backgroundColor: colors.card, borderColor: colors.border }
                ]}
            >
                <ThemedText type="subtitle" style={{ textAlign: 'center' }}>{front}</ThemedText>
                <ThemedText style={{ marginTop: 10, opacity: 0.5, fontSize: 12 }}>Tap to flip</ThemedText>
            </Animated.View>
            <Animated.View
                style={[
                    styles.card,
                    styles.backCard,
                    backAnimatedStyle,
                    { backgroundColor: colors.tintBackground, borderColor: colors.tint }
                ]}
            >
                <ThemedText type="subtitle" style={{ textAlign: 'center' }}>{back}</ThemedText>
            </Animated.View>
        </Pressable>
    );
}
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        width: width * 0.85,
        height: width * 1.2,
    },
    card: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    backCard: {
    }
});