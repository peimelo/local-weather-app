import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { debounceTime, filter, tap } from 'rxjs';
import { WeatherService } from '../weather/weather.service';

@Component({
  selector: 'app-city-search',
  templateUrl: './city-search.component.html',
  styleUrls: ['./city-search.component.scss'],
})
export class CitySearchComponent {
  search = new FormControl('', [Validators.required, Validators.minLength(2)]);

  constructor(private weatherService: WeatherService) {
    this.search.valueChanges
      .pipe(
        debounceTime(1000),
        filter(() => !this.search.invalid),
        tap((searchValue) => this.doSearch(searchValue))
      )
      .subscribe();
  }

  getErrorMessage() {
    return this.search.hasError('minlength')
      ? 'Type more than one character to search'
      : '';
  }

  private doSearch(searchValue: string) {
    const userInput = searchValue.split(',').map((s) => s.trim());
    const searchText = userInput[0];
    const country = userInput.length > 1 ? userInput[1] : undefined;

    this.weatherService.updateCurrentWeather(searchText, country);
  }
}
