/**
 * @module pages/Login
 * @description Lean orchestrator page rendering the LoginForm domain component.
 */
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import LoginForm from '../components/auth/LoginForm.jsx';

/**
 * Login page orchestrator hosting the decomposed LoginForm.
 * Remains a lean page shell (< 35 lines) per Invariant 9.
 *
 * @function Login
 * @returns {JSX.Element} The rendered login page view.
 */
export const Login = () => {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 8 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <LoginForm />
      </Box>
    </Container>
  );
};

export default Login;
