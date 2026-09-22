/**
 * @module components/reports/PresetDialog
 * @description Modal dialog for creating a custom report AI extraction preset on-the-fly.
 * Captures Preset Name, Persona, Guidelines, and AI Engine.
 */
import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import MuiDialog from '../reusable/MuiDialog.jsx';
import MuiButton from '../reusable/MuiButton.jsx';

/**
 * Inner Preset form content.
 */
const PresetFormContent = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [persona, setPersona] = useState(
    'You are an experienced, detail-oriented F&B Area Supervisor enforcing strict food safety, sanitation, and cash reconciliation standards.'
  );
  const [system, setSystem] = useState(
    'Verify store sanitation, inspect POS register closing discrepancy, expand shorthand into SOP documentation, and ensure all issues detail problem, financial impact, and resolution.'
  );
  const [provider, setProvider] = useState('google');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Preset name is required';
    if (!persona.trim()) errs.persona = 'Persona definition is required';
    if (!system.trim()) errs.system = 'Operational guidelines are required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      _id: `custom-preset-${Date.now()}`,
      name: name.trim(),
      persona: persona.trim(),
      system: system.trim(),
      provider,
      model: provider === 'google' ? 'gemini-2.5-flash' : provider === 'addis' ? 'Addis-፩-አሌፍ' : 'meta/llama-3.1-70b',
      language: 'am',
      reasoning: 'max',
    });
    onClose();
  };

  return (
    <>
      <Box component="form" sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          size="small"
          label="Preset Name (የመመሪያው ስም)"
          placeholder="e.g. Late Night Closing Audit"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={Boolean(errors.name)}
          helperText={errors.name}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />

        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
            AI Engine / Provider (የአይ ሞዴል)
          </Typography>
          <Select
            size="small"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            fullWidth
            sx={{ fontSize: '0.85rem' }}
          >
            <MenuItem value="google">Google Gemini (gemini-2.5-flash) • Default</MenuItem>
            <MenuItem value="addis">Addis AI (Addis-፩-አሌፍ) • Native Amharic</MenuItem>
            <MenuItem value="nvidia">Nvidia (Llama 3.1 70B)</MenuItem>
          </Select>
        </Box>

        <TextField
          size="small"
          label="Supervisor Persona (የሱፐርቫይዘሩ ባህሪ እና ሚና)"
          multiline
          rows={2}
          value={persona}
          onChange={(e) => setPersona(e.target.value)}
          error={Boolean(errors.persona)}
          helperText={errors.persona}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />

        <TextField
          size="small"
          label="Operational Guidelines (የአሰራር ደንቦች እና ትኩረት የሚሹ ነጥቦች)"
          multiline
          rows={3}
          value={system}
          onChange={(e) => setSystem(e.target.value)}
          error={Boolean(errors.system)}
          helperText={errors.system}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />

        <Typography variant="caption" color="text.secondary">
          This preset defines how activities, issues, and comments are extracted from your audio notes.
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2.5 }}>
        <MuiButton variant="outlined" size="small" onClick={onClose}>
          Cancel
        </MuiButton>
        <MuiButton variant="contained" size="small" onClick={handleSave}>
          Save & Apply Preset
        </MuiButton>
      </Stack>
    </>
  );
};

/**
 * Preset creation dialog.
 *
 * @component PresetDialog
 * @param {object} props - Component properties.
 * @param {boolean} props.open - Whether dialog is open.
 * @param {Function} props.onClose - Close callback.
 * @param {Function} props.onSave - Save callback receiving the new preset object.
 * @returns {JSX.Element} Rendered dialog.
 */
export const PresetDialog = ({ open, onClose, onSave }) => {
  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      title="Create Custom Extraction Preset"
      maxWidth="sm"
      actions={null}
    >
      {open && <PresetFormContent onSave={onSave} onClose={onClose} />}
    </MuiDialog>
  );
};

export default PresetDialog;
