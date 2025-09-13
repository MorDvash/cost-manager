import { Typography, Box } from '@mui/material'

export default function Home() {
    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>Welcome to Cost Manager</Typography>
            <Typography>Use the top navigation to add costs, see reports and charts, or configure settings.</Typography>
        </Box>
    )
}
