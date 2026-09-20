/**
 * @module components/landing/FeatureHighlights
 * @description Feature highlights grid showcase for Option A Product Landing Page.
 */
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import DescriptionIcon from '@mui/icons-material/Description';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';

/**
 * Feature Highlights section showcasing the 3 core pillars of the application:
 * 1. Spoken Amharic Narration (Addis AI STT)
 * 2. Locked Corporate Report Engine (Deterministic Assembly)
 * 3. Universal Multi-Branch Oversight (Multi-Location Sync)
 *
 * @component
 * @returns {JSX.Element} The rendered feature highlights grid section.
 */
export const FeatureHighlights = () => {
  const highlightCards = [
    {
      icon: <RecordVoiceOverIcon fontSize="small" sx={{ color: 'primary.main' }} />,
      title: 'Spoken Amharic Narration',
      tag: 'Addis AI STT',
      description:
        'Real-time acoustic capture powered by Addis AI speech recognition. Spoken workplace technical terms are naturally transliterated into Ge’ez (e.g. ዲፕ ፍራየር, ፒኦኤስ ማሽን).',
    },
    {
      icon: <DescriptionIcon fontSize="small" sx={{ color: 'primary.main' }} />,
      title: 'Locked Corporate Report Engine',
      tag: 'Deterministic Assembly',
      description:
        'Immutable Ethiopian dates (DD-MM-YY), 24-hour shift times, first-person active voice, and guaranteed clean plain-text delivery with zero markdown syntax.',
    },
    {
      icon: <CorporateFareIcon fontSize="small" sx={{ color: 'primary.main' }} />,
      title: 'Universal Multi-Branch Oversight',
      tag: 'Multi-Location Sync',
      description:
        'Chronological visit itineraries, cross-branch issue matrices, and Google Docs/Sheets automated exports designed specifically for multi-unit field operations.',
    },
  ];

  return (
    <Box sx={{ py: { xs: 6, sm: 8, md: 10 }, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem' },
              fontWeight: 700,
              color: 'text.primary',
              mb: 1.5,
            }}
          >
            Engineered for Real Field Supervisors
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: 680,
              mx: 'auto',
              fontSize: { xs: '0.95rem', sm: '1.05rem' },
            }}
          >
            Built to withstand demanding field routines, variable acoustic environments, and strict corporate standards.
          </Typography>
        </Box>

        {/* Feature Cards Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {highlightCards.map((card, index) => (
            <Card
              key={index}
              sx={(theme) => ({
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px -4px rgba(37, 99, 235, 0.12)',
                  ...theme.applyStyles('dark', {
                    boxShadow: '0 12px 24px -4px rgba(0, 0, 0, 0.6)',
                  }),
                },
              })}
            >
              <CardContent sx={{ p: { xs: 3, sm: 3.5 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Box
                    sx={(theme) => ({
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: 'rgba(37, 99, 235, 0.1)',
                      display: 'inline-flex',
                      ...theme.applyStyles('dark', {
                        bgcolor: 'rgba(59, 130, 246, 0.15)',
                      }),
                    })}
                  >
                    {card.icon}
                  </Box>
                  <Chip label={card.tag} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
                  {card.title}
                </Typography>

                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.65, flexGrow: 1 }}>
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FeatureHighlights;
