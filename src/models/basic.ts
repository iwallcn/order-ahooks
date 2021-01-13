import { request } from 'ice';
import Cookies from 'js-cookie';
export default {
  state: {
    // logo: 'https://www.4px.com/favicon.ico',
    title: window.GLOBAL_LANG['fb4.order.system.name'],
    asideMenu: [ // 这里可以自定义一些前端路由
    ],
    ajaxData: {
      user: {},
      menu: [],
      foot: {},
      services: []
    }
  },
  reducers: {
    setAjaxData(prevState, res, userInfo) {
      const employee: any = {};
      prevState.ajaxData = {
        user: {
          avatar: 'https://img.alicdn.com/tfs/TB1.ZBecq67gK0jSZFHXXa9jVXa-904-826.png',
          fullName: userInfo && userInfo.data && userInfo.data.webToken,
          name: employee.fullName,
          phone: employee.phone,
          email: employee.email,
          address: `${employee.country} / ${employee.province} / ${employee.city}`,
          remark: employee.remark || '这家伙很赖~'
        },
        menu: res,
        foot: {
          copyright: `版权© 2004-${new Date().getFullYear()} 深圳市递四方信息科技有限公司 粤ICP备 12019163号-7`
        }
      };
    },
  },
  effects: () => ({
    async getAjaxData() { // FB4订单中心
      const lang = Cookies.get('lang');
      console.log(lang)
      const res = await request(`/order/menu/getAllByUser?lan=${lang}`);
      const userInfo = await request('/udesk/getCustomerData');
      this.setAjaxData(res, userInfo);
    }
  })
};
