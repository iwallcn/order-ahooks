import Cookies from 'js-cookie';

/**
 * 缓存中有lang，则取。反之取浏览器lang
 * 同时设置cookie lang
 */
export const getLocale = () => {
  if (!Cookies.get('lang')) {
    localStorage.setItem('lang', navigator.language);
    Cookies.set('lang', navigator.language.split('-')[0], { expires: 30 });
  }
  const L = localStorage.getItem('lang');
  window.LANG = L === 'zh-CN' ? 'zhCN' : 'enUS';
  return L;
}

export const setLocale = (lang) => {
  if (lang !== undefined && !/^([a-z]{2})-([A-Z]{2})$/.test(lang)) {
    throw new Error('setLocale lang format error');
  }
  if (getLocale() !== lang) {
    localStorage.setItem('lang', lang);
    Cookies.set('lang', lang && lang.split('-')[0], { expires: 30 });
    window.location.reload();
  }
}
