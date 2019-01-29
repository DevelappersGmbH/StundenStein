import { User } from 'src/app/model/user.interface';

const mockUser = {
    name: 'TestUser',
    id: 99
};

export class UserServiceMock {

  getUser(): User {
    return mockUser;
  }

}
