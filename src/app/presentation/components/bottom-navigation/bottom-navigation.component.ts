import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, homeOutline, search, searchOutline, heart, heartOutline, bag, bagOutline, person, personOutline } from 'ionicons/icons';
import { signal } from '@angular/core';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-bottom-navigation',
  templateUrl: './bottom-navigation.component.html',
  styleUrls: ['./bottom-navigation.component.scss'],
  standalone: true,
  imports: [CommonModule, IonTabBar, IonTabButton, IonIcon, IonLabel]
})
export class BottomNavigationComponent {
  private router = inject(Router);

  activeTab = signal('home');

  tabs = [
    {
      key: 'home',
      label: 'Home',
      icon: 'home-outline',
      activeIcon: 'home',
      route: '/home'
    },
    {
      key: 'search',
      label: 'Search',
      icon: 'search-outline',
      activeIcon: 'search',
      route: '/products'
    },
    {
      key: 'saved',
      label: 'Saved',
      icon: 'heart-outline',
      activeIcon: 'heart',
      route: '/favorites'
    },
    {
      key: 'cart',
      label: 'Cart',
      icon: 'bag-outline',
      activeIcon: 'bag',
      route: '/cart'
    },
    {
      key: 'account',
      label: 'Account',
      icon: 'person-outline',
      activeIcon: 'person',
      route: '/login'
    }
  ];

  constructor() {
    addIcons({
      home, homeOutline,
      search, searchOutline,
      heart, heartOutline,
      bag, bagOutline,
      person, personOutline
    });

    // Listen to route changes to update active tab
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateActiveTab(event.url);
      });

    // Set initial active tab
    this.updateActiveTab(this.router.url);
  }

  private updateActiveTab(url: string) {
    const tab = this.tabs.find(t => url.startsWith(t.route));
    if (tab) {
      this.activeTab.set(tab.key);
    }
  }

  onTabClick(tab: any) {
    this.activeTab.set(tab.key);
    this.router.navigate([tab.route]);
  }

  isActive(tabKey: string): boolean {
    return this.activeTab() === tabKey;
  }
}
