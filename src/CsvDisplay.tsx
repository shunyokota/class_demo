import React, {useEffect, useRef, useState} from "react";
import Papa from "papaparse";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import Audio from "./entities/Audio.ts";
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";


interface CsvRow {
    [key: string]: string; // CSVの各行をオブジェクト形式で保持
}

const CsvDisplay: React.FC = () => {
    const [page, setPage] = useState(1);
    const [pageTitle, setPageTitle] = useState("");
    const [data, setData] = useState<CsvRow[]>([]);
    const [audios, setAudios] = useState<Audio[]>([]);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

    useEffect(() => {
        // CSVファイルをフェッチ
        fetch("/audio.csv")
            .then((response) => response.text())
            .then((csvData) => {
                console.log(csvData);
                // papaparseを使ってCSVを解析
                const parsedData = Papa.parse<CsvRow>(csvData, { header: true });
                const targetRows = parsedData.data.filter((row) => parseInt(row.page) === page);
                if (targetRows.length > 0) {
                    setPageTitle(targetRows[0].page_title);
                }
                setAudios(
                    targetRows
                    .map((row) =>  {
                        return { title: row.title, url: row.url };
                    })
                );
                setData(parsedData.data);
            })
            .catch((error) => console.error("Error fetching CSV file:", error));
    }, []);

    useEffect(() => {
        audioRefs.current.forEach((audio) => {
            if (audio) {
                audio.playbackRate = playbackRate;
            }
        });
    }, [playbackRate]);

    return (
        <div>
            <h1>{pageTitle}</h1>
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
            <List>
                {audios.map((audio, rowIndex) => (
                    <>
                    <ListItem key={rowIndex}
                              sx={{
                                  display: "flex",
                                  justifyContent: "center", // 横方向に中央寄せ
                                  alignItems: "center", // 縦方向に中央寄せ
                                  gap: "10px", // 要素間の間隔
                              }}
                    >
                            {audio.title}
                            <audio ref={(el) => (audioRefs.current[rowIndex] = el)}
                                controls>
                                <source
                                    src={audio.url}
                                    type="audio/mpeg"/>
                                お使いのブラウザは音声プレーヤーをサポートしていません。
                            </audio>
                    </ListItem>
                        <Divider/>
                    </>
                ))}
            </List>
        </div>
    );
};

export default CsvDisplay;