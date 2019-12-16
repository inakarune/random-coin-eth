import axios, { AxiosPromise } from 'axios';

const baseUrl: string = `https://accounts.probit.com/token`;
class UserService {
    public getToken({ id, password }: any): AxiosPromise<{}> {
        const authHeader = 'Basic ' + btoa(`${ id }:${ password }`);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            }
        };
        return axios.post(`${ baseUrl }`, JSON.stringify({ grant_type: 'client_credentials' }), config);
    }
}

export const userService = new UserService();
