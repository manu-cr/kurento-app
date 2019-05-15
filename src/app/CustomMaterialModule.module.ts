import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule, MatIconModule, MatProgressSpinnerModule } from '@angular/material';

const MATERIAL_MODULES = [
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule
];

@NgModule({
  imports: [CommonModule],
  exports: MATERIAL_MODULES
})
export class CustomMaterialModuleModule { }
