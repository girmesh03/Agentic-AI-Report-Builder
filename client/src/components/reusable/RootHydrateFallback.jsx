/**
 * @module components/reusable/RootHydrateFallback
 * @description Fullscreen loading spinner used during initial client router hydration.
 */
import LoadingSpinner from './LoadingSpinner.jsx';

/**
 * Root hydration fallback component rendered during initial route module resolution.
 * Prevents React Router v7 "No HydrateFallback element provided" warning.
 *
 * @component RootHydrateFallback
 * @returns {JSX.Element} Full viewport LoadingSpinner.
 */
export const RootHydrateFallback = () => (
  <LoadingSpinner message="Loading application..." height="90vh" />
);

export default RootHydrateFallback;
