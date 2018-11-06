import { Injectable } from '@angular/core';

const usernameKey: string = 'username';
const useridKey: string = 'userid';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  setUserName(firstname, lastname) {
    const username = localStorage.getItem(usernameKey);
    if (username) {
      localStorage.removeItem(usernameKey);
    }
    localStorage.setItem(usernameKey, `${firstname} ${lastname}`);
  }

  getUserName(): string {
    const username = localStorage.getItem(usernameKey);
    if (username) {
      return username;
    }
    return null;
  }

  setUserId(id: number) {
    const userid = localStorage.getItem(useridKey);
    if (userid) {
      localStorage.removeItem(useridKey);
    }
    localStorage.setItem(useridKey, JSON.stringify(id));
  }

  getUserId(): number {
    const userid = localStorage.getItem(useridKey);
    if (userid) {
      return JSON.parse(userid);
    }
    return null;
  }
}
