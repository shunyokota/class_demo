import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CsvDisplay from "./CsvDisplay.tsx";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

function App() {
  return (
    <>
      <div>
        {/*<a href="https://vite.dev" target="_blank">*/}
        {/*  <img src={viteLogo} className="logo" alt="Vite logo" />*/}
        {/*</a>*/}
        {/*<a href="https://react.dev" target="_blank">*/}
        {/*  <img src={reactLogo} className="logo react" alt="React logo" />*/}
        {/*</a>*/}
      </div>
        <CsvDisplay />
    </>
  )
}

export default App
