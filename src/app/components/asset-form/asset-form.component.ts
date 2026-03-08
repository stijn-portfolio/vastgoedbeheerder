// src/app/components/asset-form/asset-form.component.ts (bijwerken)

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { AssetService } from '../../services/asset.service';
import { MarketDataService, SearchResult } from '../../services/market-data.service';
import { Asset } from '../../models/asset';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NavBarComponent],
  templateUrl: './asset-form.component.html',
  styleUrls: ['./asset-form.component.css']
})
export class AssetFormComponent implements OnInit {
  assetForm: FormGroup;
  isEditMode = false;
  loading = false;
  submitted = false;
  error = '';
  assetId?: number;
  
  // Nieuwe eigenschappen voor zoekfunctie
  searchResults: SearchResult[] = [];
  searching = false;
  selectedResult?: SearchResult;
  
  constructor(
    private formBuilder: FormBuilder,
    private assetService: AssetService,
    private marketDataService: MarketDataService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.assetForm = this.formBuilder.group({
      symbol: ['', [Validators.required, Validators.maxLength(20)]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      assetType: ['stock', Validators.required],
      searchQuery: [''] // Nieuw veld voor zoekfunctie
    });
    
    // Luister naar veranderingen in het zoekveld
    this.assetForm.get('searchQuery')?.valueChanges.pipe(
      debounceTime(500), // Wacht 500ms na het typen
      distinctUntilChanged(), // Alleen als de waarde echt verandert
      tap(() => {
        this.searching = true;
        this.searchResults = [];
      }),
      switchMap(query => {
        if (!query || query.length < 2) {
          this.searching = false;
          return of([]);
        }
        return this.marketDataService.searchSecurities(query);
      })
    ).subscribe(results => {
      this.searchResults = results;
      this.searching = false;
    });
  }
  
  ngOnInit(): void {
    // Bestaande code behouden
    this.assetId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (this.assetId) {
      this.isEditMode = true;
      this.loading = true;
      
      this.assetService.getAssetById(this.assetId).subscribe({
        next: (asset) => {
          this.assetForm.patchValue({
            symbol: asset.symbol,
            name: asset.name,
            assetType: asset.assetType
          });
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Aandeel niet gevonden';
          this.loading = false;
        }
      });
    }
  }
  
  // Nieuwe methode om zoekresultaat te selecteren


selectResult(result: SearchResult): void {
  this.selectedResult = result;
  
  // Bepaal het assetType op basis van het type uit het zoekresultaat
  this.assetForm.patchValue({
    symbol: result.symbol,
    name: result.description, // Finnhub gebruikt 'description' in plaats van 'name'
    assetType: result.type,
    searchQuery: ''
  });
  
  this.searchResults = [];
}
  
  get f() { return this.assetForm.controls; }
  
  onSubmit(): void {
    this.submitted = true;
    
    if (this.assetForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    const asset: Asset = {
      id: this.assetId || 0,
      symbol: this.f['symbol'].value,
      name: this.f['name'].value,
      assetType: this.f['assetType'].value
    };
    
    if (this.isEditMode) {
      this.assetService.updateAsset(this.assetId!, asset).subscribe({
        next: () => {
          this.router.navigate(['/assets']);
        },
        error: (err) => {
          this.error = 'Er is een fout opgetreden bij het bijwerken van het aandeel';
          this.loading = false;
        }
      });
    } else {
      this.assetService.addAsset(asset).subscribe({
        next: () => {
          this.router.navigate(['/assets']);
        },
        error: (err) => {
          this.error = 'Er is een fout opgetreden bij het toevoegen van het aandeel';
          this.loading = false;
        }
      });
    }
  }
}