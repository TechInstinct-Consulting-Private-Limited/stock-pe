import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const MPIN_LENGTH = 6;

export default function MpinInput({
    value,
    onChange,
    onComplete,
    autoFocus = false,
    inputRef,
    accessibilityLabel = "Six digit MPIN",
}) {
    const internalInputRef = useRef(null);
    const resolvedInputRef = inputRef || internalInputRef;
    const [focused, setFocused] = useState(false);
    const [boxWidth, setBoxWidth] = useState(46);

    useEffect(() => {
        if (!autoFocus) return undefined;
        const timer = setTimeout(() => resolvedInputRef.current?.focus(), 250);
        return () => clearTimeout(timer);
    }, [autoFocus, resolvedInputRef]);

    const updateValue = (nextValue) => {
        const digits = String(nextValue || "").replace(/\D/g, "").slice(0, MPIN_LENGTH);
        onChange?.(digits);
        if (digits.length === MPIN_LENGTH) onComplete?.(digits);
    };

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            onPress={() => resolvedInputRef.current?.focus()}
            onLayout={(event) => {
                const available = event.nativeEvent.layout.width;
                setBoxWidth(Math.max(38, Math.min(54, Math.floor((available - 40) / MPIN_LENGTH))));
            }}
            style={styles.wrapper}
        >
            <TextInput
                ref={resolvedInputRef}
                value={value}
                onChangeText={updateValue}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                keyboardType="number-pad"
                autoComplete="off"
                secureTextEntry
                maxLength={MPIN_LENGTH}
                caretHidden
                style={styles.hiddenInput}
            />
            <View style={styles.row} pointerEvents="none">
                {Array.from({ length: MPIN_LENGTH }, (_, index) => {
                    const entered = index < value.length;
                    const active = focused && index === Math.min(value.length, MPIN_LENGTH - 1);
                    return (
                        <View
                            key={index}
                            style={[styles.box, { width: boxWidth, height: boxWidth + 10 }, active && styles.boxActive, entered && styles.boxFilled]}
                        >
                            <Text style={styles.dot}>{entered ? "•" : ""}</Text>
                        </View>
                    );
                })}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    wrapper: { width: "100%", minHeight: 64, justifyContent: "center" },
    hiddenInput: { position: "absolute", width: 1, height: 1, opacity: 0 },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    box: { borderWidth: 1.5, borderColor: "#CBD5E1", borderRadius: 14, backgroundColor: "#F8FAFC", alignItems: "center", justifyContent: "center" },
    boxActive: { borderColor: "#00A86B", backgroundColor: "#F0FDF4", shadowColor: "#00A86B", shadowOpacity: 0.16, shadowRadius: 6, elevation: 2 },
    boxFilled: { borderColor: "#86EFAC", backgroundColor: "#F0FDF4" },
    dot: { color: "#0F172A", fontSize: 31, lineHeight: 34, fontWeight: "900" },
});
