import { Stack, Button } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'

/** Reusable quick navigation bar shown at top of each page */
export default function QuickNav() {
    const { pathname } = useLocation()

    // check which tab is active now
    const is = (p) => pathname === p

    const common = { sx: { color: 'white' } }
    const outlined = { variant: 'outlined', sx: { color: 'white', borderColor: 'rgba(255,255,255,0.4)' } }

    return (
        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mb: 1 }}>
            <Button component={RouterLink} to="/"        {...(is('/')         ? outlined : common)}>Home</Button>
            <Button component={RouterLink} to="/add"     {...(is('/add')      ? outlined : common)}>Add Cost</Button>
            <Button component={RouterLink} to="/reports" {...(is('/reports')  ? outlined : common)}>Reports</Button>
            <Button component={RouterLink} to="/charts"  {...(is('/charts')   ? outlined : common)}>Charts</Button>
            <Button component={RouterLink} to="/settings"{...(is('/settings') ? outlined : common)}>Settings</Button>
        </Stack>
    )
}
