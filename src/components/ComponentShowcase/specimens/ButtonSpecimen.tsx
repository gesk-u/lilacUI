import { Button } from '../../Button/Button';
import { Keys, Specimen, SpecimenState, SpecimenStates } from '../../Specimen/Specimen';

export function ButtonSpecimen() {
  return (
    <Specimen
      title="Button"
      description="Four states, left to right. Hover and focus are shown forced so you can read them side by side."
      spec={[
        { term: 'Element', detail: '<button>' },
        { term: 'Keys', detail: <Keys keys={['Enter', 'Space']} /> },
        { term: 'Focus ring', detail: '3px, offset 3' },
        { term: 'Contrast', detail: '10.2:1' },
      ]}
    >
      <SpecimenStates>
        <SpecimenState caption="default"><Button>Save changes</Button></SpecimenState>
        <SpecimenState caption="hover"><Button data-state="hover">Save changes</Button></SpecimenState>
        <SpecimenState caption="focus"><Button data-state="focus">Save changes</Button></SpecimenState>
        <SpecimenState caption="disabled"><Button disabled>Save changes</Button></SpecimenState>
        <SpecimenState caption="secondary"><Button variant="secondary">Discard</Button></SpecimenState>
      </SpecimenStates>
    </Specimen>
  );
}
