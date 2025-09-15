import { useMemo, useState, useEffect } from 'react'
import {
  Box, Container, Typography, TextField, MenuItem, Button,
  Paper, Divider, Chip, Table, TableHead, TableRow, TableCell, TableBody,
  Grid, Stack
} from '@mui/material'
import AssessmentIcon from '@mui/icons-material/Assessment'
import { SUPPORTED_CURRENCIES } from '../utils/constants'
import { getReport } from '../db/idb'
import QuickNav from '../components/QuickNav'

const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i)
const MONTHS = [
  { value: 1, label: 'January' },  { value: 2, label: 'February' },
  { value: 3, label: 'March' },    { value: 4, label: 'April' },
  { value: 5, label: 'May' },      { value: 6, label: 'June' },
  { value: 7, label: 'July' },     { value: 8, label: 'August' },
  { value: 9, label: 'September' },{ value: 10, label: 'October' },
  { value: 11, label: 'November' },{ value: 12, label: 'December' }
]

export default function Reports() {
  const now = useMemo(() => new Date(), [])

  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [currency, setCurrency] = useState('USD')

  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [reportCurrency, setReportCurrency] = useState('USD')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fmt = (v) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(v || 0))

  async function handleGenerate() {
    if (!Number.isFinite(year) || !Number.isFinite(month)) {
      setError('Please choose Year and Month from the lists.')
      return
    }
    try {
      setError(''); setLoading(true)
      const rep = await getReport(year, month, currency)
      setRows(rep.costs || [])
      setTotal(rep.total?.total || 0)
      setReportCurrency(currency)
    } catch (e) {
      setError(e?.message || 'Failed to create report')
      setRows([]); setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const hasData = rows && rows.length > 0

  useEffect(() => {
    if (hasData && currency !== reportCurrency) {
      handleGenerate()
    }
  }, [currency])

  const tfSx = {
    '& .MuiInputBase-input': { color: 'white' },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.25)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.45)' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
    '& .MuiSvgIcon-root': { color: 'white' },
  }

  return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0b1020 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 } }}>
          {/* Quick navigation bar */}
          <QuickNav />

          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, textAlign: 'center' }}>
            Reports
          </Typography>

          {/* Controls: 4 equal columns (25% each) on desktop, stacked on mobile */}
          <Paper sx={{
            p: 2, mb: 3,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.12)', color: 'white'
          }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                    fullWidth size="small" select label="Year" value={year}
                    onChange={(e) => setYear(Number(e.target.value))} sx={tfSx}
                >
                  {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </TextField>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                    fullWidth size="small" select label="Month" value={month}
                    onChange={(e) => setMonth(Number(e.target.value))} sx={tfSx}
                >
                  {MONTHS.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                </TextField>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                    fullWidth size="small" select label="Currency" value={currency}
                    onChange={(e) => setCurrency(e.target.value)} sx={tfSx}
                >
                  {SUPPORTED_CURRENCIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
              </Grid>

              <Grid item xs={12} md={3}>
                <Button
                    onClick={handleGenerate} disabled={loading}
                    fullWidth variant="contained" size="large" startIcon={<AssessmentIcon />}
                    sx={{ borderRadius: '999px', py: { xs: 1.2, md: 1.4 } }}
                >
                  {loading ? 'Loading…' : 'Generate'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Results */}
          <Paper sx={{
            p: 2,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            border: '1px solid rgba(255,255,255,0.12)', color: 'white'
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Monthly details</Typography>
              <Chip
                  label={`${MONTHS[month-1].label} ${year} · ${reportCurrency}`}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }}
              />
            </Stack>
            <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.12)' }} />

            {error && <Typography sx={{ color: '#ffb4b4', mb: 2 }}>{error}</Typography>}

            {!loading && !hasData ? (
                <Typography sx={{ py: 8, textAlign: 'center', color: 'rgba(255,255,255,0.85)' }}>
                  No data for the selected month and year.
                </Typography>
            ) : (
                <>
                  <Table size="small" sx={{ '& th, & td': { borderColor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Day</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Sum ({reportCurrency})</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((r, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{r?.Date?.day ?? '-'}</TableCell>
                            <TableCell>{r.category || '-'}</TableCell>
                            <TableCell>{r.description || '-'}</TableCell>
                            <TableCell align="right">{fmt(r.sum)}</TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.12)' }} />
                  <Stack direction="row" justifyContent="flex-end">
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Total: {fmt(total)} {reportCurrency}
                    </Typography>
                  </Stack>
                </>
            )}
          </Paper>
        </Container>
      </Box>
  )
}
