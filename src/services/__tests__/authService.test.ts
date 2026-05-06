import axios from 'axios';
import { login } from '../authService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const CREDENTIALS = { email: 'user@example.com', password: 'secret' };
const TOKEN = 'jwt-token-abc';

afterEach(() => {
  jest.restoreAllMocks();
});

describe('login', () => {
  it('should call POST /auth/login with credentials and return the token', async () => {
    process.env.REACT_APP_API_BASE_URL = 'https://api.example.com';
    mockedAxios.post.mockResolvedValueOnce({ data: { token: TOKEN } });

    const result = await login(CREDENTIALS);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.example.com/auth/login',
      CREDENTIALS
    );
    expect(result).toEqual({ token: TOKEN });
  });

  it('should propagate the error when axios.post rejects', async () => {
    const error = new Error('Network Error');
    mockedAxios.post.mockRejectedValueOnce(error);

    await expect(login(CREDENTIALS)).rejects.toThrow('Network Error');
  });
});
