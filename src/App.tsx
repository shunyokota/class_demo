import {useEffect, useState} from 'react';
import './App.css';
import AudioPlayer from "./AudioPlayer.tsx";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Papa from "papaparse";
import CsvRow from "./entities/CsvRow.ts";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import {AppBar, Toolbar, IconButton, Drawer, List, ListItemText, ListItemButton} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import _ from 'lodash';

function App() {
    const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        // Fetch CSV file
        fetch("/audio.csv")
            .then((response) => response.text())
            .then((csvData) => {
                // Parse CSV using PapaParse
                const parsedData = Papa.parse<CsvRow>(csvData, { header: true });
                setCsvRows(parsedData.data);
            })
            .catch((error) => console.error("Error fetching CSV file:", error));
    }, []);

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    const handleLinkClick = () => {
        setDrawerOpen(false);
    };

    return (
        <>
            <Router>
                <AppBar position="static"  sx={{ backgroundColor: 'lightgray' }}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
                            <MenuIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}
                        sx={{ '& .MuiDrawer-paper': { width: '180px' } }}
                >
                    <List>
                        {
                            _.chain(csvRows).map((row: CsvRow)=> row.week).uniq().map((week: string) => (
                                <ListItemButton key={week} component={Link} to={`/audio/${week}/1`} onClick={handleLinkClick}>
                                    <ListItemText primary={`基礎 - week${week}`} />
                                </ListItemButton>
                            )).value()
                        }
                    </List>
                </Drawer>
                <Routes>
                    <Route path="/audio/:week/:page" element={<AudioPlayer csvRows={csvRows} />} />
                    <Route path="*" element={<Navigate to="/audio/1/1" replace />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
