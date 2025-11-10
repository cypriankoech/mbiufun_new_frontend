import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface EditTextDialogData {
  title: string;
  label: string;
  value: string;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
}

@Component({
  selector: 'app-edit-text-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded px-4 pt-3 pb-4">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">{{ data.title }}</h2>

      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2">
          {{ data.label }}
        </label>
        <input 
          *ngIf="!data.multiline"
          [(ngModel)]="editValue"
          [placeholder]="data.placeholder || ''"
          [maxlength]="data.maxLength || 150"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70aeb9] focus:border-transparent">
        
        <textarea
          *ngIf="data.multiline"
          [(ngModel)]="editValue"
          [placeholder]="data.placeholder || ''"
          [maxlength]="data.maxLength || 500"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70aeb9] focus:border-transparent resize-none"></textarea>
        
        <div *ngIf="data.maxLength" class="text-xs text-gray-500 mt-1 text-right">
          {{ editValue.length }} / {{ data.maxLength }}
        </div>
      </div>

      <div class="flex items-center justify-between">
        <button 
          type="button"
          (click)="onCancel()"
          class="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-gray-400 transition-colors">
          Cancel
        </button>
        <button 
          type="button"
          (click)="onSave()"
          class="bg-[#70aeb9] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-[#5d96a1] transition-colors">
          Save
        </button>
      </div>
    </div>
  `
})
export class EditTextDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<EditTextDialogComponent>);
  public data = inject<EditTextDialogData>(MAT_DIALOG_DATA);

  editValue: string = '';

  ngOnInit(): void {
    this.editValue = this.data.value || '';
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSave(): void {
    this.dialogRef.close(this.editValue);
  }
}


















