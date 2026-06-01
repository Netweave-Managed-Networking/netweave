import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export interface AuthFormValue {
  email: string;
  password: string;
}

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './auth-form.component.html',
})
export class AuthFormComponent {
  submitLabel = input.required<string>();
  errorMessage = input<string | null>(null);
  loading = input<boolean>(false);

  submitted = output<AuthFormValue>();

  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.submitted.emit(this.form.getRawValue() as AuthFormValue);
  }
}
