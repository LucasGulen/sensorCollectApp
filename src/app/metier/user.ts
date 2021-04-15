class User {
  id: string;
  username: string;
  tokenNotificationId: string;

  constructor(id: string, username: string, tokenNotificationId: string) {
    this.id = id;
    this.username = username;
    this.tokenNotificationId = tokenNotificationId;
  }
}

export {User};
