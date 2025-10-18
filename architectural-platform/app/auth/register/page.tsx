import RegisterForm from '@/components/AuthForm/RegisterForm';
import { Container, Typography, Box } from '@mui/material';

export default function RegisterPage() {
  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <RegisterForm />
      </Box>
    </Container>
  );
}