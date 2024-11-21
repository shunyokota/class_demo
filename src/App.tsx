import React, {useEffect, useState} from 'react'
import './App.css'
import CsvDisplay from "./CsvDisplay.tsx";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Papa from "papaparse";
import CsvRow from "./entities/CsvRow.ts";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";

function App() {
    const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
    useEffect(() => {
        // CSVファイルをフェッチ
        fetch("/audio.csv")
            .then((response) => response.text())
            .then((csvData) => {
                // papaparseを使ってCSVを解析
                const parsedData = Papa.parse<CsvRow>(csvData, { header: true });
                setCsvRows(parsedData.data);
            })
            .catch((error) => console.error("Error fetching CSV file:", error));
    }, []);
  return (
    <>
        <div>
            {/*<FormControl sx={{ minWidth: "100px;"}}>*/}
            {/*    <InputLabel id="demo-simple-select-label">再生速度</InputLabel>*/}
            {/*    <Select*/}
            {/*        labelId="demo-simple-select-label"*/}
            {/*        value={playbackRate}*/}
            {/*        label="再生速度"*/}
            {/*        onChange={(e) => setPlaybackRate(parseFloat(e.target.value as string))}*/}
            {/*    >*/}
            {/*        {*/}
            {/*            [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5].map((speed, rowIndex) => (*/}
            {/*                <MenuItem value={speed} key={rowIndex}>{speed}倍</MenuItem>*/}
            {/*            ))*/}
            {/*        }*/}
            {/*    </Select>*/}
            {/*</FormControl>*/}
        </div>
        <Router>
            <Routes>
                <Route path="/audio/:week/:page" element={<CsvDisplay csvRows={csvRows} />} />
                <Route path="*" element={<Navigate to="/audio/1/1" replace />} />
            </Routes>
        </Router>
        {/*<CsvDisplay csvRows={csvRows} />*/}
    </>
  )
}

export default App
