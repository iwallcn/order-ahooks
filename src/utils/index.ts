/**
 * 模块注释：
 * 这里用来设置各种缓存，eg：语言包，所有仓库，字典数据；
 * 然后再读取各种缓存数据，转换成json格式
 */

export const renderTime = (date) => {
  var dateee = new Date(date).toJSON();
  return new Date(+new Date(dateee) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
}

/**
 * 读取字典数据
 * 提供类型，根据code读取对应的name
 * @param type 
 * @param code 
 */
export const convertDictByCode = (type, code) => {
  let item = window.GLOBAL_DICT[type].filter(val => val.code === code);
  if (!item.length) {
    return ''
  }
  return item[0].name;
}

/**
 * 读取字典数据
 * 提供类型，根据type获取对应的数组
 * @param type 
 */
export const convertDictByType = type => {
  let json_pack = window.GLOBAL_DICT;
  if (!json_pack) {
    return [];
  } else {
    return json_pack[type];
  }
}

/**
 * 预约类型值
 */
export const TYPE = {
  S: '收货预约',
  V: '增值预约',
  W: '排仓预约',
  R: '排队预约'
}
export const ICON = {
  S: 'shohuo',
  V: 'zengzhi',
  W: 'paicang',
  R: 'paidui'
}