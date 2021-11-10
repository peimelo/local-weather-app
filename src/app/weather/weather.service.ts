import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ICurrentWeather } from '../interfaces';

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

export interface IWeatherService {
  getCurrentWeather(city: string, country: string): Observable<ICurrentWeather>;
}

@Injectable({
  providedIn: 'root',
})
export class WeatherService implements IWeatherService {
  constructor(private http: HttpClient) {}

  getCurrentWeather(
    city: string,
    country: string
  ): Observable<ICurrentWeather> {
    const uriParams = new HttpParams()
      .set('q', `${city},${country}`)
      .set('appid', environment.appId);

    return this.http
      .get<ICurrentWeatherData>(
        `${environment.baseUrl}api.openweathermap.org/data/2.5/weather?`,
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
