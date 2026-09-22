/**
 * @module components/reports/ReportForm
 * @description In-Canvas Streamlined Report Form (Option A).
 * Focuses strictly on shift metadata and audio ingestion clips.
 * Activities, issues, and comments are extracted from audio via STT and AI synthesis.
 * Features:
 * - AI Extraction Preset Selector with built-in default (Google Gemini, Amharic, Reasoning: Max)
 * - On-the-fly Preset Creation Modal (PresetDialog)
 * - Reusable MuiDatePicker (Ethiopian Calendar, DD-MM-YY, zero Amharic text)
 * - Reusable MuiTimePicker (24h format, analog clock face popover)
 * - 100% responsive on extra small (xs) screens (no clipping, 0px horizontal overflow)
 */
import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import AddOutlined from '@mui/icons-material/AddOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import EditOutlined from '@mui/icons-material/EditOutlined';
import MicOutlined from '@mui/icons-material/MicOutlined';
import FolderOpenOutlined from '@mui/icons-material/FolderOpenOutlined';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import PlayArrowOutlined from '@mui/icons-material/PlayArrowOutlined';
import GraphicEqOutlined from '@mui/icons-material/GraphicEqOutlined';
import TuneOutlined from '@mui/icons-material/TuneOutlined';
import MuiButton from '../reusable/MuiButton.jsx';
import MuiDatePicker from '../reusable/MuiDatePicker.jsx';
import MuiTimePicker from '../reusable/MuiTimePicker.jsx';
import MuiRecorder from '../reusable/MuiRecorder.jsx';
import MuiAudioPlayer from '../reusable/MuiAudioPlayer.jsx';
import MuiConfirmDialog from '../reusable/MuiConfirmDialog.jsx';
import VisitDialog from './VisitDialog.jsx';
import PresetDialog from './PresetDialog.jsx';
import {
  setDraftField,
  setShiftPreset,
  addVisit,
  updateVisit,
  removeVisit,
  resetDraft,
  addAudioFile,
  removeAudioFile,
  clearAudioFiles,
} from '../../redux/features/reports/reportSlice.js';
import { useGetBranchesQuery } from '../../redux/features/branches/branchApi.js';
import { gregorianToEthiopian, parseEthiopianDateString } from '../../utils/ethiopianDate.js';

const SYSTEM_PRESETS = [
  {
    _id: 'default-standard-inspection',
    name: 'Standard Operational Inspection (መደበኛ የቁጥጥር መመሪያ)',
    provider: 'google',
    model: 'gemini-2.5-flash',
    language: 'am',
    reasoning: 'max',
    tag: 'Default',
  },
  {
    _id: 'closing-cash-audit',
    name: 'Closing & Cash Reconciliation (የመዝጊያ እና የሂሳብ ፍተሻ)',
    provider: 'google',
    model: 'gemini-2.5-flash',
    language: 'am',
    reasoning: 'max',
    tag: 'Financial',
  },
  {
    _id: 'quality-sanitation',
    name: 'Food Safety & Hygiene Audit (የንፅህና እና ጥራት ቁጥጥር)',
    provider: 'google',
    model: 'gemini-2.5-flash',
    language: 'am',
    reasoning: 'max',
    tag: 'Hygiene SOP',
  },
];

/**
 * Option A Streamlined Report Form Editor Component.
 *
 * @component ReportForm
 * @param {object} props - Component properties.
 * @param {Function} props.onCancel - Cancel handler (triggers confirmation if dirty).
 * @param {Function} props.onSubmit - Submit handler.
 * @param {boolean} [props.isLoading=false] - Submission loading state.
 * @returns {JSX.Element} Rendered form.
 */
