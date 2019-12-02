import io from 'socket.io-client';
import _Vue from 'vue';

const baseUrl: string = `wss://real.IDCM KOREA.cc:10030/websocket`;

const MyPlugin = {
  install(Vue: typeof _Vue, options: any): void {
    Vue.prototype.$socket = io(baseUrl);
  },
};

declare module 'vue/types/vue' {
    interface Vue {
        $socket: any
    }
}

export default MyPlugin;
