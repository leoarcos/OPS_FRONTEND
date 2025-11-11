import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpinnerServiceService {

  constructor() { }
  private _loading = false;

  get loading(): boolean {
    return this._loading;
  }

  show() {
    this._loading = true;
  }

  hide() {
    this._loading = false;
  }
}
