import { useEffect, useState } from 'react'
import { Box, Typography, TextField, Button, Stack, Alert } from '@mui/material'
import { getSetting, saveSetting } from '../db/idb'
import { getExchangeRates } from '../utils/rates'

export default function Settings() {
  const [url, setUrl] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    (async () => {
      const v = await getSetting('ratesUrl')
      if (v) setUrl(v)
    })()
  }, [])

  const handleSave = async () => {
    setErr(''); setMsg('')
    await saveSetting('ratesUrl', url.trim())
    setMsg('Saved!')
  }

  const handleTest = async () => {
    setErr(''); setMsg('')
    try {
      const rates = await getExchangeRates()
      setMsg('OK: ' + JSON.stringify(rates))
    } catch (e) {
      setErr(e.message || 'Failed to fetch rates')
    }
  }

  return (
    <Box sx={{ p:2, maxWidth: 700 }}>
      <Typography variant="h5" gutterBottom>Settings</Typography>
      <Stack spacing={2}>
        {msg && <Alert severity="success">{msg}</Alert>}
        {err && <Alert severity="error">{err}</Alert>}

        <TextField
          label="Exchange Rates URL"
          placeholder='e.g. https://example.com/rates.json'
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          fullWidth
        />
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleSave}>Save</Button>
          <Button variant="outlined" onClick={handleTest}>Test Fetch</Button>
        </Stack>
        <Typography variant="body2">
          Expected JSON shape: {"{USD:1, GBP:1.8, EURO:0.7, ILS:3.4}"}
        </Typography>
      </Stack>
    </Box>
  )
}
