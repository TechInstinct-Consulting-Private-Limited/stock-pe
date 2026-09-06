import jsQR from "jsqr";
import { createElement, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export async function decodeQrFromImageFile(file) {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(bitmap, 0, 0);
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    return (
        jsQR(image.data, canvas.width, canvas.height, {
            inversionAttempts: "attemptBoth",
        })?.data || ""
    );
}

/**
 * Browser QR scanner. expo-camera cannot decode barcodes on web, so the camera
 * stream is rendered into a canvas and decoded with jsQR on every frame.
 */
export default function WebQrScanner({ onScan, onError, paused }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const frameRef = useRef(0);
    const pausedRef = useRef(paused);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        pausedRef.current = paused;
    }, [paused]);

    useEffect(() => {
        let stream;
        let cancelled = false;

        const scanFrame = () => {
            frameRef.current = requestAnimationFrame(scanFrame);

            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas || pausedRef.current) return;
            if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

            const width = video.videoWidth;
            const height = video.videoHeight;
            if (!width || !height) return;

            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext("2d", { willReadFrequently: true });
            context.drawImage(video, 0, 0, width, height);

            const image = context.getImageData(0, 0, width, height);
            const result = jsQR(image.data, width, height, {
                inversionAttempts: "attemptBoth",
            });

            if (result?.data) {
                pausedRef.current = true;
                onScan({ data: result.data });
            }
        };

        const start = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                });
                if (cancelled) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }
                const video = videoRef.current;
                video.srcObject = stream;
                video.setAttribute("playsinline", "true");
                video.muted = true;
                await video.play();
                setReady(true);
                frameRef.current = requestAnimationFrame(scanFrame);
            } catch (_error) {
                onError(
                    "The browser blocked camera access. Allow the camera for this site, or upload a photo of the QR instead."
                );
            }
        };

        start();

        return () => {
            cancelled = true;
            cancelAnimationFrame(frameRef.current);
            stream?.getTracks().forEach((track) => track.stop());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View style={StyleSheet.absoluteFill}>
            {createElement("video", {
                ref: videoRef,
                autoPlay: true,
                playsInline: true,
                muted: true,
                style: {
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    backgroundColor: "#071329",
                },
            })}
            {createElement("canvas", { ref: canvasRef, style: { display: "none" } })}
            {!ready ? (
                <View style={styles.loading}>
                    <Text style={styles.loadingText}>Starting camera…</Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    loading: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: { color: "#FFFFFF", fontWeight: "700" },
});
