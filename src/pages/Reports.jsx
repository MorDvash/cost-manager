import { useMemo, useState } from 'react'
import {
  Box, Typography, Stack, TextField, MenuItem, Button, Paper, Table,
  TableBody, TableCell, TableHead, TableRow
} from '@mui/material'
import { getReport } from '../db/idb'
import { SUPPORTED_CURRENCIES } from '../utils/constants'

const YEARS = Array.from({length: 6}, (_,i) => new Date().getFullYear() - i)
const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' },   { value: 4, label: 'April' },
  { value: 5, label: 'May' },     { value: 6, label: 'June' },
  { value: 7, label: 'July' },    { value: 8, label: 'August' },
  { value: 9, label: 'September' },{ value: 10, label: 'October' },
  { value: 11, label: 'November' },{ value: 12, label: 'December' }
]

export default function Reports() {
  const now = useMemo(() => new Date(), [])
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()+1)
  const [currency, setCurrency] = useState('USD')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    try {
      setError(''); setLoading(true)
      const rep = await getReport(year, month, currency)
      setReport(rep)
    } catch (e) {
      setError(e.message || 'Failed to get report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p:2 }}>
      <Typography variant="h5" gutterBottom>Reports</Typography>

      <Paper sx={{ p:2, mb:3 }}>
        <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
          <TextField select label="Year" value={year} onChange={(e)=>setYear(Number(e.target.value))}>
            {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </TextField>

          <TextField select label="Month" value={month} onChange={(e)=>setMonth(Number(e.target.value))}>
            {MONTHS.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
          </TextField>

          <TextField select label="Currency" value={currency} onChange={(e)=>setCurrency(e.target.value)}>
            {SUPPORTED_CURRENCIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>

          <Button variant="contained" onClick={generate} disabled={loading}>
            {loading ? 'Loading…' : 'Generate'}
          </Button>
        </Stack>
      </Paper>

      {error && <Typography color="error" sx={{mb:2}}>{error}</Typography>}

      {report && (
        <Paper sx={{ p:2 }}>
          <Typography variant="h6" gutterBottom>
            Report: {report.month}/{report.year} ({report.total.currency})
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Day</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Sum ({report.total.currency})</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.costs.map((c, idx) => (
                <TableRow key={idx}>
                  <TableCell>{c.Date?.day ?? ''}</TableCell>
                  <TableCell>{c.category}</TableCell>
                  <TableCell>{c.description}</TableCell>
                  <TableCell align="right">{c.sum.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3}><b>Total</b></TableCell>
                <TableCell align="right"><b>{report.total.total.toFixed(2)}</b></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  )
}
