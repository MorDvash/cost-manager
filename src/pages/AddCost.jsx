import { useState } from 'react'
import {
    Box, Container, Typography, Paper, Grid, TextField, MenuItem,
    Button, Stack, Snackbar, Alert, Divider
} from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import QuickNav from '../components/QuickNav'
import { SUPPORTED_CURRENCIES } from '../utils/constants'
import { addCost } from '../db/idb' // React version of idb.js

// Predefined categories for the dropdown
const CATEGORIES = [
    'Food', 'Transport', 'Housing', 'Utilities',
    'Entertainment', 'Health', 'Education',
    'Shopping', 'Travel', 'Other (custom)'
]

/**
 * AddCost page — add a new cost item into IndexedDB.
 * Required: sum, currency, category, description. Date is set automatically by idb.addCost.
 */
export default function AddCost() {
    // Form state
    const [sum, setSum] = useState('')
    const [currency, setCurrency] = useState('USD')
    const [category, setCategory] = useState(CATEGORIES[0])
    const [customCategory, setCustomCategory] = useState('')
    const [description, setDescription] = useState('')

    // UX state
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const isCustom = category === 'Other (custom)'

    // Minimal client validation
    function validate() {
        if (!sum || Number(sum) <= 0 || !Number.isFinite(Number(sum))) {
            return 'Please enter a valid positive amount.'
        }
        if (!currency) return 'Please choose a currency.'
        if (isCustom && !customCategory.trim()) return 'Please enter a custom category.'
        if (!description.trim()) return 'Please enter a description.'
        return ''
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        const err = validate()
        if (err) { setError(err); return }

        try {
            setSubmitting(true)
            const finalCategory = isCustom ? customCategory.trim() : category
            await addCost({
                sum: Number(sum),
                currency,
                category: finalCategory,
                description: description.trim(),
            })
            setSuccess(true)
            // Reset form
            setSum('')
            setCurrency('USD')
            setCategory(CATEGORIES[0])
            setCustomCategory('')
            setDescription('')
        } catch (ex) {
            setError(ex?.message || 'Failed to add cost.')
        } finally {
            setSubmitting(false)
        }
    }

    function handleReset() {
        setError('')
        setSum('')
        setCurrency('USD')
        setCategory(CATEGORIES[0])
        setCustomCategory('')
        setDescription('')
    }

    // Dark TextField styling for readability
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

                <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 2 }}>
                    Add Cost
                </Typography>

                <Paper
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        p: 2,
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                        border: '1px solid rgba(255,255,255,0.12)', color: 'white'
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        New cost item
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.12)' }} />

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Amount"
                                type="number"
                                inputProps={{ min: 0, step: '0.01' }}
                                value={sum}
                                onChange={(e) => setSum(e.target.value)}
                                sx={tfSx}
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                select
                                label="Currency"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                sx={tfSx}
                            >
                                {SUPPORTED_CURRENCIES.map((c) => (
                                    <MenuItem key={c} value={c}>{c}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                select
                                label="Category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                sx={tfSx}
                            >
                                {CATEGORIES.map((c) => (
                                    <MenuItem key={c} value={c}>{c}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Shown only when "Other (custom)" is selected */}
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label={isCustom ? 'Custom category' : 'Description'}
                                placeholder={isCustom ? 'Type your category' : 'Short note'}
                                value={isCustom ? customCategory : description}
                                onChange={(e) => (isCustom ? setCustomCategory(e.target.value) : setDescription(e.target.value))}
                                sx={tfSx}
                            />
                        </Grid>

                        {/* If "Other" is selected we still need description field */}
                        {isCustom && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    placeholder="Short note"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    sx={tfSx}
                                />
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="flex-end">
                                <Button
                                    onClick={handleReset}
                                    type="button"
                                    variant="outlined"
                                    startIcon={<RestartAltIcon />}
                                    sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', borderRadius: '999px', px: 3 }}
                                >
                                    Clear
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<AddCircleIcon />}
                                    disabled={submitting}
                                    sx={{ borderRadius: '999px', px: 3 }}
                                >
                                    {submitting ? 'Saving…' : 'Add Cost'}
                                </Button>
                            </Stack>

                            {error && (
                                <Typography sx={{ mt: 2, color: '#ffb4b4' }}>{error}</Typography>
                            )}
                        </Grid>
                    </Grid>
                </Paper>

                <Snackbar
                    open={success}
                    autoHideDuration={2500}
                    onClose={() => setSuccess(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={() => setSuccess(false)} severity="success" variant="filled" sx={{ width: '100%' }}>
                        Cost item added successfully.
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    )
}
