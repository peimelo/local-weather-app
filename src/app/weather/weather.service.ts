import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ICurrentWeather } from '../interfaces';
import { PostalCodeService } from '../postal-code/postal-code.service';

interface ICurrentWeatherData {
  weather: [
    {
      description: string;
      icon: string;
    }
  ];
  main: {
    temp: number;
  };
  sys: {
    country: string;
  };
  dt: number;
  name: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface IWeatherService {
  getCurrentWeather(
    searchText: string,
    country: string
  ): Observable<ICurrentWeather>;
  getCurrentWeatherByCoords(coords: Coordinates): Observable<ICurrentWeather>;
  updateCurrentWeather(search: string, country?: string): void;
}

@Injectable({
  providedIn: 'root',
})
export class WeatherService implements IWeatherService {
  readonly currentWeather$ = new BehaviorSubject<ICurrentWeather>({
    city: '--',
    country: '--',
    date: Date.now(),
    image: '',
    temperature: 0,
    description: '',
  });

  constructor(
    private http: HttpClient,
    private postalCodeService: PostalCodeService
  ) {}

  getCurrentWeather(
    searchText: string,
    country?: string
  ): Observable<ICurrentWeather> {
    // return this.postalCodeService.resolvePostalCode(searchText).pipe(
    //   switchMap((postalCode) => {
    //     if (postalCode) {
    //       return this.getCurrentWeatherByCoords({
    //         latitude: postalCode.lat,
    //         longitude: postalCode.lng,
    //       });
    //     } else {
    let uriParams = new HttpParams();

    if (typeof searchText === 'string') {
      uriParams = uriParams.set(
        'q',
        country ? `${searchText}, ${country}` : searchText
      );
    } else {
      uriParams = uriParams.set('zip', 'search');
    }

    return this.getCurrentWeatherHelper(uriParams);
    // }
    // })
    // );
  }

  getCurrentWeatherByCoords(coords: Coordinates): Observable<ICurrentWeather> {
    const uriParams = new HttpParams()
      .set('lat', coords.latitude.toString())
      .set('lon', coords.longitude.toString());

    return this.getCurrentWeatherHelper(uriParams);
  }

  updateCurrentWeather(search: string, country?: string): void {
    this.getCurrentWeather(search, country).subscribe((weather) =>
      this.currentWeather$.next(weather)
    );
  }

  private getCurrentWeatherHelper(
    uriParams: HttpParams
  ): Observable<ICurrentWeather> {
    uriParams = uriParams.set('appid', environment.appId);

    return this.http
      .get<ICurrentWeatherData>(
        `${environment.baseUrl}api.openweathermap.org/data/2.5/weather`,
        { params: uriParams }
      )
      .pipe(map((data) => this.transformToICurrentWeather(data)));
  }

  private transformToICurrentWeather(
    data: ICurrentWeatherData
  ): ICurrentWeather {
    return {
      city: data.name,
      country: data.sys.country,
      date: data.dt * 1000,
      image: `http://openweathermap.org/img/w/${data.weather[0].icon}.png`,
      temperature: this.convertKelvinToCelsius(data.main.temp),
      description: data.weather[0].description,
    };
  }

  private convertKelvinToCelsius(kelvin: number): number {
    return kelvin - 273.15;
  }
}
