import { useState } from 'react';
import { Button } from '../components/Button/Button';
import { Switch } from '../components/Switch/Switch';
import { ChoiceGroup } from '../components/ChoiceGroup/ChoiceGroup';
import { Dialog } from '../components/Dialog/Dialog';

/* ---------- Live examples ---------- */

export function ButtonDemo() {
  const [saved, setSaved] = useState(0);
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Button onClick={() => setSaved((n) => n + 1)}>Save changes</Button>
        <Button variant="secondary">Discard</Button>
        <Button variant="quiet">Cancel</Button>
        <Button disabled>Disabled</Button>
      </div>
      <p role="status" style={{ margin: 0, color: 'var(--secondary)', fontSize: '0.85rem' }}>
        {saved === 0 ? 'Not saved yet.' : `Saved ${saved} time${saved === 1 ? '' : 's'}.`}
      </p>
    </>
  );
}

export function SwitchDemo() {
  const [quiet, setQuiet] = useState(false);
  return (
    <>
      <Switch label="Quiet mode" checked={quiet} onCheckedChange={setQuiet} />
      <Switch label="Quiet mode" checked={false} disabled />
    </>
  );
}

const CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'Text message' },
  { value: 'push', label: 'Push notification' },
];

export function ChoiceDemo() {
  const [channels, setChannels] = useState(['email']);
  return (
    <ChoiceGroup legend="Send reminders by" name="docs-channels" options={CHANNELS} value={channels} onChange={setChannels}>
      <p role="status" style={{ margin: '0.25rem 0 0', color: 'var(--secondary)', fontSize: '0.85rem' }}>
        {channels.length} of {CHANNELS.length} selected
      </p>
    </ChoiceGroup>
  );
}

export function DialogDemo() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState('Nothing deleted yet.');
  return (
    <>
      <Button onClick={() => setOpen(true)}>Delete project</Button>
      <p role="status" style={{ margin: 0, color: 'var(--secondary)', fontSize: '0.85rem' }}>{result}</p>
      <Dialog
        open={open}
        onClose={(value) => {
          setOpen(false);
          setResult(value === 'delete' ? 'Deleted. Focus is back on the button.' : 'Kept. Focus is back on the button.');
        }}
        title="Delete this project?"
        description="It will be removed for everyone. This can’t be undone."
        actions={
          <>
            <Button type="submit" variant="secondary" value="keep">Keep it</Button>
            <Button type="submit" value="delete">Delete</Button>
          </>
        }
      />
    </>
  );
}
