import React, {useEffect, useRef, useState} from "react";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import Track from "./entities/Track.ts";
import {Box, FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import CsvRow from "./entities/CsvRow.ts";
import {useParams, useNavigate} from "react-router-dom";
import headphoneImage  from "./assets/headphone.png";
import Example from "./Example.tsx";

interface Props {
    csvRows: CsvRow[];
}

const CONTINUING_PLAYING_INTERVAL = 8000;
const AudioPlayer: React.FC<Props> = ({ csvRows }) => {
    const [pages, setPages] = useState<{num: number, label: string}[]>([]);
    const [audios, setAudios] = useState<Track[]>([]);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [continuePlaying, setContinuePlaying] = useState(false);
    const [lastPlayedIndex, setLastPlayedIndex] = useState<number | null>(null);
    const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
    const { week, page } = useParams<{ week: string; page: string }>();

    useEffect(() => {
        const targetRows = csvRows.filter((row) => row.week === week);
        const tmpPages: { num: number; label: string; }[] = [];
        targetRows.forEach((row) => {
            if (!tmpPages.find((page) => page.num === parseInt(row.page))) {
                tmpPages.push({ num: parseInt(row.page), label: row.page_title });
            }
        });
        setPages(tmpPages);
    }, [csvRows, week]);

    useEffect(() => {
        const targetRows = csvRows.filter((row) => row.week === week && row.page === page);
        setAudios(
            targetRows
                .map((row) =>  {
                    return { title: row.title, url: row.url };
                })
        );
        setLastPlayedIndex(null);
    }, [csvRows, week, page]);

    useEffect(() => {
        audioRefs.current.forEach((audio) => {
            if (audio) {
                audio.playbackRate = playbackRate;
            }
        });
    }, [playbackRate, audios]);

    const navigate = useNavigate();
    const handlePageChange = (newPage: string) => {
        navigate(`/audio/${week}/${newPage}`);
    };

    const playNextAudio = (currentIndex: number) => {
        if (continuePlaying && currentIndex < audioRefs.current.length) {
            const currentAudio = audioRefs.current[currentIndex];
            if (currentAudio) {
                currentAudio.currentTime = 0; // Reset to start
                currentAudio.play();
                setLastPlayedIndex(currentIndex);
                currentAudio.onended = () => {
                    setTimeout(() => playNextAudio(currentIndex + 1), CONTINUING_PLAYING_INTERVAL);
                };
            }
        }
    };

    const handleAudioPlay = (index: number) => {
        audioRefs.current.forEach((audio, i) => {
            if (audio) {
                if (i !== index) {
                    audio.pause();
                    audio.currentTime = 0; // Reset to start
                }
            }
        });
        setLastPlayedIndex(index);
    };

    useEffect(() => {
        audioRefs.current.forEach((audio, index) => {
            if (audio) {
                audio.onplay = () => handleAudioPlay(index);
                audio.onended = () => {
                    if (continuePlaying) {
                        setTimeout(() => playNextAudio(index + 1), CONTINUING_PLAYING_INTERVAL);
                    }
                };
            }
        });
    }, [continuePlaying, audios]);

    return (
        <div style={{ width: 'fit-content', margin: 'auto'}}>
            <h1 style={{display: "flex", gap: "10px", justifyContent: "center", alignItems: "center"}}>
                <img src={headphoneImage} alt="headphone" style={{width: "50px"}}/>
                基礎-week{week}
            </h1>
            <Box marginBottom="20px">
                <FormControl sx={{ minWidth: "100px;"}}>
                    <Select
                        value={page}
                        onChange={(e) => handlePageChange(e.target.value)}
                    >
                        {
                            pages.map((page) => (
                                <MenuItem value={page.num} key={page.num}>{page.label}</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
            </Box>
            <Example tracks={audios}/>
            <div style={{display: "flex", gap: "10px", justifyContent: "center", alignItems: "center"}}>
                <FormControl sx={{ minWidth: "100px;"}}>
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
                <FormControl sx={{ minWidth: "100px;"}}>
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
            <List>
                {audios.map((audio, rowIndex) => (
                    <div key={audio.url}>
                        <ListItem
                            sx={{
                                display: "flex",
                                justifyContent: "center", // 横方向に中央寄せ
                                alignItems: "center", // 縦方向に中央寄せ
                                gap: "10px" // 要素間の間隔
                            }}
                        >
                            <span style={{
                                borderBottom: lastPlayedIndex === rowIndex ? "5px solid #86bff7" : "none"
                            }}>
                                {audio.title}
                            </span>
                            <audio ref={(el) => (audioRefs.current[rowIndex] = el)} preload="metadata"
                                   controls>
                                <source
                                    src={audio.url}
                                    type="audio/mpeg"/>
                                お使いのブラウザは音声プレーヤーをサポートしていません。
                            </audio>
                        </ListItem>
                        <Divider/>
                    </div>
                ))}
            </List>
        </div>
    );
};

export default AudioPlayer;