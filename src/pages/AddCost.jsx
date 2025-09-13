import { Typography, Box, Paper } from '@mui/material'
import AddCostForm from '../components/AddCostForm'

export default function AddCost() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Add Cost</Typography>

      <Paper sx={{ p: 3, maxWidth: 520 }}>
        <AddCostForm />
      </Paper>
    </Box>
  )
}
