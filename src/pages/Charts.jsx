import { useMemo, useState } from 'react'
import {
  Box, Container, Typography, Paper, Tabs, Tab, Grid, Stack,
  TextField, MenuItem, Button, Divider
} from '@mui/material'
import {
  ResponsiveContainer, PieChart, Pie, Tooltip, Legend, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import DonutLargeIcon from '@mui/icons-material/DonutLarge'
import AssessmentIcon from '@mui/icons-material/Assessment'
import { SUPPORTED_CURRENCIES } from '../utils/constants'
import { getReport } from '../db/idb'
import QuickNav from '../components/QuickNav'

// Options for filters
const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i)
const MONTHS = [
  { value: 1, label: 'January' },  { value: 2, label: 'February' },
  { value: 3, label: 'March' },    { value: 4, label: 'April' },
  { value: 5, label: 'May' },      { value: 6, label: 'June' },
  { value: 7, label: 'July' },     { value: 8, label: 'August' },
  { value: 9, label: 'September' },{ value: 10, label: 'October' },
  { value: 11, label: 'November' },{ value: 12, label: 'December' }
]

const COLORS = [
  '#1106ed', '#82ca9d', '#ffc658', '#ff7f50', '#8dd1e1',
  '#a4de6c', '#d0ed57', '#a28df0', '#f6a5c0', '#ffd1a1'
]

