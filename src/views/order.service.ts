import axios, { AxiosPromise } from 'axios';

const baseUrl: string = `https://api.probit.com/api/exchange/v1`;
class OrderService {
    private config: any = {
        headers: {
          'authorization': `Bearer ${ localStorage.getItem('tken') }`,
          'Content-Type': 'application/json',
        },
    };

    public createNewOrder({ market_id, type, side, time_in_force, limit_price, cost, quantity, client_order_id }: any): AxiosPromise<{}> {
        this.config.headers.authorization = `Bearer ${ localStorage.getItem('tken') }`;
        return axios.post(`${ baseUrl }/new_order`, JSON.stringify({ market_id, type, side, time_in_force, limit_price, cost, quantity, client_order_id }), this.config);
    }

    public cancelOrder({ market_id, order_id }: any): AxiosPromise<{}> {
        this.config.headers.authorization = `Bearer ${ localStorage.getItem('tken') }`;
        return axios.post(`${ baseUrl }/cancel_order`, JSON.stringify({ market_id, order_id }), this.config);
    }
    
    public getOrderBook(market_id: string): AxiosPromise<{}> {
        this.config.headers.authorization = `Bearer ${ localStorage.getItem('tken') }`;
        return axios.get(`${ baseUrl }/order_book`, { params: { market_id }, headers: this.config.headers });
    }
    
    public getOpenOrder(market_id: string): AxiosPromise<{}> {
        this.config.headers.authorization = `Bearer ${ localStorage.getItem('tken') }`;
        return axios.get(`${ baseUrl }/open_order`, { params: { market_id }, headers: this.config.headers });
    }
    
    public getBalance(): AxiosPromise<{}> {
        this.config.headers.authorization = `Bearer ${ localStorage.getItem('tken') }`;
        return axios.get(`${ baseUrl }/balance`, this.config);
    }
}

export const orderService = new OrderService();
