import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
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

const TRACK_DESCRIPTION = "A gentle journey back to yourself.";

// Circular art dimensions
const ART = 260;
const STROKE = 4;
const RING_R = (ART - STROKE) / 2; // radius of the progress ring
const RING_C = 2 * Math.PI * RING_R;

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
  const [favorited, setFavorited] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);

  const soundRef = useRef<Audio.Sound | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);

  useEffect(() => {
    console.log("[AUDIO] mount → setAudioModeAsync");
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    })
      .then(() => console.log("[AUDIO] audio mode set OK"))
      .catch((e) => console.log("AUDIO ERROR (setAudioMode):", e));

    return () => {
      console.log("[AUDIO] unmount → cleanup");
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      soundRef.current
        ?.unloadAsync()
        .catch((e) => console.log("AUDIO ERROR (unmount unload):", e));
    };
  }, []);

  // Pushed status updates from the native player (load progress + errors).
  // `track` is bound at load time so the finish handler knows which track
  // ended (component state would be stale inside this native callback).
  const handleStatus = (status: AVPlaybackStatus, track: Track) => {
    if (!status.isLoaded) {
      if (status.error) console.log("AUDIO ERROR (status.error):", status.error);
      return;
    }
    setPosition(status.positionMillis);
    setDuration(status.durationMillis ?? 0);
    setIsPlaying(status.isPlaying);
    if (status.didJustFinish) {
      console.log(`[AUDIO] finished ${track.day} "${track.title}"`);
      const currentIndex = TRACKS.findIndex((t) => t.id === track.id);
      const next = TRACKS[currentIndex + 1];
      if (next) {
        console.log(`[AUDIO] auto-advancing to ${next.day} "${next.title}"`);
        loadAndPlay(next);
      } else {
        console.log("[AUDIO] last track finished — stopping (no loop)");
        setIsPlaying(false);
        setPosition(0);
      }
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
          // Track-finish (and auto-advance) is handled in handleStatus.
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
        (st) => handleStatus(st, track),
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
      // Already loaded — just reopen the full-screen player, keep playing.
      setPlayerOpen(true);
    } else {
      loadAndPlay(track);
      setPlayerOpen(true);
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

  // Skip forward/back within the current track by a number of milliseconds.
  const seekBy = async (deltaMs: number) => {
    const sound = soundRef.current;
    if (!sound) return;
    const target = Math.max(0, Math.min(duration || 0, position + deltaMs));
    try {
      await sound.setPositionAsync(target);
      setPosition(target);
    } catch (e) {
      console.log("AUDIO ERROR (seekBy):", e);
    }
  };

  const prevTrack = () => {
    if (!activeTrack) return;
    const idx = TRACKS.findIndex((t) => t.id === activeTrack.id);
    const prev = TRACKS[idx - 1];
    if (prev) loadAndPlay(prev);
  };

  const nextTrack = () => {
    if (!activeTrack) return;
    const idx = TRACKS.findIndex((t) => t.id === activeTrack.id);
    const next = TRACKS[idx + 1];
    if (next) loadAndPlay(next);
  };

  const closePlayer = () => {
    // Return to the list but keep audio playing — the mini-player takes over.
    console.log("[AUDIO] minimizing player (audio keeps playing)");
    setPlayerOpen(false);
  };

  const onDownload = () => {
    Alert.alert(
      "Available offline",
      "This session ships with the app, so it already plays without a connection."
    );
  };

  const onPlaylist = () => {
    Alert.alert("Playlists", "Saving sessions to playlists is coming soon.");
  };

  const setSleepTimer = (minutes: number | null) => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    setSleepMinutes(minutes);
    if (minutes && minutes > 0) {
      sleepTimerRef.current = setTimeout(() => {
        soundRef.current?.pauseAsync().catch(() => undefined);
        setIsPlaying(false);
        setSleepMinutes(null);
        sleepTimerRef.current = null;
      }, minutes * 60 * 1000);
    }
  };

  const onTimer = () => {
    Alert.alert(
      "Sleep timer",
      sleepMinutes
        ? `Playback will pause in about ${sleepMinutes} min.`
        : "Pause playback after:",
      [
        { text: "5 minutes", onPress: () => setSleepTimer(5) },
        { text: "10 minutes", onPress: () => setSleepTimer(10) },
        { text: "30 minutes", onPress: () => setSleepTimer(30) },
        ...(sleepMinutes
          ? [
              {
                text: "Turn off",
                style: "destructive" as const,
                onPress: () => setSleepTimer(null),
              },
            ]
          : []),
        { text: "Cancel", style: "cancel" as const },
      ]
    );
  };

  const progressRatio = duration > 0 ? position / duration : 0;
  const currentIndex = activeTrack
    ? TRACKS.findIndex((t) => t.id === activeTrack.id)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < TRACKS.length - 1;

  // Position of the amber dot on the progress ring (starts at top, -90deg).
  const dotAngle = (progressRatio * 360 - 90) * (Math.PI / 180);
  const dotX = ART / 2 + RING_R * Math.cos(dotAngle);
  const dotY = ART / 2 + RING_R * Math.sin(dotAngle);

  // ---- Full-screen player ----
  if (activeTrack && playerOpen) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#142014", "#0D1A0D"]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          {/* Top bar */}
          <View style={styles.playerTopBar}>
            <Pressable onPress={closePlayer} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color="#D4E8D4" />
            </Pressable>
            <Text style={styles.topBarLabel}>GUIDED MEDITATION</Text>
            <View style={styles.topBarRight}>
              <Pressable onPress={() => setFavorited((f) => !f)} hitSlop={10}>
                <Ionicons
                  name={favorited ? "heart" : "heart-outline"}
                  size={22}
                  color={favorited ? "#C8813A" : "#6A946A"}
                />
              </Pressable>
              <Pressable hitSlop={10}>
                <Ionicons name="ellipsis-vertical" size={20} color="#6A946A" />
              </Pressable>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.playerContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Circular album art with progress ring */}
            <View style={styles.artWrap}>
              <Image
                source={require("../../assets/images/meditation-dusk.png")}
                style={styles.artImage}
              />
              <Svg width={ART} height={ART} style={StyleSheet.absoluteFill}>
                {/* Track (background) ring */}
                <Circle
                  cx={ART / 2}
                  cy={ART / 2}
                  r={RING_R}
                  stroke="rgba(30,58,30,0.9)"
                  strokeWidth={STROKE}
                  fill="none"
                />
                {/* Progress arc */}
                <Circle
                  cx={ART / 2}
                  cy={ART / 2}
                  r={RING_R}
                  stroke="#C8813A"
                  strokeWidth={STROKE}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={RING_C}
                  strokeDashoffset={RING_C * (1 - progressRatio)}
                  transform={`rotate(-90 ${ART / 2} ${ART / 2})`}
                />
                {/* Position dot */}
                <Circle cx={dotX} cy={dotY} r={7} fill="#F0C089" />
                <Circle cx={dotX} cy={dotY} r={4} fill="#C8813A" />
              </Svg>
              {loading && (
                <View style={styles.artLoading}>
                  <ActivityIndicator size="large" color="#C8813A" />
                </View>
              )}
            </View>

            {/* Title + description */}
            <Text style={styles.playerBigTitle}>{activeTrack.title}</Text>
            <Text style={styles.playerDescription}>{TRACK_DESCRIPTION}</Text>

            {/* Track counter + repeated title */}
            <Text style={styles.trackCounter}>
              Track {currentIndex + 1} of {TRACKS.length}
            </Text>
            <Text style={styles.playerChapterTitle}>{activeTrack.title}</Text>

            {loadError ? (
              <Text style={styles.errorText}>
                Could not load audio: {loadError}
              </Text>
            ) : null}

            {/* Linear progress */}
            <Pressable
              style={styles.progressBar}
              onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
              onPress={(e) => seek(e.nativeEvent.locationX)}
            >
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressRatio * 100}%` },
                ]}
              />
            </Pressable>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <Pressable onPress={() => seekBy(-10000)} hitSlop={10}>
                <MaterialIcons name="replay-10" size={30} color="#D4E8D4" />
              </Pressable>
              <Pressable
                onPress={prevTrack}
                hitSlop={10}
                disabled={!hasPrev}
                style={!hasPrev && styles.ctrlDisabled}
              >
                <Ionicons name="play-skip-back" size={28} color="#D4E8D4" />
              </Pressable>
              <Pressable style={styles.playCircle} onPress={togglePlay}>
                {loading ? (
                  <ActivityIndicator color="#0D1A0D" />
                ) : (
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={32}
                    color="#0D1A0D"
                    style={isPlaying ? undefined : { marginLeft: 3 }}
                  />
                )}
              </Pressable>
              <Pressable
                onPress={nextTrack}
                hitSlop={10}
                disabled={!hasNext}
                style={!hasNext && styles.ctrlDisabled}
              >
                <Ionicons name="play-skip-forward" size={28} color="#D4E8D4" />
              </Pressable>
              <Pressable onPress={() => seekBy(10000)} hitSlop={10}>
                <MaterialIcons name="forward-10" size={30} color="#D4E8D4" />
              </Pressable>
            </View>

            {/* Bottom actions */}
            <View style={styles.actionRow}>
              <Pressable style={styles.actionItem} onPress={onDownload}>
                <Ionicons name="download-outline" size={24} color="#D4E8D4" />
                <Text style={styles.actionLabel}>Download</Text>
              </Pressable>
              <Pressable style={styles.actionItem} onPress={onPlaylist}>
                <Ionicons name="list" size={24} color="#D4E8D4" />
                <Text style={styles.actionLabel}>Playlist</Text>
              </Pressable>
              <Pressable style={styles.actionItem} onPress={onTimer}>
                <Ionicons
                  name="timer-outline"
                  size={24}
                  color={sleepMinutes ? "#C8813A" : "#D4E8D4"}
                />
                <Text
                  style={[
                    styles.actionLabel,
                    sleepMinutes ? { color: "#C8813A" } : null,
                  ]}
                >
                  {sleepMinutes ? `${sleepMinutes} min` : "Timer"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ---- Track list ----
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ImageBackground
        source={require("../../assets/images/meditation-dusk.png")}
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
            activeTrack ? styles.contentWithMini : null,
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

      {/* Persistent mini-player (Spotify-style) */}
      {activeTrack && (
        <Pressable style={styles.miniPlayer} onPress={() => setPlayerOpen(true)}>
          <View style={styles.miniProgressTrack}>
            <View
              style={[styles.miniProgressFill, { width: `${progressRatio * 100}%` }]}
            />
          </View>
          <View style={styles.miniRow}>
            <Image
              source={require("../../assets/images/meditation-dusk.png")}
              style={styles.miniThumb}
            />
            <View style={styles.miniInfo}>
              <Text style={styles.miniTitle} numberOfLines={1}>
                {activeTrack.title}
              </Text>
              <Text style={styles.miniDay}>{activeTrack.day}</Text>
            </View>
            <Pressable onPress={togglePlay} hitSlop={12} style={styles.miniPlayBtn}>
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={28}
                color="#C8813A"
              />
            </Pressable>
          </View>
        </Pressable>
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
    fontFamily: "Literata_700Bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#D4E8D4",
    fontSize: 15,
    fontFamily: "DMSans_400Regular",
  },

  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
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
    fontFamily: "DMSans_500Medium",
  },
  trackTitle: {
    flex: 1,
    color: "#E8F0E8",
    fontSize: 15,
    fontFamily: "DMSans_500Medium",
  },

  // ---- Player ----
  playerTopBar: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarLabel: {
    color: "#6A946A",
    fontSize: 12,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 2,
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  playerContent: {
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 130,
    alignItems: "center",
  },
  artWrap: {
    width: ART,
    height: ART,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 36,
    shadowColor: "#C8813A",
    shadowOpacity: 0.35,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },
  artImage: {
    position: "absolute",
    top: 18,
    left: 18,
    width: ART - 36,
    height: ART - 36,
    borderRadius: (ART - 36) / 2,
  },
  artLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  playerBigTitle: {
    color: "#E8F0E8",
    fontSize: 26,
    fontFamily: "Literata_700Bold",
    textAlign: "center",
    marginBottom: 8,
  },
  playerDescription: {
    color: "#D4E8D4",
    fontSize: 15,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: 300,
  },
  trackCounter: {
    color: "#6A946A",
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    textAlign: "center",
    marginBottom: 4,
  },
  playerChapterTitle: {
    color: "#C8B896",
    fontSize: 18,
    fontFamily: "Literata_600SemiBold",
    textAlign: "center",
    marginBottom: 28,
  },
  progressBar: {
    width: "100%",
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
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  timeText: {
    color: "#6A946A",
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
  },
  controls: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 40,
  },
  ctrlDisabled: { opacity: 0.3 },
  playCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#C8813A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#C8813A",
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  actionRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "rgba(42,74,42,0.5)",
    paddingTop: 24,
  },
  actionItem: {
    alignItems: "center",
    gap: 8,
  },
  actionLabel: {
    color: "#6A946A",
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
  },
  errorText: {
    color: "#E07A5F",
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    marginBottom: 12,
  },

  // ---- Mini-player ----
  contentWithMini: {
    paddingBottom: 96,
  },
  miniPlayer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    backgroundColor: "#1E3A1E",
    borderTopWidth: 1,
    borderTopColor: "#2A4A2A",
  },
  miniProgressTrack: {
    height: 2,
    width: "100%",
    backgroundColor: "#2A4A2A",
  },
  miniProgressFill: {
    height: "100%",
    backgroundColor: "#C8813A",
  },
  miniRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 12,
  },
  miniThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  miniInfo: {
    flex: 1,
  },
  miniTitle: {
    color: "#E8F0E8",
    fontSize: 15,
    fontFamily: "Literata_600SemiBold",
    marginBottom: 1,
  },
  miniDay: {
    color: "#6A946A",
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
  },
  miniPlayBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
