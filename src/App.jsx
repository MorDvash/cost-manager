import { Box } from '@mui/material';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import AddCost from './pages/AddCost';
import Reports from './pages/Reports';
import Charts from './pages/Charts';
import Settings from './pages/Settings';
import { setRatesProvider } from './db/idb';
import { getExchangeRates } from './utils/rates';

setRatesProvider(() => getExchangeRates());

export default function App() {
    return (
        <Box sx={{ m: 0, p: 0 }}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/add" element={<AddCost />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/charts" element={<Charts />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </Box>
    );
}
