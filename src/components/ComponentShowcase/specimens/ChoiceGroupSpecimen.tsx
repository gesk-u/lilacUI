import { useState } from 'react';
import { ChoiceGroup, type ChoiceOption } from '../../ChoiceGroup/ChoiceGroup';
import { Keys, Specimen, SpecimenNote } from '../../Specimen/Specimen';

const principles: ChoiceOption[] = [
  { value: 'perceivable', label: 'Perceivable' },
  { value: 'operable', label: 'Operable' },
  { value: 'understandable', label: 'Understandable' },
  { value: 'robust', label: 'Robust' },
];

export function ChoiceGroupSpecimen() {
  const [met, setMet] = useState(['perceivable', 'operable']);

  return (
    <Specimen
      title="Choice group"
      description="A fieldset so screen readers announce the question before each option. The tally is live."
      spec={[
        { term: 'Group', detail: 'fieldset + legend' },
        { term: 'Keys', detail: <Keys keys={['Tab', 'Space']} /> },
        { term: 'Tally', detail: 'role=status' },
        { term: 'Target', detail: '44px row' },
      ]}
    >
      <ChoiceGroup
        legend="Which principles does this component meet?"
        name="principles"
        options={principles}
        value={met}
        onChange={setMet}
      >
        <SpecimenNote>{met.length} of {principles.length} met</SpecimenNote>
      </ChoiceGroup>
    </Specimen>
  );
}
