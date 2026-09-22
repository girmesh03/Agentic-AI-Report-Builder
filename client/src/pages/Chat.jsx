/**
 * @module pages/Chat
 * @description Conversational AI agent orchestrator rendering MuiEmptyState placeholder for Phase 2.
 */
import Container from '@mui/material/Container';
import AddCommentOutlined from '@mui/icons-material/AddCommentOutlined';
import MuiEmptyState from '../components/reusable/MuiEmptyState.jsx';

/**
 * Conversational agent orchestrator page.
 * Remains a lean page shell (< 35 lines) per Invariant 9.
 *
 * @function Chat
 * @returns {JSX.Element} Rendered chat view with empty state.
 */
export const Chat = () => {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
      <MuiEmptyState
        icon={<AddCommentOutlined sx={{ fontSize: 36 }} />}
        title="Conversational Assistant"
        description="Interactive Amharic voice dictation and Gemini agentic reasoning will be activated in Phase 5 & 6."
      />
    </Container>
  );
};

export default Chat;
