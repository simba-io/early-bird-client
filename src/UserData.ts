export interface UserData {
  auth: UserAuthenticationData;
  player: UserPlayerData;
}

export interface UserAuthenticationData {
  uid: string;
  email: string;
}

export interface UserPlayerData {
  uid: string;
  userName: string;
  wins: number;
  win_balance: number;
  active_games: string[];
}

export class UserObject {
  userData: UserData;

  constructor(userData: UserData) {
    this.userData = userData;
  }
}
