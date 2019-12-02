<template>
  	<div class="window-box">
	  	<Titlebar />
	  	<div class="box-content vertical">
			<!-- <table>
				<thead>
					<th>가격</th>
					<th>수량</th>
					<th>합계</th>
				</thead>
				<tbody>
					<tr>
						<td class="mint-letter">366783.0</td>
						<td class="letter">0.0000733</td>
						<td></td>
					</tr>
					<tr>
						<td class="mint-letter">366783.0</td>
						<td class="letter">0.0000733</td>
						<td></td>
					</tr>
					<tr>
						<td class="mint-letter">366783.0</td>
						<td class="letter">0.0000733</td>
						<td></td>
					</tr>
					<tr>
						<td class="mint-letter">366783.0</td>
						<td class="letter">0.0000733</td>
						<td></td>
					</tr>
					<tr>
						<td class="mint-letter">366783.0</td>
						<td class="letter">0.0000733</td>
						<td></td>
					</tr>
					<tr>
						<td class="mint-letter">366783.0</td>
						<td class="letter">0.0000733</td>
						<td></td>
					</tr>
					<tr>
						<td class="mint-letter">366783.0</td>
						<td class="letter">0.0000733</td>
						<td></td>
					</tr>
					<tr>
						<td class="mint-letter">366783.0</td>
						<td class="letter">0.0000733</td>
						<td></td>
					</tr>
					<tr>
						<td class="average" colspan="3"><span>0.0005100</span><span>0.0077KRW</span></td>
					</tr>
					<tr>
						<td class="orange-letter">350000.0</td>
						<td class="letter">0.0000733</td>
						<td class="red-letter"></td>
					</tr>			
					<tr>
						<td class="orange-letter">350000.0</td>
						<td class="letter">0.0000733</td>
						<td class="red-letter"></td>
					</tr>	
					<tr>
						<td class="orange-letter">350000.0</td>
						<td class="letter">0.0000733</td>
						<td class="red-letter"></td>
					</tr>
					<tr>
						<td class="orange-letter">350000.0</td>
						<td class="letter">0.0000733</td>
						<td class="red-letter"></td>
					</tr>
					<tr>
						<td class="orange-letter">350000.0</td>
						<td class="letter">0.0000733</td>
						<td class="red-letter"></td>
					</tr>
					<tr>
						<td class="orange-letter">350000.0</td>
						<td class="letter">0.0000733</td>
						<td class="red-letter"></td>
					</tr>
					<tr>
						<td class="orange-letter">350000.0</td>
						<td class="letter">0.0000733</td>
						<td class="red-letter"></td>
					</tr>
					<tr>
						<td class="orange-letter">350000.0</td>
						<td class="letter">0.0000733</td>
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
				<button class="mint" @click="run">실행</button>
				<button class="red" @click="cancelOrder">전체취소</button>
				<button class="blue" @click="refresh">새로고침</button>
				<button class="orange" @click="exit">종료</button>
			</form>
			<div class="user-box"><span>접속 아이디: {{ id }} 님</span></div>
			<div class="money-box">총 잔고: {{ total }} | 사용가능 잔고: {{ available }}</div>
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
const { ipcRenderer } = electron;

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
		sell: '',
		buy: '',
		time: ''
	};
	private type: string = '';
	private ws: any = new WebSocket('wss://api.probit.com/api/exchange/v1/ws');
	private available: number = 0;
	private total: number = 0;

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
				const msg = {
					type: 'authorization',
					token: localStorage.getItem('tken')
				};
				this.ws.send(JSON.stringify(msg));
			}

			if (data.type === 'authorization' && data.result === 'ok') {
				// const msg = {
				// 	type: 'subscribe',
				// 	channel: 'open_order'
				// };
				const msg = {
					type: 'subscribe',
					channel: 'balance'
				};
				this.id = localStorage.getItem('id');
				this.login(this.id);
				this.ws.send(JSON.stringify(msg));
			} else if (data.channel === 'balance') {
				if (data.data.hasOwnProperty('KRW')) {
					this.available = data.data.KRW.available;
					this.total = data.data.KRW.total;
				}
			}
		};

		this.ws.onerror = (error: any) => {
			console.error(error);
		}
	}

	private refresh(): void {
		location.reload();
	}

	async login(key: any): Promise<any> {console.log('try login')
        try {
			const response: any = await userService.getToken({ id: user[key].id, password: user[key].password });
			console.log('login response -------->', response)
            localStorage.setItem('tken', response.data.access_token);
        } catch (error) {
            console.error(error);
        }
    }

	private run() {
		const that = this;
		if (this.orderMax === '' || this.orderMin === '' || this.orderQuantity === '' || this.orderSum === '' || this.randomTime === '') {
			return alert('하나라도 입력란이 비어 있으면 안됩니다.');
		}

		this.order.time = setInterval(() => {
			const max: any = +this.randomTime * 1000
			setTimeout(() => {
				this.sellOrder();
			}, that.makeRandom(1, max));

			const buy_max: any = +this.orderSum * 1000;
			setTimeout(() => {
				this.buyOrder();
			}, that.makeRandom(10000, buy_max));
		}, +this.randomTime * 1000);

	}

	async getOpenOrder(): Promise<any> {//모든 오픈오더 리스트 가져오기
		try {
			const response: any = await orderService.getOpenOrder('CXAT-KRW');
			console.log('openorder__________', response)
			return response.data;
		} catch (error) {
			console.error(error);			
		}
	}

	async getOrderList(): Promise<any> {
		try {
			const response: any = await orderService.getOrderBook('CXAT-KRW');

		} catch (error) {
			console.error(error);
		}
	}

	private makeRandom(min: number, max: number): any {
		return ((Math.random() * (max - min + 1)) + min).toFixed(2);
	}

	async sellOrder(): Promise<any> {
		this.randomNum = this.makeRandom(+this.orderMin, +this.orderMax);
		this.randomQuantity = this.makeRandom(2000, +this.orderQuantity).split('.')[0];
		try {
			const response: any = await orderService.createNewOrder({ market_id: 'CXAT-KRW', type: 'limit', side: 'sell', time_in_force: 'gtc', limit_price: this.randomNum, quantity: this.randomQuantity, client_order_id: 'today' + new Date().getTime() });
			console.log('sellOrder ----->', response);
		} catch (error) {
			console.error(error);
			if (error.response.data.errorCode === 'UNAUTHORIZED') {
				this.login(this.id);
			}
			if (error.response.data.errorCode.includes('INVALID_MARKET')) {
				alert('매수할 가격이 존재하지 않습니다.');
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
					const response: any = await orderService.createNewOrder({ market_id: 'CXAT-KRW', type: 'limit', side: 'buy', time_in_force: 'gtc', limit_price: list.data[idx].limit_price, quantity: list.data[idx].quantity });
				}
			}
		} catch (error) {
			console.error(error);
			if (error.response.data.errorCode === 'NOT_ENOUGH_BALANCE') {
				// alert('잔고가 부족합니다.');
			}
		}
	}

	async cancelOrder(): Promise<any> {
		try {
			const openList: any = await this.getOpenOrder();
			for (let item of openList.data) {
				if (item.client_order_id.includes('today')) {
					const response: any = await orderService.cancelOrder({ market_id: 'CXAT-KRW', order_id: item.id });
				}
			}
			this.order.time = null;
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
