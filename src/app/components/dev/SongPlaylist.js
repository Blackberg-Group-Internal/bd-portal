import { useState, useEffect, useRef } from "react";

const APPLE_MUSIC_API_URL = "https://api.music.apple.com/v1/catalog/us/search";
const DEV_TOKEN = process.env.NEXT_PUBLIC_APPLE_MUSIC_TOKEN;

export default function SongList({ songs }) {
  const [musicKit, setMusicKit] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [loadingSong, setLoadingSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.MusicKit) {
      setMusicKit(window.MusicKit.getInstance());
    }
  }, []);

  useEffect(() => {
    if (currentTrack) {
      const updateProgress = () => {
        if (currentTrack.duration) {
          setProgress((currentTrack.currentTime / currentTrack.duration) * 100);
        }
      };

      currentTrack.addEventListener("timeupdate", updateProgress);

      return () => {
        currentTrack.removeEventListener("timeupdate", updateProgress);
      };
    }
  }, [currentTrack]);

  const fetchSongPreview = async (title, artist) => {
    try {
      const response = await fetch(
        `${APPLE_MUSIC_API_URL}?types=songs&term=${encodeURIComponent(title + " " + artist)}`,
        { headers: { Authorization: `Bearer ${DEV_TOKEN}` } }
      );
      const data = await response.json();
      return data.results.songs?.data[0]?.attributes?.previews[0]?.url || null;
    } catch (error) {
      console.error("Error fetching song preview:", error);
      return null;
    }
  };

  const playPreview = async (index) => {
    if (!musicKit) return;

    const song = songs[index];
    if (!song) return;

    setLoadingSong(song.title);

    // Stop and reset previous track
    if (currentTrack) {
      currentTrack.pause();
      setCurrentTrack(null);
      setIsPlaying(false);
    }

    const previewUrl = await fetchSongPreview(song.title, song.artist);
    if (previewUrl) {
      const audio = new Audio(previewUrl);
      audio.volume = 0.3;
      audio.onended = () => nextTrack(); // Auto-play next track
      setCurrentTrack(audio);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((error) => console.error("Playback failed:", error));
      }
    }

    setLoadingSong(null);
    setCurrentIndex(index);
  };

  const togglePlayPause = () => {
    if (currentTrack) {
      if (isPlaying) {
        currentTrack.pause();
      } else {
        currentTrack.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      playPreview(currentIndex);
    }
  };

  const nextTrack = () => {
    const nextIndex = (currentIndex + 1) % songs.length;
    playPreview(nextIndex);
  };

  const prevTrack = () => {
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    playPreview(prevIndex);
  };

  return (
    <div className="container music-player p-3 rounded shadow-sm">
      {/* Controls */}
      <div className="d-flex justify-content-center align-items-center my-3">
        <button className="btn btn-outline-primary px-2 py-1 me-3 rounded-circle" onClick={prevTrack}>⏮</button>
        <button className="btn btn-primary px-5 py-4 rounded-circle" onClick={togglePlayPause}>
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button className="btn btn-outline-primary px-2 py-1 ms-3 rounded-circle" onClick={nextTrack}>⏭</button>
      </div>

      {/* Progress Bar */}
      <div className="progress mb-3" style={{ height: "5px" }}>
        <div
          className="progress-bar bg-primary"
          role="progressbar"
          style={{ width: `${progress}%` }}
          ref={progressRef}
        ></div>
      </div>

      {/* Song List */}
      <ul className="list-group">
        {songs.map((song, index) => (
          <li
            key={index}
            className={`list-group-item d-flex justify-content-between align-items-center ${currentIndex === index ? "bg-primary active" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => playPreview(index)}
          >
            <span>🎵 {song.title} - {song.artist}</span>
            {loadingSong === song.title && (
              <div className="spinner-border spinner-border-sm text-primary ms-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}