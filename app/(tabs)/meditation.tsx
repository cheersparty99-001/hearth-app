import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

interface Track {
  id: number;
  title: string;
  day: string;
  source: any;
}

const TRACKS: Track[] = [
  { id: 1, title: "You Can Rest Now", day: "Day 1", source: require("../../assets/audio/Day 1 今晚你可以休息了.m4a") },
  { id: 2, title: "Safe in This Moment", day: "Day 2", source: require("../../assets/audio/Day 2 我是安全的.m4a") },
  { id: 3, title: "Let Your Feelings Be", day: "Day 3", source: require("../../assets/audio/Day 3 允许情绪存在.m4a") },
  { id: 4, title: "Gently Release the Day", day: "Day 4", source: require("../../assets/audio/Day 4 放下今天.m4a") },
  { id: 5, title: "Hold Yourself Gently", day: "Day 5", source: require("../../assets/audio/Day 5 给自己一个拥抱.m4a") },
  { id: 6, title: "You Are Worthy of Love", day: "Day 6", source: require("../../assets/audio/Day 6 我值得被爱.m4a") },
  { id: 7, title: "Your Safe Harbour", day: "Day 7", source: require("../../assets/audio/Day 7 我的安全岛.m4a") },
  { id: 8, title: "Gently Seen", day: "Day 8", source: require("../../assets/audio/Day 8 看见委屈.m4a") },
  { id: 9, title: "Letting the Anger Soften", day: "Day 9", source: require("../../assets/audio/Day 9 释放愤怒.m4a") },
  { id: 10, title: "Softly Setting Down Blame", day: "Day 10", source: require("../../assets/audio/Day 10 放下责备.m4a") },
  { id: 11, title: "You Are Enough", day: "Day 11", source: require("../../assets/audio/Day 11 我不需要完美.m4a") },
  { id: 12, title: "Softly Understood", day: "Day 12", source: require("../../assets/audio/Day 12 被理解的感觉.m4a") },
  { id: 13, title: "A Letter to Little You", day: "Day 13", source: require("../../assets/audio/Day 13 给小时候的自己.m4a") },
  { id: 14, title: "Hope Is Finding Its Way Back", day: "Day 14", source: require("../../assets/audio/Day 14 希望正在回来.m4a") },
  { id: 15, title: "Meeting Yourself with Kindness", day: "Day 15", source: require("../../assets/audio/Day 15 理解而不是责怪.m4a") },
  { id: 16, title: "You Are Safe with Yourself", day: "Day 16", source: require("../../assets/audio/Day 16 我可以保护自己.m4a") },
  { id: 17, title: "Drawing Closer, Slowly", day: "Day 17", source: require("../../assets/audio/Day 17 慢慢靠近.m4a") },
  { id: 18, title: "You Deserve Tenderness", day: "Day 18", source: require("../../assets/audio/Day 18 我值得被珍惜.m4a") },
  { id: 19, title: "Love Is Still Here", day: "Day 19", source: require("../../assets/audio/Day 19 爱依然存在.m4a") },
  { id: 20, title: "The One You're Becoming", day: "Day 20", source: require("../../assets/audio/Day 20 未来的我.m4a") },
  { id: 21, title: "Love and Freedom", day: "Day 21", source: require("../../assets/audio/Day 21 爱与自由.m4a") },
];

