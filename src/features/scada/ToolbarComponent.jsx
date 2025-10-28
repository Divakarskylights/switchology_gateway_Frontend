import React from 'react';
import {
  Toolbar,
  IconButton,
  Tooltip as MuiTooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

const ToolbarComponent = ({
  isEditMode,
  onToggleEditMode,
  onUndo,
  onRedo,
  onSaveDiagram,
  onDeleteDiagram,
  isDiagramDirty,
  theme
}) => {
  return (
    <Toolbar
      variant="dense"
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        flexShrink: 0,
      }}
    >
      <MuiTooltip title={isEditMode ? 'Switch to View Mode' : 'Switch to Edit Mode'} arrow>
        <IconButton onClick={onToggleEditMode} size="small">
          {isEditMode ? <VisibilityIcon /> : <EditIcon />}
        </IconButton>
      </MuiTooltip>

      {/* Show the following buttons ONLY when not in edit mode */}
      {isEditMode && (
        <>
          <MuiTooltip title="Undo" arrow>
            <IconButton
              onClick={onUndo}
              color={theme.palette.mode === 'dark' ? 'primary' : 'default'}
            >
              <UndoIcon />
            </IconButton>
          </MuiTooltip>

          <MuiTooltip title="Redo" arrow>
            <IconButton
              onClick={onRedo}
              color={theme.palette.mode === 'dark' ? 'primary' : 'default'}
            >
              <RedoIcon />
            </IconButton>
          </MuiTooltip>

          <MuiTooltip title="Save Diagram" arrow>
            <span style={{ display: 'flex' }}>
              <IconButton
                onClick={onSaveDiagram}
                disabled={!isDiagramDirty}
                color={theme.palette.mode === 'dark' ? 'primary' : 'default'}
              >
                <SaveIcon />
              </IconButton>
            </span>
          </MuiTooltip>

          <MuiTooltip title="Delete Diagram" arrow>
            <span style={{ display: 'flex' }}>
              <IconButton
                onClick={onDeleteDiagram}
                color={theme.palette.mode === 'dark' ? 'primary' : 'default'}
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </MuiTooltip>
        </>
      )}
    </Toolbar>
  );
};

export default ToolbarComponent;
