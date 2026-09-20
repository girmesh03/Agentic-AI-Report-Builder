/**
 * @module pages/Register
 * @description Register page placeholder for Phase 1 (full implementation in Phase 2).
 */
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useNavigate } from 'react-router';
import MuiButton from '../components/reusable/MuiButton.jsx';

/**
 * Sign Up page view placeholder for Phase 1.
 * Will host new user registration, validation, and session generation in Phase 2.
 *
 * @function Register
 * @returns {JSX.Element} The rendered registration placeholder card view.
 */
export const Register = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Sign Up
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            User registration and profile creation will be fully activated in Phase 2.
          </Typography>
          <MuiButton variant="outlined" size="small" onClick={() => navigate('/')}>
            Back to Home
          </MuiButton>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;
