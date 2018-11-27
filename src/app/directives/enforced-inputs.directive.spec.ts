import { EnforcedInputsDirective } from './enforced-inputs.directive';


describe('EnforcedInputsDirective', () => {
  it('should create an instance', () => {
    // DANGER DANGER
    const directive = new EnforcedInputsDirective(undefined, undefined);
    expect(directive).toBeTruthy();
  });
});
