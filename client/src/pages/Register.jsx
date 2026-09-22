/**
 * @module pages/Register
 * @description Lean orchestrator page rendering the RegisterForm domain component.
 */
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import RegisterForm from '../components/auth/RegisterForm.jsx';

/**
 * Registration page orchestrator hosting the decomposed RegisterForm.
 * Remains a lean page shell (< 35 lines) per Invariant 9.
 *
 * @function Register
 * @returns {JSX.Element} The rendered registration page view.
 */
export const Register = () => {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 8 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <RegisterForm />
      </Box>
    </Container>
  );
};

export default Register;
