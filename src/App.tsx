import {useEffect, useState} from 'react'
import './App.css'
import CsvDisplay from "./CsvDisplay.tsx";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Papa from "papaparse";
import CsvRow from "./entities/CsvRow.ts";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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
