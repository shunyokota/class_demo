import React, {useEffect, useState} from "react";
import Track from "./entities/Track.ts";
import {Box, FormControl, MenuItem, Select} from "@mui/material";
import CsvRow from "./entities/CsvRow.ts";
import {useParams, useNavigate} from "react-router-dom";
import headphoneImage  from "./assets/headphone.png";
import Example from "./Example.tsx";

interface Props {
    csvRows: CsvRow[];
}
const AudioPlayer: React.FC<Props> = ({ csvRows }) => {
    const [pages, setPages] = useState<{num: number, label: string}[]>([]);
    const [audios, setAudios] = useState<Track[]>([]);
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


    const navigate = useNavigate();
    const handlePageChange = (newPage: string) => {
        navigate(`/audio/${week}/${newPage}`);
    };

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
        </div>
    );
};

export default AudioPlayer;