import { useState } from 'react';
import { Switch } from '../../Switch/Switch';
import { Keys, Specimen, SpecimenNote, SpecimenState, SpecimenStates } from '../../Specimen/Specimen';

export function SwitchSpecimen() {
  const [first, setFirst] = useState(false);
  const [second, setSecond] = useState(true);
  const [lastChanged, setLastChanged] = useState(true);

  function handle(setter: (on: boolean) => void) {
    return (on: boolean) => {
      setter(on);
      setLastChanged(on);
    };
  }

  return (
    <Specimen
      title="Switch"
      description="Takes effect the moment it moves. No confirm step, so the label says what turning it on does."
      spec={[
        { term: 'Role', detail: 'switch' },
        { term: 'State', detail: 'aria-checked' },
        { term: 'Keys', detail: <Keys keys={['Space', 'Enter']} /> },
        { term: 'Label', detail: 'stays constant' },
      ]}
    >
      <SpecimenStates>
        <SpecimenState caption="off">
          <Switch label="Quiet mode" checked={first} onCheckedChange={handle(setFirst)} />
        </SpecimenState>
        <SpecimenState caption="on">
          <Switch label="Quiet mode" checked={second} onCheckedChange={handle(setSecond)} />
        </SpecimenState>
        <SpecimenState caption="disabled">
          <Switch label="Quiet mode" checked={false} disabled />
        </SpecimenState>
      </SpecimenStates>
      <SpecimenNote>
        {lastChanged
          ? 'Non-essential sounds stay silent while this is on.'
          : 'All sounds play normally.'}
      </SpecimenNote>
    </Specimen>
  );
}
