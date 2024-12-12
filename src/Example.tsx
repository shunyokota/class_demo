import React, { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import Track from "./entities/Track.ts";
import Divider from "@mui/material/Divider";
import { Button, ButtonGroup, FormControl, InputLabel, ListItemButton, MenuItem, Select, CircularProgress } from "@mui/material"; // Added CircularProgress
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const CONTINUING_PLAYING_INTERVAL = 8000;

interface Props {
    tracks: Track[];
}

const Example: React.FC<Props> = ({ tracks }) => {
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const progressRef = useRef(0);
    useEffect(() => {
        progressRef.current = progress;
    }, [progress]);
    const [duration, setDuration] = useState(0);
    const durationRef = useRef(0);
    useEffect(() => {
        durationRef.current = duration;
    }, [duration]);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [continuePlaying, setContinuePlaying] = useState(false);
    const continuePlayingRef = useRef(continuePlaying);
    const inContinuePlayingIntervalRef = useRef<boolean>(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const isPlayingRef = useRef<boolean>(false);
    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);
    const [loading, setLoading] = useState(false); // Added loading state

    useEffect(() => {
        continuePlayingRef.current = continuePlaying;
    }, [continuePlaying]);

    const soundRef = useRef<Howl | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const playTrack = (index: number) => {
        if (soundRef.current) {
            soundRef.current.stop();
        }
        setLoading(true); // Set loading to true when starting to load
        const sound = new Howl({
            src: [tracks[index].url],
            onload: () => {
                setLoading(false); // Set loading to false when finished loading
            },
            onend: () => {
                if (continuePlayingRef.current) {
                    setProgress(durationRef.current);
                    inContinuePlayingIntervalRef.current = true;
                    setTimeout(() => {
                        if (isPlayingRef.current && inContinuePlayingIntervalRef.current) {
                            handleNext();
                        }
                    }, CONTINUING_PLAYING_INTERVAL);
                } else {
                    setIsPlaying(false);
                    setProgress(0);
                }
            },
        });

        sound.play();
        sound.rate(playbackRate);
        soundRef.current = sound;

        setIsPlaying(true);

        sound.once("load", () => {
            setDuration(sound.duration());
        });

        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }
        progressIntervalRef.current = setInterval(() => {
            if (sound.playing()) {
                setProgress(sound.seek() as number);
            }
        }, 1000 / 30); // 30FPS
    };
    const playTrackRef = useRef(playTrack);
    useEffect(() => {
        playTrackRef.current = playTrack;
    }, [playTrack]);

    const handlePlayPause = () => {
        if (isPlayingRef.current) {
            soundRef.current?.pause();
            setIsPlaying(false)
        } else if (inContinuePlayingIntervalRef.current) {
            inContinuePlayingIntervalRef.current = false;
            handleNext();
        } else {
            if (!soundRef.current) {
                playTrackRef.current(currentTrackIndex);
            } else {
                soundRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const handleNext = () => {
        inContinuePlayingIntervalRef.current = false;
        setCurrentTrackIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % tracks.length;
            playTrackRef.current(nextIndex);
            return nextIndex;
        });
    };

    const handlePrev = () => {
        const prevIndex = progressRef.current > 3 ? currentTrackIndex : (currentTrackIndex - 1 + tracks.length) % tracks.length;
        setCurrentTrackIndex(prevIndex);
        playTrackRef.current(prevIndex);
    };

    const handleSelectTrack = (index: number) => {
        setCurrentTrackIndex(index);
        playTrackRef.current(index);
    }

    const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(event.target.value);
        soundRef.current?.seek(newTime);
        setProgress(newTime);
    };

    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.stop();
                soundRef.current = null;
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            setIsPlaying(false);
            setCurrentTrackIndex(0);
            setProgress(0);
            setDuration(0);
            inContinuePlayingIntervalRef.current = false;
        };
    }, [tracks]);

    useEffect(() => {
            if (progressIntervalRef.current) {
                soundRef.current?.rate(playbackRate);
            }
        },
        [playbackRate]
    );

    return (tracks.length > 0 && (
        <>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
                <FormControl sx={{ minWidth: "100px;" }}>
                    <InputLabel id="demo-simple-select-label">再生速度</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={playbackRate}
                        label="再生速度"
                        onChange={(e) => setPlaybackRate(parseFloat(e.target.value as string))}
                    >
                        {
                            [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5].map((speed, rowIndex) => (
                                <MenuItem value={speed} key={rowIndex}>{speed}倍</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
                <FormControl sx={{ minWidth: "100px;" }}>
                    <InputLabel id="continue-playing-select-label">続けて再生</InputLabel>
                    <Select
                        labelId="continue-playing-select-label"
                        id="continue-playing-select"
                        value={continuePlaying ? "yes" : "no"}
                        label="Continue playing"
                        onChange={(e) => setContinuePlaying(e.target.value === "yes")}
                    >
                        <MenuItem value="no">OFF</MenuItem>
                        <MenuItem value="yes">ON</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <div style={{ textAlign: "center", padding: "20px" }}>
                <p style={{ fontSize: '120%', fontWeight: 'bold' }}>{tracks[currentTrackIndex].title}</p>
                <ButtonGroup variant="outlined" aria-label="Basic button group">
                    <Button onClick={handlePrev}><SkipPreviousIcon /></Button>
                    <Button onClick={handlePlayPause}>
                        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    </Button>
                    <Button onClick={handleNext}><SkipNextIcon /></Button>
                </ButtonGroup>
                <div style={{ margin: "20px 0" }}>
                    <input
                        type="range"
                        min="0"
                        max={duration}
                        value={progress}
                        step="0.1"
                        onChange={handleSeek}
                        style={{ width: "100%" }}
                    />
                    <div>
                        {
                            loading ? <CircularProgress size={15}/> :
                                (<><span>{formatTime(progress)}</span> / <span>{formatTime(duration)}</span></>)
                        }
                    </div>
                </div>
            </div>
            {tracks.map((track, rowIndex) => (
                <div key={track.url}>
                    <ListItemButton
                        onClick={() => handleSelectTrack(rowIndex)}
                        sx={{
                            display: "flex",
                            justifyContent: "center", // 横方向に中央寄せ
                            alignItems: "center", // 縦方向に中央寄せ
                            gap: "10px" // 要素間の間隔
                        }}
                    >
                        <span style={{
                            borderBottom: currentTrackIndex === rowIndex ? "5px solid #86bff7" : "none"
                        }}>
                            {track.title}
                        </span>
                    </ListItemButton>
                    <Divider />
                </div>
            ))}
        </>
    ));
};

const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

export default Example;