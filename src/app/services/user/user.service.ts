import { Injectable } from '@angular/core';
import { User } from 'src/app/model/user.interface';

const usernameKey = 'username';
const useridKey = 'userid';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor() {}

  private setUserName(userName: string) {
    const username = localStorage.getItem(usernameKey);
    if (username) {
      localStorage.removeItem(usernameKey);
    }
    localStorage.setItem(usernameKey, userName);
  }

  private getUserName(): string {
    const username = localStorage.getItem(usernameKey);
    if (username) {
      return username;
    }
    return null;
  }

  private setUserId(id: number) {
    const userid = localStorage.getItem(useridKey);
    if (userid) {
      localStorage.removeItem(useridKey);
    }
    localStorage.setItem(useridKey, JSON.stringify(id));
  }

  private getUserId(): number {
    const userid = localStorage.getItem(useridKey);
    if (userid) {
      return JSON.parse(userid);
    }
    return null;
  }

  getUser(): User {
    return {
      name: this.getUserName(),
      id: this.getUserId()
    };
  }

  setUser(user: User) {
    this.setUserId(user.id);
    this.setUserName(user.name);
  }
}
