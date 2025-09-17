import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Stack,
    Chip,
    Divider,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import SettingsIcon from '@mui/icons-material/Settings';
import { getExchangeRates } from '../utils/rates';

const CURRENCIES = ['USD','GBP','EURO','ILS'];

export default function Home() {
    const [rates, setRates] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const now = useMemo(() => new Date(), []);

    useEffect(() => {
        let mounted = true; // Prevent state updates after component unmounts
        setLoading(true);
        getExchangeRates()
            .then((r) => { if (mounted) setRates(r); })
            .catch((e) => { if (mounted) setError(e?.message || 'Failed to load rates'); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, []);

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0b1020 100%)',
            color: 'white',
        }}>
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
                <Stack spacing={4}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Chip label={now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '999px' }} />
                        <Typography variant="h3" sx={{ mt: 2, fontWeight: 800, letterSpacing: 0.3 }}>Cost Manager</Typography>
                        <Typography variant="h6" sx={{ mt: 1, opacity: 0.9, fontWeight: 400 }}>
                            Track expenses, generate monthly reports, visualize trends, and manage currency rates.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 3 }}>
                            <Button component={RouterLink} to="/add" variant="contained" size="large" startIcon={<AddCircleIcon />} sx={{ borderRadius: '999px' }}>Add Cost</Button>
                            <Button component={RouterLink} to="/reports" variant="outlined" size="large" startIcon={<AssessmentIcon />} sx={{ borderRadius: '999px', color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>Reports</Button>
                            <Button component={RouterLink} to="/charts" variant="outlined" size="large" startIcon={<DonutLargeIcon />} sx={{ borderRadius: '999px', color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>Charts</Button>
                            <Button component={RouterLink} to="/settings" variant="text" size="large" startIcon={<SettingsIcon />} sx={{ borderRadius: '999px', color: 'white' }}>Settings</Button>
                        </Stack>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={7}>
                            <Card sx={{
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: 'white',
                                backdropFilter: 'blur(6px)'
                            }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>What can you do here?</Typography>
                                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.12)' }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Stack spacing={1.2}>
                                                <Typography>• Add new costs with amount, currency, category, description</Typography>
                                                <Typography>• Get detailed monthly reports in your chosen currency</Typography>
                                                <Typography>• See a pie chart by categories for a selected month</Typography>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Stack spacing={1.2}>
                                                <Typography>• See a yearly bar chart (12 months)</Typography>
                                                <Typography>• Configure exchange rates source URL</Typography>
                                                <Typography>• All data stored locally with IndexedDB</Typography>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={5}>
                            <Card sx={{
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: 'white',
                                backdropFilter: 'blur(6px)'
                            }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Exchange Rates</Typography>
                                        <Chip size="small" label={loading ? 'Loading…' : 'Live'} sx={{ bgcolor: loading ? 'rgba(255,255,255,0.2)' : 'rgba(34,197,94,0.25)', color: 'white' }} />
                                    </Stack>
                                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.12)' }} />

                                    {error ? (
                                        <Typography color="#ffb4b4">{error}</Typography>
                                    ) : (
                                        <Grid container spacing={1.5}>
                                            {CURRENCIES.map((c) => (
                                                <Grid item xs={6} key={c}>
                                                    <Stack sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        border: '1px solid rgba(255,255,255,0.12)',
                                                        bgcolor: 'rgba(255,255,255,0.04)'
                                                    }}>
                                                        <Typography sx={{ opacity: 0.85 }}>{c}</Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                            {rates ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(Number(rates[c] ?? 0)) : '—'}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ opacity: 0.7 }}>per 1 USD</Typography>
                                                    </Stack>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}

                                    <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                                        <Button component={RouterLink} to="/settings" size="small" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>Set Rates URL</Button>
                                        <Button component={RouterLink} to="/reports" size="small" variant="text" sx={{ color: 'white' }}>See Reports</Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Stack>
            </Container>
        </Box>
    );
}
