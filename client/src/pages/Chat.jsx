/**
 * @module pages/Chat
 * @description Conversational AI agent and In-Canvas Report Form orchestrator.
 * Conforms to Invariant 9 (< 35 lines).
 */
import ChatContainer from '../components/chat/ChatContainer.jsx';

/**
 * Conversational agent orchestrator page.
 *
 * @function Chat
 * @returns {JSX.Element} Rendered chat view or active report form.
 */
export const Chat = () => {
  return <ChatContainer />;
};

export default Chat;