function formatTime(millis: number): string {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function Meditation() {
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    console.log("[AUDIO] mount → setAudioModeAsync");
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    })
      .then(() => console.log("[AUDIO] audio mode set OK"))
      .catch((e) => console.log("AUDIO ERROR (setAudioMode):", e));

    return () => {
      console.log("[AUDIO] unmount → cleanup");
      if (intervalRef.current) clearInterval(intervalRef.current);
      soundRef.current
        ?.unloadAsync()
        .catch((e) => console.log("AUDIO ERROR (unmount unload):", e));
    };
  }, []);

  // Pushed status updates from the native player (load progress + errors)
  const onStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) console.log("AUDIO ERROR (status.error):", status.error);
      return;
    }
    setPosition(status.positionMillis);
    setDuration(status.durationMillis ?? 0);
    setIsPlaying(status.isPlaying);
    if (status.didJustFinish) {
      console.log("[AUDIO] track finished");
      setIsPlaying(false);
      setPosition(0);
    }
  };

  const startPolling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      const sound = soundRef.current;
      if (!sound) return;
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setDuration(status.durationMillis ?? 0);
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
            await sound.setPositionAsync(0);
            await sound.pauseAsync();
          }
        }
      } catch (e) {
        console.error("Status poll error:", e);
      }
    }, 500);
  };

  const unloadCurrent = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch (e) {
        console.error("Unload error:", e);
      }
      soundRef.current = null;
    }
  };

  const loadAndPlay = async (track: Track) => {
    console.log(`[AUDIO] loadAndPlay START → ${track.day} "${track.title}"`);
    setLoadError(null);
    setLoading(true);
    try {
      console.log("[AUDIO] unloading previous sound (if any)...");
      await unloadCurrent();
      setActiveTrack(track);
      setPosition(0);
      setDuration(0);
      console.log(
        "[AUDIO] calling createAsync (downloadFirst=FALSE, shouldPlay=true)..."
      );
      const { sound, status } = await Audio.Sound.createAsync(
        track.source,
        { shouldPlay: true },
        onStatusUpdate,
        /* downloadFirst */ false
      );
      console.log(
        `[AUDIO] createAsync RESOLVED. isLoaded=${status.isLoaded}`,
        status
      );
      soundRef.current = sound;
      setIsPlaying(true);
      startPolling();
      console.log("[AUDIO] polling started, sound stored");
    } catch (e) {
      console.log("AUDIO ERROR (createAsync/loadAndPlay):", e);
      setLoadError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = async () => {
    console.log("[AUDIO] togglePlay tapped");
    const sound = soundRef.current;
    if (!sound) {
      console.log("[AUDIO] togglePlay: no sound loaded");
      return;
    }
    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) {
        console.log("[AUDIO] togglePlay: sound not loaded yet");
        return;
      }
      if (status.isPlaying) {
        console.log("[AUDIO] pausing");
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        console.log("[AUDIO] resuming play");
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (e) {
      console.log("AUDIO ERROR (togglePlay):", e);
    }
  };

  const onSelectTrack = (track: Track) => {
    console.log(`[AUDIO] tapped ${track.day} (active=${activeTrack?.day})`);
    if (activeTrack?.id === track.id) {
      togglePlay();
    } else {
      loadAndPlay(track);
    }
  };

  const seek = async (locationX: number) => {
    const sound = soundRef.current;
    if (!sound || duration <= 0 || barWidth <= 0) return;
    const ratio = Math.max(0, Math.min(1, locationX / barWidth));
    try {
      await sound.setPositionAsync(ratio * duration);
      setPosition(ratio * duration);
    } catch (e) {
      console.error("Seek error:", e);
    }
  };

  const skipBack = async () => {
    const sound = soundRef.current;
    if (!sound) return;
    try {
      await sound.setPositionAsync(0);
      setPosition(0);
    } catch (e) {
      console.error("Skip back error:", e);
    }
  };

  const skipForward = () => {
    if (!activeTrack) return;
    const idx = TRACKS.findIndex((t) => t.id === activeTrack.id);
    const next = TRACKS[idx + 1];
    if (next) loadAndPlay(next);
  };

  const progressRatio = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ImageBackground
        source={require("../../assets/images/meditation-bg.png")}
        style={StyleSheet.absoluteFill}
        imageStyle={styles.bgImage}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.5)", "rgba(6,13,6,0.85)", "#09160a"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.headerWrap}>
          <Text style={styles.title}>Forest Meditation</Text>
          <Text style={styles.subtitle}>21 days of guided healing</Text>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            activeTrack ? styles.contentWithPlayer : null,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {TRACKS.map((track) => {
            const isActive = activeTrack?.id === track.id;
            return (
              <Pressable
                key={track.id}
                style={[styles.card, isActive && styles.cardActive]}
                onPress={() => onSelectTrack(track)}
              >
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>{track.day}</Text>
                </View>
                <Text style={styles.trackTitle} numberOfLines={1}>
                  {track.title}
                </Text>
                {isActive && loading ? (
                  <ActivityIndicator size="small" color="#C8813A" />
                ) : (
                  <Ionicons
                    name={isActive && isPlaying ? "pause-circle" : "play-circle"}
                    size={32}
                    color="#C8813A"
                  />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {/* Bottom player sheet */}
      {activeTrack && (
        <View style={styles.playerSheet}>
          <Text style={styles.playerTitle} numberOfLines={1}>
            {activeTrack.title}
          </Text>
          <Text style={styles.playerDay}>{activeTrack.day}</Text>

          {loading ? (
            <View style={styles.statusRow}>
              <ActivityIndicator size="small" color="#C8813A" />
              <Text style={styles.statusText}>Loading audio...</Text>
            </View>
          ) : loadError ? (
            <Text style={styles.errorText}>Could not load audio: {loadError}</Text>
          ) : null}

          <Pressable
            style={styles.progressBar}
            onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
            onPress={(e) => seek(e.nativeEvent.locationX)}
          >
            <View
              style={[styles.progressFill, { width: `${progressRatio * 100}%` }]}
            />
          </Pressable>

          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          <View style={styles.controls}>
            <Pressable onPress={skipBack} hitSlop={12}>
              <Ionicons name="play-skip-back" size={28} color="#C8813A" />
            </Pressable>
            <Pressable onPress={togglePlay} hitSlop={12}>
              <Ionicons
                name={isPlaying ? "pause-circle" : "play-circle"}
                size={64}
                color="#C8813A"
              />
            </Pressable>
            <Pressable onPress={skipForward} hitSlop={12}>
              <Ionicons name="play-skip-forward" size={28} color="#C8813A" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  bgImage: { opacity: 0.35 },
  safe: { flex: 1 },

  headerWrap: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  title: {
    color: "#E8F0E8",
    fontSize: 28,
    fontFamily: "Lora_700Bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#D4E8D4",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },

  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
  },
  contentWithPlayer: {
    paddingBottom: 220,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(30, 58, 30, 0.92)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A4A2A",
    padding: 16,
  },
  cardActive: {
    borderColor: "#C8813A",
  },
  dayBadge: {
    backgroundColor: "#243824",
    borderRadius: 8,
    padding: 6,
  },
  dayBadgeText: {
    color: "#C8813A",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  trackTitle: {
    flex: 1,
    color: "#E8F0E8",
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },

  playerSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0F1F0F",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: "#2A4A2A",
  },
  playerTitle: {
    color: "#E8F0E8",
    fontSize: 18,
    fontFamily: "Lora_600SemiBold",
    marginBottom: 2,
  },
  playerDay: {
    color: "#6A946A",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#1E3A1E",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#C8813A",
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  timeText: {
    color: "#6A946A",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 36,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  statusText: {
    color: "#6A946A",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  errorText: {
    color: "#E07A5F",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
});
