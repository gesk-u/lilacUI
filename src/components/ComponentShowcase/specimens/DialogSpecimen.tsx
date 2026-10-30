import { useState } from 'react';
import { Button } from '../../Button/Button';
import { Dialog } from '../../Dialog/Dialog';
import { Keys, Specimen, SpecimenNote, SpecimenState, SpecimenStates } from '../../Specimen/Specimen';

export function DialogSpecimen() {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('Nothing deleted yet.');

  function handleClose(returnValue: string) {
    setOpen(false);
    setNote(returnValue === 'deleted'
      ? 'Deleted. Focus came back to the trigger.'
      : 'Kept. Focus came back to the trigger.');
  }

  return (
    <Specimen
      docsHref="/components#dialog"
      title="Dialog"
      description="Open it and try to Tab out. Focus is held inside, and Escape returns it to the button you came from."
      spec={[
        { term: 'Element', detail: '<dialog>' },
        { term: 'Keys', detail: <Keys keys={['Tab', 'Esc']} /> },
        { term: 'Focus', detail: 'trapped, restored' },
        { term: 'Backdrop', detail: 'inert' },
      ]}
    >
      <SpecimenStates>
        <SpecimenState caption="trigger">
          <Button onClick={() => setOpen(true)}>Delete this specimen</Button>
        </SpecimenState>
      </SpecimenStates>
      <SpecimenNote>{note}</SpecimenNote>

      <Dialog
        open={open}
        onClose={handleClose}
        title="Delete this specimen?"
        description="It will be removed from the plate. This cannot be undone."
        actions={
          <>
            <Button type="submit" variant="secondary" value="kept">Keep it</Button>
            <Button type="submit" value="deleted">Delete</Button>
          </>
        }
      />
    </Specimen>
  );
}
