import { inject, Injectable, signal } from '@angular/core'
import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { User } from '../_models/user'
import { firstValueFrom } from 'rxjs'
import { parseUserPhoto } from '../_helper/helper'

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private _key = 'account';
  private _baseApiUrl = environment.baseUrl + 'api/account/'
  private _http = inject(HttpClient)

  data = signal<{ user: User, token: string } | null>(null)

  constructor() {
    this.loadDataFromLocalStorage()
  }

  logout() {
    localStorage.removeItem(this._key)
    this.data.set(null)
  }
  // #region login_and_register

  async login(loginData: { username: string, password: string }): Promise<string> {
    try {
      const url = this._baseApiUrl + 'login'
      const response = this._http.post<{ user: User, token: string }>(url, loginData)
      const data = await firstValueFrom(response)
      data.user = parseUserPhoto(data.user)
      this.data.set(data)
      this.saveDataToLocalStorage()
      return ''
    } catch (error: any) {
      return error.error?.message
    }
  }

  async register(registerData: User): Promise<string> {
    try {
      const url = this._baseApiUrl + 'register'
      const response = this._http.post<{ user: User, token: string }>(url, registerData)
      const data = await firstValueFrom(response)
      data.user = parseUserPhoto(data.user)
      this.data.set(data)
      this.saveDataToLocalStorage()
      return ''
    } catch (error: any) {
      return error.error?.message
    }
  }

  // #endregion

  //#region saveDataToLocalStorage_loadDataFromLocalStorage
  private saveDataToLocalStorage() {
    const jsonString = JSON.stringify(this.data())
    localStorage.setItem(this._key, jsonString)
  }

  private loadDataFromLocalStorage() {
    const jsonString = localStorage.getItem(this._key)
    if (jsonString) {
      const data = JSON.parse(jsonString)
      this.data.set(data)
    }
  }
  //#endregion

  //#region UpdateProfileFn
  async updateProfile(user: User): Promise<boolean> {
    const url = environment.baseUrl + 'api/user/'
    try {
      // const response = this._http.post<{ user: User, token: string }>(url, user)
      const response = this._http.patch(url, user)
      await firstValueFrom(response)
      const currentData = this.data()
      if (currentData) {
        currentData.user = user
        this.data.set(currentData)
        this.saveDataToLocalStorage()
      }
    } catch (error) {
      return false
    }
    return true
  }

  //#endregion
}
