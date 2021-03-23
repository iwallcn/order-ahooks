import { request } from 'ice';

/***
 * 预约相关接口
 */
export default {
  // 预约面板:获取存货量
  async getUnit(data) {
    return await request.post(`/appointment/getUnit`, data);
  },

  // 预约面板:月和列表面板
  async getReservationForPanel(data) {
    return await request.post(`/appointment/getReservationForPanel`, data);
  },

  // 查询客预约单号
  async queryAvailableNo() {
    return await request.get(`/appointment/queryAvailableNo`);
  },

  // 更新柜号
  async updateCmlNo(data) {
    return await request.post('/appointment/updateCmlNo', data, {
      transformRequest: [function (data) {
        let ret = '';
        for (let it in data) {
          ret += `${it}=${data[it]}&`;
        }
        return ret.substr(0, ret.length-1);
      }]
    });
  },

  // 预约周面板-预约排队
  async queue(data) {
    return await request.post(`/appointment/queue`, data);
  },

  // 预约周面板-提交预约
  async confirm(data) {
    return await request.post(`/appointment/confirm`, data);
  },

  // 取消预约
  async cancelReceivingPlan(data) {
    return await request(`/appointment/cancelReceivingPlan?receivingPlanNo=${data}`);
  },

  /**
   * 预约月面板- (date, warehouseCode)，根据天获取可预约类型和时间段
   * @param {*} data 
   */
  async getDayUnit(data) {
    return await request.post(`/appointment/getDayUnit`, data);
  },
}
