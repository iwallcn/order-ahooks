import React, { useState, useEffect, useRef } from 'react';
import { injectIntl } from 'react-intl';
import { Field, Form, Input, Button, Dialog, Tree, Message, Select } from '@alifd/next';
import moment from 'moment';
import styles from './index.module.scss';
import PageHeader from '@/components/PageHeader';
import { CustomIcon } from '@/components/Iconfont';
import globalContext from '@/contexts/globalContext'
import Week from './week';
import Month from './month';
import List from './list';
import API from './api';
import Cookies from 'js-cookie';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
};

export default injectIntl(({ intl }) => {
  const weekRef: any = useRef();
  const lang = window.GLOBAL_LANG;
  const whAll = window.GLOBAL_WHALL;
  // 我要预约 月度预约明细 我的预约列表
  const PAGE_TYPE = [lang['fb4.to.appointment'], lang['fb4.monthly.reservation.details'], lang['fb4.my.appointment.list']];

  /**
   * week-周数据相关
   */

  /**
   * 设置moment语言
   * zh-cn 44445 zh  中文
      en 44445 en   英文
      en 44445 ja   日文
      en 44445 zh  没有
   */
  let _currentWeek;
  let langStr = Cookies.get('lang') || '';
  if (langStr == 'en') {
    moment.locale('en');
    _currentWeek = moment().week()
  } else {
    moment.locale('zh-cn');
    _currentWeek = moment().week() + 1;
  }
  console.log(moment.locale(), 44445, Cookies.get('lang'), _currentWeek);
  const [currentWeek, setCurrentWeek] = useState(_currentWeek); // 当前时间当前周
  const [initWeek, setInitWeek] = useState(0); // 起始周从0开始

  /**
   * month-月数据相关
   */
  // 得到月份数
  const getMonth = () => {
    return moment().subtract(initMonth, 'months').format('YYYY-M-DD').split('-')[1];
  };

  // 得到该月的天数
  const getDays = () => {
    return moment().subtract(initMonth, 'months').daysInMonth();
  }
  const [initMonth, setInitMonth] = useState(0) // 标记当前月起始是0，用于获取上月下月,上月就+1，下月就-1
  const [currentMonth, setCurrentMonth] = useState(getMonth()); // 当前月
  const [days, setDays] = useState(getDays()); //当前月天数


  /**
   * index-父组件
   */
  const searchField = Field.useField({ values: {} });
  const [warehouseCode, setWarehouseCode] = useState([]); // FIXME 临时存放 FIXME
  const [warehouseName, setWarehouseName] = useState('');
  const [weekResult, setWeekResult] = useState({});
  const [monthResult, setMonthResult] = useState([]);
  const [visible, setVisible] = useState(false);
  const [pageType, setPageType] = useState(PAGE_TYPE[0]); //FIXME
  const [TYPE, setTYPE] = useState({});
  const [ICON, setICON] = useState({});
  const apField = Field.useField({ values: {} });

  const selectChange = (val, type, item) => {
    setPageType(val);
  }

  /**
   * 树形仓库相关
   * @param key 
   * @param info 
   */
  const selectWh = (key, info) => {
    setWarehouseCode(key);
    setWarehouseName('');
    key.length && setWarehouseName(info.selectedNodes[0].props.name)
  };
  // 选择仓库点击提交
  const selectWhOK = () => {
    if (!warehouseCode.length) {
      Message.warning(lang['fb4.select.warehouse']);
      return;
    }
    setVisible(false);
    getWeekList();
  };
  // 仓库弹出框
  const WH_Dialog = (
    <Dialog className={styles.whDialog}
      title={lang['fb4.html.filter.condition']}
      visible={visible}
      onOk={selectWhOK}
      onCancel={() => setVisible(false)}
      onClose={() => setVisible(false)}>
      <Form field={searchField} labelAlign="left" {...formLayout}>
        <FormItem label={lang['fb4.delivery.warehouse']} required>
          <Tree
            defaultExpandAll={true}
            autoExpandParent
            selectedKeys={warehouseCode}
            onSelect={selectWh}
            dataSource={whAll} />
        </FormItem>
      </Form>
    </Dialog>
  );

  /**
   * 切换周，向前-1，向后+1
   * 向后切，如果切换当前周比今年周还大，则不让切换
   * 向前切，如果切换当前周比1还小，则不让切换
   * @param n 
   */
  const weeks = moment().weeksInYear(); // 算出今年有多少周
  const changeWeek = (n) => {
    if (n == 2) {
      return
    }
    if (n == 0) { // 点击上一周
      if (isPre() <= 0) { // 判断当前周第一天跟当前日期进行对比
        return;
      }
      if (currentWeek == 1) {
        setCurrentWeek(weeks);
      } else {
        setCurrentWeek(currentWeek - 1);
      }
      setInitWeek(initWeek - 1);
    } else { // 点击下一周
      if (currentWeek == weeks) { // 如果当前周跟今年最大周相等，则从1开始           
        setCurrentWeek(1);
      } else {
        setCurrentWeek(currentWeek + 1);
      }
      setInitWeek(initWeek + 1);
    }
  };
  const isPre = () => {
    let current: any = moment().add(initWeek, 'week').startOf('week').format('YYYY-MM-DD');
    let today: any = moment().format('YYYY-MM-DD');
    return moment(current).valueOf() - moment(today).valueOf();
  }

  /**
   * 切换月时，记录下当前操作的索引，以当前时间0为准，向前+1，向后-1
   * 重新获取月数和天数
   * @param n 
   */
  const changeMonth = (n) => {
    n ? setInitMonth(initMonth - 1) : setInitMonth(initMonth + 1);
  };

  const Search = (
    <div className="Search">
      <h4><b>{lang['fb4.appointment.instructions']}</b><span>{lang['fb4.appointment.rules.details']}</span></h4>
      <ul>
        <li><b>1. {lang['fb4.appointment.priority']}：</b>
          <CustomIcon type="shohuo" className={styles.shohuo} />{lang['fb4.reservation']} &gt;
          <CustomIcon type="zengzhi" className={styles.zengzhi} />{lang['fb4.reservation.value.add']} &gt;
          <CustomIcon type="paicang" className={styles.paicang} />{lang['fb4.reservation.warehouse.queue']} &gt;
          <CustomIcon type="paidui" className={styles.paidui} />{lang['fb4.reservation.queue']}
        </li>
        <li><b>2. {lang['fb4.reservation']}：</b>{lang['fb4.reservation.instructions']}</li>
        <li><b>3. {lang['fb4.reservation.value.add']}：</b>{lang['fb4.reservation.value.add.instructions']}</li>
        <li><b>4. {lang['fb4.reservation.warehouse.queue']}：</b>{lang['fb4.reservation.warehouse.queue.instructions']}</li>
        <li><b>5. {lang['fb4.reservation.queue']}：</b>{lang['fb4.reservation.queue.instructions']}</li>
        <li><b>6. {lang['fb4.special.reminder']}：</b>{lang['fb4.special.reminder.instructions']}</li>
      </ul>
    </div>
  );

  /**
   * 获取周列表 TODO
   * 升序
   */
  const getWeekList = () => {
    let queryTime = {
      beginDate: moment().add(initWeek, 'week').startOf('week').valueOf(),
      endDate: moment().add(initWeek, 'week').endOf('week').valueOf()
    }
    let data = {
      beginDate: queryTime.beginDate,
      endDate: queryTime.endDate,
      warehouseCode: warehouseCode[0]
    }
    API.getUnit(data).then(res => {
      if (res.success && res.data && res.data.appointmentPanelUnitList) {
        let arr = res.data.appointmentPanelUnitList
        if (!arr.length) {
          setWeekResult({});
          return;
        }
        arr.sort((a, b) => {
          return moment(a.appointmentTime).valueOf() - moment(b.appointmentTime).valueOf()
        });
        setWeekResult({
          ...res.data, arr
        });
      } else {
        Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
      }
    })
  }

  /**
   * 获取月列表
   * 升序
   */
  const getMonthList = () => {
    let queryTime = {
      beginDate: moment().subtract(initMonth, 'months').startOf('month').valueOf(),
      endDate: moment().subtract(initMonth, 'months').endOf('month').valueOf()
    }
    let inquiryNumber = apField.getValue('inquiryNumber');
    let data = {
      beginDate: queryTime.beginDate,
      endDate: queryTime.endDate,
      warehouseCode: warehouseCode[0],
      inquiryNumber: inquiryNumber
    }
    API.getMonthAndListPanel(data).then(res => {
      if (res.success && res.data) {
        if (!res.data.length) {
          setMonthResult([]);
          return;
        }
        let temp = res.data.sort((a, b) => {
          return moment(a.appointmentTime).valueOf() - moment(b.appointmentTime).valueOf();
        });
        for (let i = 0; i < temp.length; i++) {
          let t = temp[i].reservationTimeClassifyList;
          let d = t.sort((a, b) => {
            return Date.parse('20 Aug 2000 ' + a.actualDate) - Date.parse('20 Aug 2000 ' + b.actualDate)
          });
          temp[i].reservationTimeClassifyList = d;
        }
        setMonthResult(temp);
      } else {
        Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
      }
    })
  }

  // 获取预约类型
  const getApponitType = () => {
    const s = window.GLOBAL_DICT['RESERVATION_TYPE'];
    for (let i of s) {
      TYPE[`${i.code}`] = i.name;
      if (i.code == 'S') {
        ICON[`${i.code}`] = 'shohuo';
      } else if (i.code == 'V') {
        ICON[`${i.code}`] = 'zengzhi';
      } else if (i.code == 'W') {
        ICON[`${i.code}`] = 'paicang';
      } else if (i.code == 'R') {
        ICON[`${i.code}`] = 'paidui';
      }
    }
    setTYPE(TYPE);
    setICON(ICON);
  }

  /**
   * 1、刷新页面需要先选择仓库之后才能加载列表，
   * 2、设置语言包，仓库数据
   * 3、监听下拉，上下切月
   */
  const mounted = useRef(false); // FIXME
  useEffect(() => {
    if (mounted.current) {
      setCurrentMonth(getMonth());
      setDays(getDays());
      if (pageType == PAGE_TYPE[0]) { // 获取周列表
        getWeekList();
      } else {
        getMonthList();
      }
    }
  }, [initMonth, initWeek, pageType]);
  useEffect(() => {
    getApponitType();
    mounted.current = true;
    if (!warehouseCode.length && whAll.length) {
      setVisible(true)
      return;
    }
  }, []);


  /**
   * 三种类型的头部信息
   */
  const ListHead = (
    <div className={styles.calOther}>
      <div className={styles.wh}>
        <Form field={apField} labelAlign="left" inline>
          <FormItem style={{ marginBottom: 0, marginRight: 0 }}>
            <Input
              readOnly
              addonTextAfter="▼"
              size="medium"
              placeholder={lang['fb4.html.export.warehouse']}
              onClick={() => setVisible(true)}
              name="warehouseName"
              value={warehouseName}
              style={{ width: 160 }} />
          </FormItem>
          {pageType != PAGE_TYPE[0] &&
            <>
              <FormItem style={{ marginBottom: 0, marginRight: 0, marginLeft: 12 }}>
                <Input
                  size="medium"
                  placeholder={`${lang['fb4.cml.no']}/${lang['fb4.receiving.plan.no']}/${lang['fb4.iconsignment.no']}`}
                  name="inquiryNumber"
                  style={{ width: 200 }}
                  hasClear />
              </FormItem>
              <Button type="primary" onClick={getMonthList} style={{ marginLeft: 12 }}>{lang['fb4.query']}</Button>
            </>
          }
        </Form>
      </div>
      <div className={styles.calTimes}>
        {pageType == PAGE_TYPE[0] && <>
          <h3>{moment().format('LLLL')}</h3>
          <div className={styles.calWeek}>
            <span><CustomIcon type="left"
              className={isPre() <= 0 ? `${styles.left} ${styles.disabled}` : styles.left}
              onClick={() => changeWeek(0)} title={lang['fb4.last.week']} />
            </span>
            <span>{currentWeek} {lang['fb4.week']}</span>
            <span><CustomIcon type="right"
              className={styles.right}
              onClick={() => changeWeek(1)} title={lang['fb4.next.week']} />
            </span>
          </div>
        </>}
        {pageType == PAGE_TYPE[1] && <>
          <h3>{moment().format('LL')} {PAGE_TYPE[1]}</h3>
          <div className={styles.calWeek}>
            <span><CustomIcon type="left" className={styles.left} onClick={() => changeMonth(0)} title={lang['fb4.last.month']} /></span>
            <span>{currentMonth} {lang['fb4.month']}</span>
            <span>
              <CustomIcon type="right"
                title={lang['fb4.next.month']}
                className={styles.right}
                onClick={() => changeMonth(1)} />
            </span>
          </div>
        </>}
        {pageType == PAGE_TYPE[2] && <h3>{PAGE_TYPE[2]}</h3>}
      </div>
      <div className={styles.utils}>
        <Select onChange={selectChange} value={pageType} style={{ minWidth: 170 }} label={<CustomIcon type="liebiao" />}>
          <Select.Option value={PAGE_TYPE[1]}>{PAGE_TYPE[1]}</Select.Option>
          <Select.Option value={PAGE_TYPE[2]}>{PAGE_TYPE[2]}</Select.Option>
        </Select>
        {pageType == PAGE_TYPE[0] &&
          <Button type="primary" disabled={weekResult.isQueue != 'Y'} onClick={() => weekRef.current.changeApVisible(true)}>{TYPE['R']}</Button>}
        {pageType != PAGE_TYPE[0] && <span className={styles.span} onClick={() => setPageType(PAGE_TYPE[0])} ><CustomIcon type="shijian" />{PAGE_TYPE[0]}</span>}
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: lang['fb4.order.iconsignment.reservation'] }, { name: lang['fb4.order.iconsignment.my.reservation'] }]}
      />
      {Search}

      <div className="List">
        {ListHead}
        <globalContext.Provider value={{
          lang,
          CustomIcon,
          getMonthList
        }}>
          {
            pageType == PAGE_TYPE[0] && Object.keys(weekResult).length > 0 &&
            <Week lists={weekResult} initWeek={initWeek} weekRef={weekRef}
              warehouseCode={warehouseCode[0]}
              warehouseName={warehouseName}
              TYPE={TYPE}
              ICON={ICON}
              getWeekList={getWeekList}
            ></Week>
          }
          {
            pageType == PAGE_TYPE[1] && monthResult.length > 0 &&
            <Month
              list={monthResult}
              initMonth={initMonth}
              days={days}
              TYPE={TYPE}
              ICON={ICON}></Month>
          }
          {
            pageType == PAGE_TYPE[2] && monthResult.length > 0 &&
            <List
              list={monthResult}
              TYPE={TYPE}
              ICON={ICON}
            ></List>
          }
        </globalContext.Provider>
        {WH_Dialog}
      </div>
    </>
  );
});
