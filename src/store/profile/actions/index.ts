import { ActionTree } from 'vuex';
import { ProfileState } from '../types';
import { RootState } from '../../types';
import { userService } from '@/views/user.service';
import { user } from '@/env/user';

export const actions: ActionTree<ProfileState, RootState> = {
    async login(context, payload) {
        try {
            const response: any = await userService.getToken({ id: user[payload].id, password: user[payload].password });
            console.log('login response -------->', response)
			localStorage.setItem('tken', response.data.access_token);
        } catch (error) {
            console.error(error);
        }
    }
};
