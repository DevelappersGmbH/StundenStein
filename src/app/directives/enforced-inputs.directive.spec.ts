import { EnforcedInputsDirective } from './enforced-inputs.directive';


describe('EnforcedInputsDirective', () => {
  it('should create an instance', () => {
    // DANGER DANGER
    const directive = new EnforcedInputsDirective(null, null);
    expect(directive).toBeTruthy();
  });
});
