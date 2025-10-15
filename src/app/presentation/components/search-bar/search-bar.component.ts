import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonSearchbar, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { optionsOutline, micOutline } from 'ionicons/icons';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonSearchbar, IonButton, IonIcon]
})
export class SearchBarComponent {
  searchTerm = signal('');

  // Outputs
  searchChange = output<string>();
  filterClick = output<void>();

  constructor() {
    addIcons({ optionsOutline, micOutline });
  }

  onSearchChange(event: any) {
    const value = event.target.value || '';
    this.searchTerm.set(value);
    this.searchChange.emit(value);
  }

  onFilterClick() {
    this.filterClick.emit();
  }

  onVoiceSearch() {
    // TODO: Implement voice search functionality
    console.log('Voice search clicked');
  }
}