export const ReportForm = ({ onCancel, onSubmit, isLoading = false }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const draft = useSelector((state) => state.reports.draft);

  const { data: branchResponse } = useGetBranchesQuery({ limit: 100, isArchived: false });
  const branches = branchResponse?.data?.docs || [];

  // Local state for modals & inputs
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [editingVisitIndex, setEditingVisitIndex] = useState(null);
  const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false);
  const [customPresets, setCustomPresets] = useState([]);

  const allPresets = [...SYSTEM_PRESETS, ...customPresets];
  const activePresetId = draft.preset || SYSTEM_PRESETS[0]._id;

  const parsedEth = draft.date ? parseEthiopianDateString(draft.date) : null;
  const ethDate = draft.date ? gregorianToEthiopian(draft.date) : null;
  const primaryBranch = branches.find((b) => b._id === draft.branch) || null;

  const handlePrimaryBranchChange = (_e, val) => {
    dispatch(setDraftField({ field: 'branch', value: val?._id || null }));
    dispatch(setDraftField({ field: 'branchName', value: val?.name || '' }));
  };

  const handlePresetChange = (e) => {
    const pId = e.target.value;
    const selectedPreset = allPresets.find((p) => p._id === pId);
    dispatch(setDraftField({ field: 'preset', value: pId }));
    if (selectedPreset) {
      dispatch(setDraftField({ field: 'presetName', value: selectedPreset.name }));
    }
  };

  const handleSaveCustomPreset = (newPreset) => {
    setCustomPresets((prev) => [newPreset, ...prev]);
    dispatch(setDraftField({ field: 'preset', value: newPreset._id }));
    dispatch(setDraftField({ field: 'presetName', value: newPreset.name }));
  };

  const handleOpenAddVisit = () => {
    setEditingVisitIndex(null);
    setIsVisitDialogOpen(true);
  };

  const handleOpenEditVisit = (index) => {
    setEditingVisitIndex(index);
    setIsVisitDialogOpen(true);
  };

  const handleSaveVisit = (visitData) => {
    if (editingVisitIndex !== null) {
      dispatch(updateVisit({ index: editingVisitIndex, visit: visitData }));
    } else {
      dispatch(addVisit(visitData));
    }
  };

  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecordingOpen, setIsRecordingOpen] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [clipToDeleteIndex, setClipToDeleteIndex] = useState(null);
  const [clearAllConfirmOpen, setClearAllConfirmOpen] = useState(false);

  // Prevent default browser file navigation when dropping files anywhere on window
  useEffect(() => {
    const preventDefault = (e) => {
      e.preventDefault();
    };
    window.addEventListener('dragover', preventDefault);
    window.addEventListener('drop', preventDefault);
    return () => {
      window.removeEventListener('dragover', preventDefault);
      window.removeEventListener('drop', preventDefault);
    };
  }, []);

  const MAX_AUDIO_FILES = 10;
  const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25MB

  const stageAudioFiles = (files) => {
    const supportedExtensions = /\.(webm|wav|mp3|m4a|ogg|aac)$/i;
    const currentList = draft.audioFiles || [];

    if (currentList.length >= MAX_AUDIO_FILES) {
      setAudioError('ከ 10 ፋይሎች በላይ ማያያዝ አይቻልም (Maximum 10 audio files allowed).');
      return;
    }

    let currentTotalSize = currentList.reduce((acc, f) => acc + (f.size || 0), 0);
    let addedCount = 0;
    let skippedUnsupported = false;
    let skippedExceededSize = false;

    for (const file of files) {
      if (!supportedExtensions.test(file.name) && !file.type.startsWith('audio/')) {
        skippedUnsupported = true;
        continue;
      }

      if (currentList.length + addedCount >= MAX_AUDIO_FILES) {
        break;
      }

      if (currentTotalSize + file.size > MAX_TOTAL_SIZE) {
        skippedExceededSize = true;
        break;
      }

      const objectUrl = URL.createObjectURL(file);
      dispatch(
        addAudioFile({
          id: `audio-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          url: objectUrl,
          name: file.name,
          size: file.size,
          duration: 0,
        })
      );
      currentTotalSize += file.size;
      addedCount += 1;
    }

    if (skippedUnsupported) {
      setAudioError('አንዳንድ ፋይሎች ተቀባይነት የሌላቸው ቅርጸቶች በመሆናቸው አልተጨመሩም (Unsupported file format. Please upload .webm, .wav, .mp3, .m4a, .ogg, or .aac).');
    } else if (skippedExceededSize) {
      setAudioError('የፋይሎች ድምር መጠን ከ 25MB መብለጥ የለበትም (Total audio size exceeds 25MB limit).');
    } else if (files.length > addedCount && currentList.length + addedCount >= MAX_AUDIO_FILES) {
      setAudioError('ከ 10 ፋይሎች በላይ ማያያዝ አይቻልም (Maximum 10 audio files limit reached).');
    }
  };

  const handleRecordingComplete = (file, blob, durationSec) => {
    const currentList = draft.audioFiles || [];
    if (currentList.length >= MAX_AUDIO_FILES) {
      setAudioError('ከ 10 ፋይሎች በላይ ማያያዝ አይቻልም (Maximum 10 audio files limit reached).');
      setIsRecordingOpen(false);
      return;
    }
    const currentTotalSize = currentList.reduce((acc, f) => acc + (f.size || 0), 0);
    if (currentTotalSize + file.size > MAX_TOTAL_SIZE) {
      setAudioError('የፋይሎች ድምር መጠን ከ 25MB መብለጥ የለበትም (Total audio size exceeds 25MB limit).');
      setIsRecordingOpen(false);
      return;
    }

    const objectUrl = URL.createObjectURL(blob);
    dispatch(
      addAudioFile({
        id: `rec-${Date.now()}`,
        file,
        url: objectUrl,
        name: file.name,
        size: file.size,
        duration: durationSec,
      })
    );
    setIsRecordingOpen(false);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      stageAudioFiles(selectedFiles);
    }
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      stageAudioFiles(droppedFiles);
    }
  };

  const handleConfirmDeleteClip = () => {
    if (clipToDeleteIndex !== null && draft.audioFiles?.[clipToDeleteIndex]) {
      const clip = draft.audioFiles[clipToDeleteIndex];
      if (clip.url && clip.url.startsWith('blob:')) {
        URL.revokeObjectURL(clip.url);
      }
      dispatch(removeAudioFile(clipToDeleteIndex));
      setClipToDeleteIndex(null);
    }
  };

  const handleConfirmClearAll = () => {
    (draft.audioFiles || []).forEach((clip) => {
      if (clip.url && clip.url.startsWith('blob:')) {
        URL.revokeObjectURL(clip.url);
      }
    });
    dispatch(clearAudioFiles());
    setClearAllConfirmOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2.25 }, width: '100%' }}>
      {/* ========================================================================= */}
      {/* ROW 0: AI EXTRACTION PRESET (የሪፖርት አወጣጥ መመሪያ)                           */}
      {/* ========================================================================= */}
      <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <TuneOutlined color="primary" fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              AI EXTRACTION PRESET (የሪፖርት አወጣጥ መመሪያ)
            </Typography>
          </Stack>
          <MuiButton
            size="small"
            variant="text"
            startIcon={<AddOutlined />}
            onClick={() => setIsPresetDialogOpen(true)}
            sx={{ height: 24, fontSize: '0.75rem' }}
          >
            Create Preset
          </MuiButton>
        </Stack>

        <Select
          size="small"
          fullWidth
          value={activePresetId}
          onChange={handlePresetChange}
          renderValue={(selectedId) => {
            const preset = allPresets.find((p) => p._id === selectedId);
            return (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {preset ? preset.name : selectedId}
              </Typography>
            );
          }}
          sx={{ fontSize: '0.85rem' }}
        >
          {allPresets.map((p) => (
            <MenuItem key={p._id} value={p._id} sx={{ py: 0.75 }}>
              <Box sx={{ width: '100%' }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {p.name}
                  </Typography>
                  {p.tag && (
                    <Chip
                      label={p.tag}
                      size="small"
                      color={p.tag === 'Default' ? 'primary' : 'default'}
                      variant="outlined"
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                  Engine: {p.provider?.toUpperCase() || 'GOOGLE'} • Model: {p.model || 'gemini-2.5-flash'} • Lang: {p.language?.toUpperCase() || 'AM'} • Reasoning: Max
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </Paper>

      {/* ========================================================================= */}
      {/* ROW 1: Ethiopian Date Picker                                             */}
      {/* ========================================================================= */}
      <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block', mb: 1 }}>
          ROW 1: ETHIOPIAN DATE (ቀን)
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <Box sx={{ width: { xs: '100%', sm: 220 } }}>
            <MuiDatePicker
              value={draft.date}
              onChange={(newDate) => dispatch(setDraftField({ field: 'date', value: newDate }))}
              fullWidth
            />
          </Box>
          <Box
            sx={{
              p: 1,
              px: 1.5,
              borderRadius: 1.5,
              bgcolor: (t) =>
                t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flex: 1,
              flexWrap: 'wrap',
              gap: 0.5,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              📅 {draft.date || 'Select date'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {parsedEth ? `Year ${parsedEth.year}` : ethDate?.formattedFullDate || ''}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* ========================================================================= */}
      {/* ROW 2: Shift Selector & Working Hours                                    */}
      {/* ========================================================================= */}
      <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block', mb: 1 }}>
          ROW 2: SHIFT SELECTOR & WORKING HOURS (የስራ ሰዓት)
        </Typography>
        <RadioGroup
          row
          value={draft.shiftPreset}
          onChange={(e) => dispatch(setShiftPreset(e.target.value))}
          sx={{ mb: 1.5, gap: { xs: 0.5, sm: 1 }, flexWrap: 'wrap' }}
        >
          <FormControlLabel
            value="morning"
            control={<Radio size="small" />}
            label={<Typography variant="body2">Morning (08:30–17:00)</Typography>}
          />
          <FormControlLabel
            value="afternoon"
            control={<Radio size="small" />}
            label={<Typography variant="body2">Afternoon (13:00–21:00)</Typography>}
          />
          <FormControlLabel
            value="night"
            control={<Radio size="small" />}
            label={<Typography variant="body2">Night (20:00–04:00)</Typography>}
          />
          <FormControlLabel
            value="custom"
            control={<Radio size="small" />}
            label={<Typography variant="body2">Custom Hours</Typography>}
          />
        </RadioGroup>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
          <Box sx={{ flex: 1, width: '100%' }}>
            <MuiTimePicker
              label="Clock-In (ስራ የገባሁበት ሰዓት)"
              value={draft.clockIn}
              onChange={(val) => dispatch(setDraftField({ field: 'clockIn', value: val }))}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: 1, width: '100%' }}>
            <MuiTimePicker
              label="Clock-Out (ከስራ የወጣሁበት ሰዓት)"
              value={draft.clockOut}
              onChange={(val) => dispatch(setDraftField({ field: 'clockOut', value: val }))}
              fullWidth
            />
          </Box>
        </Stack>
      </Paper>

      {/* ========================================================================= */}
      {/* ROW 3: Primary Subject Branch Autocomplete                               */}
      {/* ========================================================================= */}
      <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block', mb: 1 }}>
          ROW 3: PRIMARY SUBJECT BRANCH (ዋና ብራንች)
        </Typography>
        <Autocomplete
          size="small"
          options={branches}
          getOptionLabel={(opt) => opt.name || ''}
          value={primaryBranch}
          onChange={handlePrimaryBranchChange}
          isOptionEqualToValue={(option, val) => option._id === val?._id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select or Search Primary Branch"
              placeholder="e.g. Bole Branch"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
          sx={{ mb: 1.5 }}
        />

        {/* Quick select chips */}
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" sx={{ gap: 0.75 }}>
          <Typography variant="caption" color="text.secondary">
            Quick Select:
          </Typography>
          {branches.slice(0, 5).map((b) => (
            <Chip
              key={b._id}
              label={b.name}
              size="small"
              clickable
              color={draft.branch === b._id ? 'primary' : 'default'}
              variant={draft.branch === b._id ? 'filled' : 'outlined'}
              onClick={() => {
                dispatch(setDraftField({ field: 'branch', value: b._id }));
                dispatch(setDraftField({ field: 'branchName', value: b.name }));
              }}
              sx={{ height: 24, fontSize: '0.75rem' }}
            />
          ))}
        </Stack>
      </Paper>

      {/* ========================================================================= */}
      {/* ROW 4: Multi-Branch Visits Table (Chronological Itinerary)               */}
      {/* ========================================================================= */}
      <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ mb: 1.5 }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            ROW 4: MULTI-BRANCH VISITS ITINERARY (የጉብኝት መርሃ ግብር)
          </Typography>
          <MuiButton
            size="small"
            variant="outlined"
            startIcon={<AddOutlined />}
            onClick={handleOpenAddVisit}
            sx={{ height: 28, fontSize: '0.75rem' }}
          >
            Add Branch Visit
          </MuiButton>
        </Stack>

        {draft.visits.length > 0 ? (
          isMobile ? (
            /* Mobile card list for 100% responsiveness on xs */
            <Stack spacing={1.25} sx={{ mb: 1 }}>
              {draft.visits.map((v, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 1.25,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ minWidth: 0, flex: 1, mr: 1 }}>
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.25 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {idx + 1}. {v.branchName}
                      </Typography>
                      {v.branch === draft.branch && (
                        <Chip label="Primary" size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />
                      )}
                    </Stack>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                      {v.clockIn} – {v.clockOut}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" color="primary" onClick={() => handleOpenEditVisit(idx)} aria-label="Edit visit">
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => dispatch(removeVisit(idx))} aria-label="Delete visit">
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            /* Desktop / Tablet table view */
            <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, mb: 1 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, py: 0.75, width: 40 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 0.75 }}>Branch Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 0.75 }}>Clock-In</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 0.75 }}>Clock-Out</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, py: 0.75 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {draft.visits.map((v, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ py: 0.75 }}>{idx + 1}</TableCell>
                      <TableCell sx={{ py: 0.75, fontWeight: 500 }}>
                        {v.branchName}
                        {v.branch === draft.branch && (
                          <Chip label="Primary" size="small" color="primary" sx={{ ml: 1, height: 18, fontSize: '0.65rem' }} />
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 0.75, fontFamily: 'monospace' }}>{v.clockIn}</TableCell>
                      <TableCell sx={{ py: 0.75, fontFamily: 'monospace' }}>{v.clockOut}</TableCell>
                      <TableCell align="right" sx={{ py: 0.75 }}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditVisit(idx)} aria-label="Edit visit">
                          <EditOutlined fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => dispatch(removeVisit(idx))} aria-label="Delete visit">
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1, fontStyle: 'italic', fontSize: '0.85rem' }}>
            Single branch shift. Add visits above if you inspected multiple branch locations today.
          </Typography>
        )}
      </Paper>

      {/* ========================================================================= */}
      {/* ROW 5: Tri-Modal Audio Ingestion & Extraction Source Deck                 */}
      {/* ========================================================================= */}
      <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".webm,.wav,.mp3,.m4a,.ogg,.aac,audio/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <GraphicEqOutlined color="primary" fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              ROW 5: AUDIO INGESTION (የድምፅ ቀረጻ ምንጭ)
            </Typography>
          </Stack>
          <Chip
            label={
              draft.audioFiles?.length > 0
                ? `${draft.audioFiles.length} file(s) ready`
                : 'AI Extraction Source'
            }
            size="small"
            color={draft.audioFiles?.length > 0 ? 'success' : 'primary'}
            variant="outlined"
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, lineHeight: 1.4 }}>
          Activities, issues, and comments are extracted directly from your recorded voice notes via Speech-to-Text and AI synthesis.
        </Typography>

        {/* Ingestion Modes Selector Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1.5, mb: 1.5 }}>
          {/* Card 1: Live Audio Recording (Orb Mode) */}
          <Box
            onClick={() => setIsRecordingOpen((prev) => !prev)}
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: isRecordingOpen ? 'primary.main' : 'divider',
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isRecordingOpen ? 'primary.lighter' : 'background.paper',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-1px)' },
            }}
          >
            <MicOutlined color="primary" sx={{ fontSize: 24, mb: 0.5 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {isRecordingOpen ? 'Hide Recorder' : 'Audio Orb'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Record live Amharic
            </Typography>
          </Box>

          {/* Card 2: Browse Files */}
          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: 'background.paper',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-1px)' },
            }}
          >
            <FolderOpenOutlined color="primary" sx={{ fontSize: 24, mb: 0.5 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Browse Files
            </Typography>
            <Typography variant="caption" color="text.secondary">
              .m4a, .mp3, .wav, .webm
            </Typography>
          </Box>

          {/* Card 3: Drag & Drop Zone */}
          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: '1px dashed',
              borderColor: isDragging ? 'primary.main' : 'divider',
              bgcolor: isDragging ? 'action.hover' : 'background.paper',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'primary.main' },
            }}
          >
            <CloudUploadOutlined color={isDragging ? 'primary' : 'action'} sx={{ fontSize: 24, mb: 0.5 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {isDragging ? 'Drop files here!' : 'Drag & Drop'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Max 25MB per file
            </Typography>
          </Box>
        </Box>

        {/* Live Audio Recorder Panel (Toggled by Card 1) */}
        {isRecordingOpen && (
          <Box sx={{ mb: 2 }}>
            <MuiRecorder onRecordingComplete={handleRecordingComplete} />
          </Box>
        )}

        {/* Staged Audio Queue Player Deck */}
        {draft.audioFiles && draft.audioFiles.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Staged Narrations ({draft.audioFiles.length} of 10 max)
              </Typography>
              <MuiButton
                size="small"
                variant="text"
                color="error"
                onClick={() => setClearAllConfirmOpen(true)}
                sx={{ fontSize: '0.7rem', height: 22 }}
              >
                Clear All
              </MuiButton>
            </Stack>

            <Box
              sx={{
                maxHeight: 280,
                overflowY: 'auto',
                pr: 0.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: 'divider',
                  borderRadius: 3,
                },
              }}
            >
              {draft.audioFiles.map((item, idx) => (
                <MuiAudioPlayer
                  key={item.id || idx}
                  src={item.url}
                  duration={item.duration}
                  onDelete={() => setClipToDeleteIndex(idx)}
                />
              ))}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: '1px dashed',
              borderColor: 'divider',
              textAlign: 'center',
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              ምንም የድምፅ ፋይል አልተያያዘም (No voice narrations attached yet. Record live audio or upload files above.)
            </Typography>
          </Box>
        )}
      </Paper>

      {/* ========================================================================= */}
      {/* ROW 6: Action Footer (Zero Horizontal Overflow on xs)                     */}
      {/* ========================================================================= */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          width: '100%',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <MuiButton
            variant="outlined"
            size="small"
            color="inherit"
            onClick={() => dispatch(resetDraft())}
            fullWidth={isMobile}
            sx={{ flex: 1 }}
          >
            Reset Form
          </MuiButton>
          <MuiButton
            variant="outlined"
            size="small"
            color="error"
            onClick={onCancel}
            fullWidth={isMobile}
            sx={{ flex: 1 }}
          >
            Cancel
          </MuiButton>
        </Stack>

        <MuiButton
          variant="contained"
          size="small"
          loading={isLoading}
          disabled={!draft.branch}
          onClick={onSubmit}
          fullWidth={isMobile}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            minWidth: { xs: '100%', sm: 220 },
            fontWeight: 700,
          }}
        >
          {isMobile ? '🚀 Compile & Open Chat' : '🚀 Compile & Open in Report Chat'}
        </MuiButton>
      </Paper>

      {/* Visited Branch Dialog */}
      <VisitDialog
        open={isVisitDialogOpen}
        onClose={() => setIsVisitDialogOpen(false)}
        onSave={handleSaveVisit}
        initialData={editingVisitIndex !== null ? draft.visits[editingVisitIndex] : null}
      />

      {/* Custom Preset Creation Dialog */}
      <PresetDialog
        open={isPresetDialogOpen}
        onClose={() => setIsPresetDialogOpen(false)}
        onSave={handleSaveCustomPreset}
      />

      {/* Audio Error / Limit Snackbar */}
      <Snackbar
        open={Boolean(audioError)}
        autoHideDuration={6000}
        onClose={() => setAudioError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setAudioError(null)}>
          {audioError}
        </Alert>
      </Snackbar>

      {/* Confirm Single Audio Clip Deletion */}
      <MuiConfirmDialog
        open={clipToDeleteIndex !== null}
        title="ድምፅ ይሰረዝ? (Delete Audio Clip?)"
        message="ይህ የተቀረፀ ወይም የተያያዘ የድምፅ ፋይል ከዝርዝሩ ውስጥ ይሰረዛል። (Are you sure you want to remove this audio file?)"
        confirmText="ሰርዝ (Delete)"
        cancelText="ይቅር (Cancel)"
        confirmColor="error"
        onConfirm={handleConfirmDeleteClip}
        onClose={() => setClipToDeleteIndex(null)}
      />

      {/* Confirm Clear All Audio Clips */}
      <MuiConfirmDialog
        open={clearAllConfirmOpen}
        title="ሁሉንም የድምፅ ፋይሎች ማጽዳት (Clear All Audio)?"
        message="ሁሉም የተያያዙ የድምፅ ፋይሎች ከቅጹ ይወገዳሉ። እርግጠኛ ነዎት? (All attached audio clips will be removed. Are you sure?)"
        confirmText="ሁሉንም አጽዳ (Clear All)"
        cancelText="ይቅር (Cancel)"
        confirmColor="error"
        onConfirm={handleConfirmClearAll}
        onClose={() => setClearAllConfirmOpen(false)}
      />
    </Box>
  );
};

export default ReportForm;
