import LoginForm from '@/components/AuthForm/LoginForm';
import { Container, Typography, Box } from '@mui/material';

export default function LoginPage() {
  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <LoginForm />
      </Box>
    </Container>
  );
}