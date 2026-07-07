import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
} from "react-native";
import { Audio } from "expo-av";
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
  { id: 1, title: "今晚你可以休息了", day: "Day 1", source: require("../../assets/audio/Day 1 今晚你可以休息了.wav") },
  { id: 2, title: "我是安全的", day: "Day 2", source: require("../../assets/audio/Day 2 我是安全的.wav") },
  { id: 3, title: "允许情绪存在", day: "Day 3", source: require("../../assets/audio/Day 3 允许情绪存在.wav") },
  { id: 4, title: "放下今天", day: "Day 4", source: require("../../assets/audio/Day 4 放下今天.wav") },
  { id: 5, title: "给自己一个拥抱", day: "Day 5", source: require("../../assets/audio/Day 5 给自己一个拥抱.wav") },
  { id: 6, title: "我值得被爱", day: "Day 6", source: require("../../assets/audio/Day 6 我值得被爱.wav") },
  { id: 7, title: "我的安全岛", day: "Day 7", source: require("../../assets/audio/Day 7 我的安全岛.wav") },
  { id: 8, title: "看见委屈", day: "Day 8", source: require("../../assets/audio/Day 8 看见委屈.wav") },
  { id: 9, title: "释放愤怒", day: "Day 9", source: require("../../assets/audio/Day 9 释放愤怒.wav") },
  { id: 10, title: "放下责备", day: "Day 10", source: require("../../assets/audio/Day 10 放下责备.wav") },
  { id: 11, title: "我不需要完美", day: "Day 11", source: require("../../assets/audio/Day 11 我不需要完美.wav") },
  { id: 12, title: "被理解的感觉", day: "Day 12", source: require("../../assets/audio/Day 12 被理解的感觉.wav") },
  { id: 13, title: "给小时候的自己", day: "Day 13", source: require("../../assets/audio/Day 13 给小时候的自己.wav") },
  { id: 14, title: "希望正在回来", day: "Day 14", source: require("../../assets/audio/Day 14 希望正在回来.wav") },
  { id: 15, title: "理解而不是责怪", day: "Day 15", source: require("../../assets/audio/Day 15 理解而不是责怪.wav") },
  { id: 16, title: "我可以保护自己", day: "Day 16", source: require("../../assets/audio/Day 16 我可以保护自己.wav") },
  { id: 17, title: "慢慢靠近", day: "Day 17", source: require("../../assets/audio/Day 17 慢慢靠近.wav") },
  { id: 18, title: "我值得被珍惜", day: "Day 18", source: require("../../assets/audio/Day 18 我值得被珍惜.wav") },
  { id: 19, title: "爱依然存在", day: "Day 19", source: require("../../assets/audio/Day 19 爱依然存在.wav") },
  { id: 20, title: "未来的我", day: "Day 20", source: require("../../assets/audio/Day 20 未来的我.wav") },
  { id: 21, title: "爱与自由", day: "Day 21", source: require("../../assets/audio/Day 21 爱与自由.wav") },
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

  const soundRef = useRef<Audio.Sound | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    }).catch((e) => console.error("Audio mode error:", e));

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      soundRef.current
        ?.unloadAsync()
        .catch((e) => console.error("Unload error:", e));
    };
  }, []);

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
    try {
      await unloadCurrent();
      setActiveTrack(track);
      setPosition(0);
      setDuration(0);
      const { sound } = await Audio.Sound.createAsync(track.source, {
        shouldPlay: true,
      });
      soundRef.current = sound;
      setIsPlaying(true);
      startPolling();
    } catch (e) {
      console.error("Load audio error:", e);
    }
  };

  const togglePlay = async () => {
    const sound = soundRef.current;
    if (!sound) return;
    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) return;
      if (status.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (e) {
      console.error("Toggle play error:", e);
    }
  };

  const onSelectTrack = (track: Track) => {
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
                <Ionicons
                  name={isActive && isPlaying ? "pause-circle" : "play-circle"}
                  size={32}
                  color="#C8813A"
                />
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
});