export default function Charts() {
  const now = useMemo(() => new Date(), [])
  const [tab, setTab] = useState(0) // 0 = Pie, 1 = Bar

  // Pie controls
  const [pieYear, setPieYear] = useState(now.getFullYear())
  const [pieMonth, setPieMonth] = useState(now.getMonth() + 1)
  const [pieCurrency, setPieCurrency] = useState('USD')

  // Bar controls
  const [barYear, setBarYear] = useState(now.getFullYear())
  const [barCurrency, setBarCurrency] = useState('USD')

  // Data
  const [pieData, setPieData] = useState([]) // [{name, value}]
  const [barData, setBarData] = useState([]) // [{month, total}]

  // Display currencies used for the *last generated* charts
  const [pieReportCurrency, setPieReportCurrency] = useState('USD')
  const [barReportCurrency, setBarReportCurrency] = useState('USD')

  // UX
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Build pie data by categories for selected month/year
  async function handleGeneratePie() {
    try {
      setError(''); setLoading(true)
      const rep = await getReport(pieYear, pieMonth, pieCurrency)
      const map = new Map()
      for (const c of rep.costs) {
        const key = c.category || 'Other'
        map.set(key, (map.get(key) || 0) + Number(c.sum || 0))
      }
      const arr = Array.from(map.entries()).map(([name, value]) => ({
        name, value: Number(value.toFixed(2))
      }))
      setPieData(arr)
      setPieReportCurrency(pieCurrency) // lock label to generated currency
    } catch (e) {
      setError(e?.message || 'Failed to generate pie chart')
      setPieData([])
    } finally {
      setLoading(false)
    }
  }

  // Build yearly totals (12 months)
  async function handleGenerateBar() {
    try {
      setError(''); setLoading(true)
      const results = []
      for (let m = 1; m <= 12; m++) {
        const rep = await getReport(barYear, m, barCurrency)
        results.push({
          month: MONTHS[m - 1].label.slice(0, 3),
          total: Number((rep.total?.total || 0).toFixed(2))
        })
      }
      setBarData(results)
      setBarReportCurrency(barCurrency) // lock label to generated currency
    } catch (e) {
      setError(e?.message || 'Failed to generate bar chart')
      setBarData([])
    } finally {
      setLoading(false)
    }
  }

  const hasPieData = pieData.length > 0
  const hasBarData = barData.some(d => Number(d.total) > 0)

  // Dark theme TextField overrides for readability
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
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 } }}>
          {/* Quick navigation */}
          <QuickNav />

          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, textAlign: 'center' }}>
            Charts
          </Typography>

          {/* Tabs header (white text + white indicator) */}
          <Paper
              sx={{
                mb: 2,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                border: '1px solid rgba(255,255,255,0.12)', color: 'white'
              }}
          >
            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="fullWidth"
                textColor="inherit"
                TabIndicatorProps={{ style: { backgroundColor: 'white' } }}
            >
              <Tab
                  icon={<DonutLargeIcon />}
                  iconPosition="start"
                  label="Pie (by Category)"
                  sx={{ color: 'white' }}
              />
              <Tab
                  icon={<AssessmentIcon />}
                  iconPosition="start"
                  label="Bar (Yearly)"
                  sx={{ color: 'white' }}
              />
            </Tabs>
          </Paper>

          {/* PIE TAB */}
          {tab === 0 && (
              <Paper sx={{
                p: 2, mb: 3,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                border: '1px solid rgba(255,255,255,0.12)', color: 'white'
              }}>
                {/* Controls: 4 columns (25% each) */}
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <TextField fullWidth size="small" select label="Year" value={pieYear}
                               onChange={(e) => setPieYear(Number(e.target.value))} sx={tfSx}>
                      {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField fullWidth size="small" select label="Month" value={pieMonth}
                               onChange={(e) => setPieMonth(Number(e.target.value))} sx={tfSx}>
                      {MONTHS.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField fullWidth size="small" select label="Currency" value={pieCurrency}
                               onChange={(e) => setPieCurrency(e.target.value)} sx={tfSx}>
                      {SUPPORTED_CURRENCIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                        onClick={handleGeneratePie} disabled={loading}
                        fullWidth variant="contained" size="large"
                        startIcon={<DonutLargeIcon />} sx={{ borderRadius: '999px', py: { xs: 1.2, md: 1.4 } }}
                    >
                      {loading ? 'Loading…' : 'Generate'}
                    </Button>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.12)' }} />

                {!loading && !hasPieData ? (
                    <Typography sx={{ py: 8, textAlign: 'center', color: 'rgba(255,255,255,0.85)' }}>
                      No data for the selected month and year.
                    </Typography>
                ) : (
                    <Box sx={{ height: 380, opacity: loading ? 0.6 : 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                              data={pieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="45%"
                              outerRadius={120}
                              label
                          >
                            {pieData.map((entry, idx) => (
                                <Cell key={`slice-${idx}`} fill={COLORS[idx % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                )}
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                  Values in {pieReportCurrency}
                </Typography>
              </Paper>
          )}

          {/* BAR TAB */}
          {tab === 1 && (
              <Paper sx={{
                p: 2, mb: 3,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                border: '1px solid rgba(255,255,255,0.12)', color: 'white'
              }}>
                {/* Controls: 3 columns + button (25% each) */}
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <TextField fullWidth size="small" select label="Year" value={barYear}
                               onChange={(e) => setBarYear(Number(e.target.value))} sx={tfSx}>
                      {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField fullWidth size="small" select label="Currency" value={barCurrency}
                               onChange={(e) => setBarCurrency(e.target.value)} sx={tfSx}>
                      {SUPPORTED_CURRENCIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Button
                        onClick={handleGenerateBar} disabled={loading}
                        fullWidth variant="contained" size="large"
                        startIcon={<AssessmentIcon />} sx={{ borderRadius: '999px', py: { xs: 1.2, md: 1.4 } }}
                    >
                      {loading ? 'Loading…' : 'Generate'}
                    </Button>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.12)' }} />

                {!loading && !hasBarData ? (
                    <Typography sx={{ py: 8, textAlign: 'center', color: 'rgba(255,255,255,0.85)' }}>
                      No data for the selected year.
                    </Typography>
                ) : (
                    <Box sx={{ height: 380, opacity: loading ? 0.6 : 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="total" name={`Total (${barReportCurrency})`} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                )}
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                  Values in {barReportCurrency}
                </Typography>
              </Paper>
          )}

          {error && <Typography color="error">{error}</Typography>}
        </Container>
      </Box>
  )
}
