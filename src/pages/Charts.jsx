import { useMemo, useState } from 'react'
import {
  Box, Typography, Stack, TextField, MenuItem, Button, Paper, Tabs, Tab, Divider
} from '@mui/material'
import { SUPPORTED_CURRENCIES } from '../utils/constants'
import { getReport } from '../db/idb'

import {
  ResponsiveContainer, PieChart, Pie, Tooltip, Legend, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i)
const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' },   { value: 4, label: 'April' },
  { value: 5, label: 'May' },     { value: 6, label: 'June' },
  { value: 7, label: 'July' },    { value: 8, label: 'August' },
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

  const [pieYear, setPieYear] = useState(now.getFullYear())
  const [pieMonth, setPieMonth] = useState(now.getMonth() + 1)
  const [pieCurrency, setPieCurrency] = useState('USD')

  const [barYear, setBarYear] = useState(now.getFullYear())
  const [barCurrency, setBarCurrency] = useState('USD')

  const [pieData, setPieData] = useState([]) // [{name: 'Food', value: 123}]
  const [barData, setBarData] = useState([]) // [{month: 'Jan', total: 100},...]

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGeneratePie = async () => {
    try {
      setError(''); setLoading(true)
      const rep = await getReport(pieYear, pieMonth, pieCurrency)
      const map = new Map()
      for (const c of rep.costs) {
        const key = c.category || 'Other'
        map.set(key, (map.get(key) || 0) + Number(c.sum || 0))
      }
      const arr = Array.from(map.entries()).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
      setPieData(arr)
    } catch (e) {
      setError(e.message || 'Failed to generate pie chart')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateBar = async () => {
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
    } catch (e) {
      setError(e.message || 'Failed to generate bar chart')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Charts</Typography>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
          <Tab label="Pie (by Category)" />
          <Tab label="Bar (Yearly)" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField select label="Year" value={pieYear} onChange={(e) => setPieYear(Number(e.target.value))}>
              {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </TextField>

            <TextField select label="Month" value={pieMonth} onChange={(e) => setPieMonth(Number(e.target.value))}>
              {MONTHS.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
            </TextField>

            <TextField select label="Currency" value={pieCurrency} onChange={(e) => setPieCurrency(e.target.value)}>
              {SUPPORTED_CURRENCIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>

            <Button variant="contained" onClick={handleGeneratePie} disabled={loading}>
              {loading ? 'Loading…' : 'Generate'}
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ height: 380 }}>
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
        </Paper>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField select label="Year" value={barYear} onChange={(e) => setBarYear(Number(e.target.value))}>
              {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </TextField>

            <TextField select label="Currency" value={barCurrency} onChange={(e) => setBarCurrency(e.target.value)}>
              {SUPPORTED_CURRENCIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>

            <Button variant="contained" onClick={handleGenerateBar} disabled={loading}>
              {loading ? 'Loading…' : 'Generate'}
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name={`Total (${barCurrency})`} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}

      {error && <Typography color="error">{error}</Typography>}
    </Box>
  )
}
