<template>
  	<div class="window-box">
	  	<Titlebar />
	  	<div class="box-content vertical">
			<div class="msg-box" :style="{ 'background-color': bg }" v-show="show">{{ msg }}<span @click="closeAlert">x</span></div>
			<!-- <table>
				<thead>
					<th>가격</th>
					<th>수량</th>
					<th>합계</th>
				</thead>
				<tbody>
					<tr v-for="(item, idx) in order.sell.slice(0, 10)" :key="idx">
						<td class="mint-letter">{{ item.limit_price }}</td>
						<td class="letter">{{ item.quantity }}</td>
						<td></td>
					</tr>
					<tr>
						<td class="average" colspan="3"><span>0.0005100</span><span>0.0077KRW</span></td>
					</tr>
					<tr v-for="(item, idx) in order.buy.slice(0, 10)" :key="idx">
						<td class="orange-letter">{{ item.limit_price }}</td>
						<td class="letter">{{ item.quantity }}</td>
						<td class="red-letter"></td>
					</tr>										
				</tbody>
			</table> -->
			<form v-on:submit.prevent>
				<div class="input-box">
					<label>매도금액 Max</label>
					<input type="text" v-model="orderMax">
				</div>
				<div class="input-box">
					<label>매도금액 Min</label>
					<input type="text" v-model="orderMin">
				</div>
				<div class="input-box">
					<label>1회당 매도수량</label>
					<input type="text" v-model="orderQuantity">
				</div>
				<div class="input-box">
					<!-- <label>총매도수량합계</label> -->
					<label>매수주기</label>
					<input type="text" v-model="orderSum">
				</div>
				<div class="input-box">
					<label>매도주기</label>
					<input type="text" v-model="randomTime">
				</div>
				<button class="mint" :disabled="type === 'cancel'" @click="run">실행</button>
				<button class="red" @click="cancelOrder">전체취소</button>
				<button class="blue" @click="refresh">새로고침</button>
				<button class="orange" @click="exit">종료</button>
			</form>
			<div class="user-box"><span>접속 아이디: {{ id }} 님</span></div>
			<div class="money-box"><span>총 잔고: {{ total }}</span> <span>사용가능 잔고: {{ available }}</span></div>
    	</div>
  	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Titlebar from '@/components/Titlebar.vue';
import { orderService } from './order.service';
import { userService } from './user.service';
import { user } from '@/env/user';

declare const window: any;
const electron = window.require('electron');
const WebSocket = window.require('ws');
const { ipcRenderer, remote } = electron;
const log = remote.require('electron-log');

@Component({
	components: {
		Titlebar
	}
})
export default class Home extends Vue {
	private id: string | null = '';
	private orderMax: string = '';
	private orderMin: string = '';
	private orderQuantity: string = '';
	private orderSum: string = '';
	private randomNum: string = '';
	private randomQuantity: string = '';
	private randomTime: string = '';
	private order: any = {
		sell: [],
		buy: [],
		time: ''
	};
	private type: string = '';
	private ws: any = new WebSocket('wss://api.probit.com/api/exchange/v1/ws');
	private available: number = 0;
	private total: number = 0;
	private bg: string = '#00c89c';
	private show:boolean = false;
	private msg: string = '';

	private mounted() {
		// const ws = new WebSocket('wss://api.probit.com/api/exchange/v1/ws');
		this.ws.onopen = () => {
			const msg = {
				type: 'authorization',
				token: localStorage.getItem('tken')
			};
			this.ws.send(JSON.stringify(msg));
		};

		this.ws.onmessage = (event: any) => {
			const data = JSON.parse(event.data);
			console.log('Message #########', data);
			if (data.errorCode === 'UNAUTHORIZED') {
				this.showAlert('인증이 승인되지 않습니다.', '#ff2950');
				const msg = {
					type: 'authorization',
					token: localStorage.getItem('tken')
				};
				this.ws.send(JSON.stringify(msg));
			}

			if (data.type === 'authorization' && data.result === 'ok') {
				const msg = {
					type: 'subscribe',
					channel: 'balance'
				};
				this.id = localStorage.getItem('id');
				this.login(this.id);
				// this.ws.send(JSON.stringify(msg1));
				this.ws.send(JSON.stringify(msg));
			} else if (data.channel === 'balance') {
				if (data.data.hasOwnProperty('CXAT') && data.data.hasOwnProperty('KRW') && data.data.hasOwnProperty('ETH')) {
					log.info(`[KRW-CXAT 총액 - 9090000 = ${ +data.data.KRW.total - 9090000 }]---------[ETH-CXAT 총액 - 290910000 = ${ +data.data.ETH.total - 290910000 }]---------[외부유입 CXAT 총액: ${ (+data.data.KRW.total - 9090000) + (+data.data.ETH.total - 290910000) }]`);
				}
				if (data.data.hasOwnProperty('ETH')) {
					this.available = data.data.ETH.available;
					this.total = data.data.ETH.total;
					log.info(`[ETH 총액: ${ data.data.ETH.total } ETH 사용가능 잔고: ${ data.data.ETH.available }]-----------[ETH-CXAT 총액 - 9090000 = ${ +data.data.ETH.total - 9090000 }]`);
				}
				if (data.data.hasOwnProperty('CXAT')) {
					log.info(`[CXAT 총액: ${ data.data.CXAT.total } CXAT 사용가능 잔고: ${ data.data.CXAT.available }]`);
				}				
			}
		};

		this.ws.onerror = (error: any) => {
			console.error(error);
		}
	}

