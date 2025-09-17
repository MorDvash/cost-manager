import { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Paper, TextField, Button, Stack,
  Divider, Chip, Grid
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SaveIcon from '@mui/icons-material/Save';
import QuickNav from '../components/QuickNav';

import * as idb from '../db/idb';

// Fallback chain for loading rates URL from different storage methods
async function loadRatesUrl() {
  if (typeof idb.getRatesUrl === 'function') return idb.getRatesUrl();
  if (typeof idb.getSetting === 'function')   return idb.getSetting('ratesUrl');
  return localStorage.getItem('ratesUrl') || '';
}
// Fallback chain for saving rates URL to different storage methods
async function saveRatesUrl(url) {
  if (typeof idb.setRatesUrl === 'function') return idb.setRatesUrl(url);
  if (typeof idb.setSetting === 'function')   return idb.setSetting('ratesUrl', url);
  localStorage.setItem('ratesUrl', url);
}

const fmt = (v) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(Number(v || 0));

export default function Settings() {
  const [url, setUrl] = useState('');
  const [rates, setRates] = useState(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const existing = await loadRatesUrl();
        if (mounted && existing) setUrl(String(existing));
      } catch { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, []);

  async function handleTest() {
    setError(''); setOkMsg(''); setRates(null); setTesting(true);
    try {
      if (!url || !/^https?:\/\//i.test(url)) {
        throw new Error('Please enter a valid URL (http/https).');
      }

      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      let raw = null;
      let baseCode = 'USD';

      // Handle nested format: { base: "USD", rates: { ... } }
      if (data && typeof data === 'object' && data.rates && typeof data.rates === 'object') {
        raw = data.rates;
        baseCode = data.base_code || data.base || baseCode;
      } else {
        // Handle flat format: { USD: 1, GBP: 0.8, ... }
        raw = data;
      }

      let USDv = Number(raw.USD);
      let GBPv = Number(raw.GBP);
      let EURv = Number(raw.EUR ?? raw.EURO);
      let ILSv = Number(raw.ILS);

      // Convert to USD base if needed
      if (String(baseCode).toUpperCase() !== 'USD') {
        if (!Number.isFinite(USDv) || USDv === 0) {
          throw new Error('Source JSON missing valid USD rate for normalization.');
        }
        GBPv = GBPv / USDv;
        EURv = EURv / USDv;
        ILSv = ILSv / USDv;
        USDv = 1;
      }

      const allOk = [USDv, GBPv, EURv, ILSv].every(n => Number.isFinite(n));
      if (!allOk) throw new Error('JSON must include USD, GBP, EUR(EURO), ILS as numeric values.');

      setRates({ USD: USDv, GBP: GBPv, EURO: EURv, ILS: ILSv });
      setOkMsg('Test fetch succeeded.');
    } catch (e) {
      setError(e?.message || 'Failed to fetch rates.');
    } finally {
      setTesting(false);
    }
  }

  async function handleSave() {
    setError(''); setOkMsg(''); setSaving(true);
    try {
      if (!url || !/^https?:\/\//i.test(url)) {
        throw new Error('Please enter a valid URL (http/https).');
      }
      await saveRatesUrl(url);
      setOkMsg('URL saved successfully.');
    } catch (e) {
      setError(e?.message || 'Failed to save URL.');
    } finally {
      setSaving(false);
    }
  }

  const tfSx = {
    '& .MuiInputBase-input': { color: 'white' },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.25)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.45)' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
  }

  return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0b1020 100%)',
        color: 'white',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 } }}>
          {/* Quick navigation */}
          <QuickNav />

          <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 2 }}>
            Settings
          </Typography>

          {/* Rates URL card */}
          <Paper sx={{
            p: 2, mb: 3,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.12)', color: 'white'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Exchange Rates Source
            </Typography>
            <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.12)' }} />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
              <TextField
                  fullWidth
                  label="Rates JSON URL (CORS-enabled)"
                  placeholder="https://your-domain.com/rates.json"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  sx={tfSx}
              />
              <Button
                  onClick={handleTest}
                  disabled={testing}
                  variant="contained"
                  startIcon={<CloudDownloadIcon />}
                  sx={{ borderRadius: '999px', px: { xs: 2, md: 3 }, py: 1.2 }}
              >
                {testing ? 'Testing…' : 'Test Fetch'}
              </Button>
              <Button
                  onClick={handleSave}
                  disabled={saving || !url}
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  sx={{ borderRadius: '999px', color: 'white', borderColor: 'rgba(255,255,255,0.4)', px: { xs: 2, md: 3 }, py: 1.2 }}
              >
                {saving ? 'Saving…' : 'Save URL'}
              </Button>
            </Stack>

            {(error || okMsg) && (
                <Typography sx={{ mt: 2, color: error ? '#ffb4b4' : '#b2f5bf' }}>
                  {error || okMsg}
                </Typography>
            )}

            {rates && (
                <>
                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.12)' }} />

                  <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                    {['USD', 'GBP', 'EURO', 'ILS'].map((c) => (
                        <Grid item xs={6} sm={3} key={c}>
                          <Paper sx={{
                            p: 1.5,
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 100%)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: 'white',
                          }}>
                            <Typography sx={{ opacity: 0.85 }}>{c}</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              {fmt(rates[c])}
                            </Typography>
                          </Paper>
                        </Grid>
                    ))}
                  </Grid>
                </>
            )}
          </Paper>

          {/* Help card */}
          <Paper sx={{
            p: 2,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            border: '1px solid rgba(255,255,255,0.12)', color: 'white'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              How it works
            </Typography>
            <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.12)' }} />
            <Typography sx={{ opacity: 0.9 }}>
              Paste a URL that returns a JSON object like:
            </Typography>
            <Paper component="pre" sx={{
              mt: 1, p: 1.5, whiteSpace: 'pre-wrap', overflowX: 'auto',
              background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.12)', color: 'white'
            }}>
              {`{
  "USD": 1,
  "GBP": 1.8,
  "EURO": 0.7,
  "ILS": 3.4
}`}
            </Paper>
            <Typography sx={{ mt: 1.5, opacity: 0.9 }}>
              Click <b>Test Fetch</b> to verify the response, then <b>Save URL</b>.
              Your app will use this source when generating reports and charts.
               As a default URL you can use: <b> https://open.er-api.com/v6/latest/USD</b>
            </Typography>
          </Paper>
        </Container>
      </Box>
  );
}
