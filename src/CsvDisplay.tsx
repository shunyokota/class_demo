import React, {useEffect, useRef, useState} from "react";
import Papa from "papaparse";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import Audio from "./entities/Audio.ts";
import {Box, FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import CsvRow from "./entities/CsvRow.ts";
import {useParams, useNavigate} from "react-router-dom";


interface Props {
    csvRows: CsvRow[];
}
const CsvDisplay: React.FC<Props> = ({ csvRows }) => {
    // const [page, setPage] = useState(1);
    const [pages, setPages] = useState<{num: number, label: string}[]>([]);
    // const [data, setData] = useState<CsvRow[]>([]);
    const [audios, setAudios] = useState<Audio[]>([]);
    const [playbackRate, setPlaybackRate] = useState(1.0);
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
    }, [csvRows, week, page]);

    useEffect(() => {
        audioRefs.current.forEach((audio) => {
            if (audio) {
                audio.playbackRate = playbackRate;
            }
        });
    }, [playbackRate]);

    const navigate = useNavigate();
    const handlePageChange = (newPage: string) => {
        // console.log('test');
        // const newPage = event.target.value;
        // URLを /audio/:week/:newPage に更新
        navigate(`/audio/${week}/${newPage}`);
    };


    return (
        <div>
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
            <div>
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
            </div>
            <List>
                {audios.map((audio, rowIndex) => (
                    <div key={page + '_' + rowIndex}>
                        <ListItem
                                  sx={{
                                      display: "flex",
                                      justifyContent: "center", // 横方向に中央寄せ
                                      alignItems: "center", // 縦方向に中央寄せ
                                      gap: "10px", // 要素間の間隔
                                  }}
                        >
                                {audio.title}
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

export default CsvDisplay;