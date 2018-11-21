// idea from https://github.com/angular/material2/issues/3334#issuecomment-361564266
import { Directive, AfterContentInit, Self, Input, Host } from '@angular/core';
import { NgControl, FormControl } from '@angular/forms';
import { MatAutocompleteTrigger, MatAutocomplete, MatAutocompleteSelectedEvent, MatOption } from '@angular/material';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appEnforcedInputs]'
})
export class EnforcedInputsDirective implements AfterContentInit {

  @Input() matAutocomplete: MatAutocomplete;
  @Input() formControl: FormControl;

  subscription: Subscription;

  constructor( @Host() @Self() private readonly autoCompleteTrigger: MatAutocompleteTrigger, private control: NgControl) {
  }

  private subscribeToClosingActions(): void {
    if (this.subscription && !this.subscription.closed) {
        this.subscription.unsubscribe();
    }

    this.subscription = this.autoCompleteTrigger.panelClosingActions
        .subscribe((e) => {
           if (!e || !e.source) {
                const selected = this.matAutocomplete.options
                    .map(option => option.value)
                    .find(option => option === this.formControl.value);

                if (selected == null) {
                    this.formControl.setValue(null);
                    this.matAutocomplete._emitSelectEvent(new MatOption(null, null, null, null));
                }
            }
        },
        err => this.subscribeToClosingActions(),
        () => this.subscribeToClosingActions());
}

  ngAfterContentInit() {
    if (this.formControl === undefined) {
      throw Error('inputCtrl @Input should be provided ');
    }

    if (this.matAutocomplete === undefined) {
      throw Error('valueCtrl @Input should be provided ');
    }

    setTimeout(() => {
      this.subscribeToClosingActions();
      this.handleSelection();
    }, 0);
  }

  private handleSelection() {
    this.matAutocomplete.optionSelected.subscribe((e: MatAutocompleteSelectedEvent) => {
      this.formControl.setValue(e.option.value);
    });
  }

}
