import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function NavBar() {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Cost Manager
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button color="inherit" component={RouterLink} to="/">Home</Button>
                    <Button color="inherit" component={RouterLink} to="/add">Add Cost</Button>
                    <Button color="inherit" component={RouterLink} to="/reports">Reports</Button>
                    <Button color="inherit" component={RouterLink} to="/charts">Charts</Button>
                    <Button color="inherit" component={RouterLink} to="/settings">Settings</Button>
                </Box>
            </Toolbar>
        </AppBar>
    )
}