	private showAlert(msg: string, color: string): void {
		this.msg = msg;
		this.bg = color;
		this.show = true;
	}

	private closeAlert(): void {
		this.show = false;
	}

	private refresh(): void {
		location.reload();
		this.showAlert('새로고침되었습니다.', '#13143f');
	}

	async login(key: any): Promise<any> {
        try {
			const response: any = await userService.getToken({ id: user[key].id, password: user[key].password });
			console.log('login response -------->', response)
			localStorage.setItem('tken', response.data.access_token);
			this.showAlert('자동 로그인되었습니다.', '#00c89c');
        } catch (error) {
            console.error(error);
        }
    }

	private run() {
		this.type = 'cancel';
		const that = this;
		if (this.orderMax === '' || this.orderMin === '' || this.orderQuantity === '' || this.orderSum === '' || this.randomTime === '') {
			return alert('하나라도 입력란이 비어 있으면 안됩니다.');
		}

		this.order.time = setInterval(() => {
			const max: any = +this.randomTime * 1000;
			setTimeout(() => {
				this.sellOrder();
			}, that.makeRandom(1, max));

			const buy_max: any = +this.orderSum * 1000;
			setTimeout(() => {
				this.buyOrder();
			}, that.makeRandom(10000, buy_max));
		}, +this.randomTime * 1000);

		alert('입력한 값에 따라 실행됩니다.');
	}

	async getOpenOrder(): Promise<any> {//모든 오픈오더 리스트 가져오기
		try {
			const response: any = await orderService.getOpenOrder('CXAT-ETH');
			console.log('openorder__________', response)
			return response.data;
		} catch (error) {
			console.error(error);			
		}
	}

	private makeRandom(min: number, max: number): any {
		return ((Math.random() * (max - min + 0.0000001)) + min).toFixed(8);
	}

	async sellOrder(): Promise<any> {
		this.randomNum = this.makeRandom(+this.orderMin, +this.orderMax);
		this.randomQuantity = this.makeRandom(2000, +this.orderQuantity).split('.')[0];
		try {
			const response: any = await orderService.createNewOrder({ market_id: 'CXAT-ETH', type: 'limit', side: 'sell', time_in_force: 'gtc', limit_price: this.randomNum, quantity: this.randomQuantity, client_order_id: 'today' + new Date().getTime() });
			console.log('sellOrder ----->', response);
		} catch (error) {
			console.error(error);
			if (error.response.data.errorCode === 'UNAUTHORIZED') {
				this.showAlert('토큰이 만료되어 승인이 거부되었습니다. 로그인을 시도합니다.', '#ff2950');
				this.login(this.id);
			}
			if (error.response.data.errorCode.includes('INVALID_MARKET')) {
				this.showAlert('매수할 가격이 존재하지 않습니다.', '#ff2950');
			}
		}
	}

	async buyOrder(): Promise<any> {
		try {
			const list: any = await this.getOpenOrder();
			let min = 0;
			let idx = 0;
			let buy = 0;
			let sell = 0;
			for (let i = 0; i < list.data.length; i++) {
				let price;
				if (list.data[i].side === 'buy') {
					buy++;
				} else {
					sell++;
				}

				if (list.data[i].side === 'sell') {
					let price = +list.data[i].limit_price;
					console.log(price)
					if (price >= +this.orderMin && price < +this.orderMax) {console.log('------>', price,  min);
						min = price;
						idx = i;
					}
				}
			}

			if (sell >= buy) {
				if (list.data[idx].client_order_id.includes('today')) {console.log('buy!', list.data[idx].limit_price)
					const response: any = await orderService.createNewOrder({ market_id: 'CXAT-ETH', type: 'limit', side: 'buy', time_in_force: 'gtc', limit_price: list.data[idx].limit_price, quantity: list.data[idx].quantity });
					// if (Notification.permission === "granted") {
					// 	var notification = new Notification("ETH 매수 알림", {
					// 		body: `${ list.data[idx].client_order_id }의 ${ list.data[idx].limit_price }을 매수하였습니다.`
					// 	});
					// }
				}
			}
		} catch (error) {
			console.error(error);
			if (error.response.data.errorCode === 'NOT_ENOUGH_BALANCE') {
				this.showAlert('잔고가 부족합니다.', '#ff2950');
			}
		}
	}

	async cancelOrder(): Promise<any> {
		try {
			const openList: any = await this.getOpenOrder();
			for (let item of openList.data) {
				if (item.client_order_id.includes('today')) {
					const response: any = await orderService.cancelOrder({ market_id: 'CXAT-ETH', order_id: item.id });
				}
			}
			clearInterval(this.order.time);
			this.type = 'run';
			alert('전체취소되었습니다.');
		} catch (error) {
			console.error(error);
		}
	}
	
	private exit(): void {
		ipcRenderer.send('exit');
	}
}
</script>
<style lang="scss" scoped>
@import './home.scss';
</style>
