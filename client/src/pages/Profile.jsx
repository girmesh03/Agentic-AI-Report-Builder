/**
 * @module pages/Profile
 * @description Lean orchestrator page rendering the ProfileContainer.
 */
import Container from '@mui/material/Container';
import ProfileContainer from '../components/profile/ProfileContainer.jsx';

/**
 * Consolidated Profile page orchestrator.
 * Remains a lean page shell (< 35 lines) per Invariant 9.
 *
 * @function Profile
 * @returns {JSX.Element} The rendered profile page view.
 */
export const Profile = () => {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3 } }}>
      <ProfileContainer />
    </Container>
  );
};

export default Profile;
