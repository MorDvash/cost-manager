import { useState } from 'react'
import {
  TextField,
  MenuItem,
  Button,
  Stack,
  Alert,
  Snackbar,
  InputAdornment
} from '@mui/material'
import { SUPPORTED_CURRENCIES, CURRENCY_SYMBOL, DEFAULT_CATEGORIES } from '../utils/constants'
import { addCost } from '../db/idb'

export default function AddCostForm() {
  const [sum, setSum] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [snackOpen, setSnackOpen] = useState(false)

  const resetForm = () => {
    setSum('')
    setCurrency('USD')
    setCategory(DEFAULT_CATEGORIES[0])
    setDescription('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // ולידציה בסיסית לפי הדרישות
    const value = Number(sum)
    if (!Number.isFinite(value) || value <= 0) {
      setError('Amount (sum) must be a positive number')
      return
    }
    if (!currency) {
      setError('Please select a currency')
      return
    }
    if (!category.trim()) {
      setError('Category is required')
      return
    }
    if (!description.trim()) {
      setError('Description is required')
      return
    }

    try {
      setLoading(true)
      await addCost({
        sum: value,
        currency,
        category: category.trim(),
        description: description.trim()
      })
      setSnackOpen(true)
      resetForm()
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Failed to save cost item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Amount"
            type="number"
            required
            value={sum}
            onChange={(e) => setSum(e.target.value)}
            inputProps={{ step: '0.01', min: '0' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {CURRENCY_SYMBOL[currency] ?? '$'}
                </InputAdornment>
              )
            }}
          />

          <TextField
            select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c} {CURRENCY_SYMBOL[c] ? `(${CURRENCY_SYMBOL[c]})` : ''}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {DEFAULT_CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Description"
            placeholder="e.g., Pizza, Monthly Zoom, Taxi…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Save Cost'}
          </Button>
        </Stack>
      </form>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2500}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackOpen(false)} severity="success" variant="filled">
          Cost saved successfully
        </Alert>
      </Snackbar>
    </>
  )
}
