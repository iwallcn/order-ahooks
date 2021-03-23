import React, { useState, useEffect, useRef } from 'react';
import { injectIntl } from 'react-intl';
import { Field, Form, Input, Button, Dialog, Tree, Message, Collapse, Tab } from '@alifd/next';
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
import QueueDialog from './dialogQueue';

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
   * 设置moment语言
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
  const [pageType, setPageType] = useState(0); //FIXME
  const [TYPE, setTYPE] = useState({});
  const [ICON, setICON] = useState({});
  const apField = Field.useField({ values: {} });
  // 查询客预约单号
  const [availableNoList, setAvailableNoList] = useState([]);
  const queryAvailableNo = () => {
    API.queryAvailableNo().then(res => {
      if (res.success) {
        let temp = []
        res.data.map(val => {
          let obj: any = {
            value: val,
            key: val
          }
          temp.push(obj);
        })
        setAvailableNoList(temp);
      } else {
        Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
      }
    })
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
    if (pageType != 2) {
      mockData();
    } else {
      getMonthList();
    }
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
      // if (isPre() <= 0) { // 判断当前周第一天跟当前日期进行对比
      //   return;
      // }
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

  /**
   * 切换月时，记录下当前操作的索引，以当前时间0为准，向前+1，向后-1
   * 重新获取月数和天数
   * @param n 
   */
  const changeMonth = (n) => {
    n ? setInitMonth(initMonth - 1) : setInitMonth(initMonth + 1);
  };

  const Panel = Collapse.Panel;
  const Search = (
    <div className="Search">
      <Collapse>
        <Panel title={`${lang['fb4.appointment.instructions']} / ${lang['fb4.appointment.rules.details']}`} className={styles.collapse}>
          <ul>
            <li>
              <b>1. {lang['fb4.appointment.priority']}：</b>
              <span className="lispan">
                <dt className={styles.rulesDt}>
                  <dl className={styles.rulesDl}><span className={`${styles.shohuobg} ${styles.point}`} /><span>{lang['fb4.reservation']}</span><span>&gt;</span></dl>
                  <dl className={styles.rulesDl}><span className={`${styles.zengzhibg} ${styles.point}`} /><span>{lang['fb4.reservation.value.add']}</span><span>&gt;</span></dl>
                  <dl className={styles.rulesDl}><span className={`${styles.paicangbg} ${styles.point}`} /><span>{lang['fb4.reservation.warehouse.queue']}</span><span>&gt;</span></dl>
                  <dl className={styles.rulesDl}><span className={`${styles.paiduibg} ${styles.point}`} /><span>{lang['fb4.reservation.queue']}</span></dl>
                </dt>
              </span>
            </li>
            <li><b>2. {lang['fb4.reservation']}：</b><span className="lispan">{lang['fb4.reservation.instructions']}</span></li>
            <li><b>3. {lang['fb4.reservation.value.add']}：</b><span className="lispan">{lang['fb4.reservation.value.add.instructions']}</span></li>
            <li><b>4. {lang['fb4.reservation.warehouse.queue']}：</b><span className="lispan">{lang['fb4.reservation.warehouse.queue.instructions']}</span></li>
            <li><b>5. {lang['fb4.reservation.queue']}：</b><span className="lispan">{lang['fb4.reservation.queue.instructions']}</span></li>
            <li><b>6. {lang['fb4.special.reminder']}：</b><span className="lispan">{lang['fb4.special.reminder.instructions']}</span></li>
          </ul>
        </Panel>
      </Collapse>
    </div>
  );

  /**
   * 获取月列表，只查询今天之后的数据
   */
  const getMonthList = () => {
    // let monthStart = moment().subtract(initMonth, 'months').startOf('month').valueOf();
    let data = {
      beginDate: moment().format('YYYY-MM-DD'),
      whetherListQuery: 'Y',
      // endDate: moment().subtract(initMonth, 'months').endOf('month').valueOf(),
      warehouseCode: warehouseCode[0],
      inquiryNumber: apField.getValue('inquiryNumber') ? apField.getValue('inquiryNumber') : ''
    }
    API.getReservationForPanel(data).then(res => {
      if (res.success) {
        if (!res.data || !res.data.length) {
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
        setMonthResult([]);
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
   * 周面板和月面板数据通过2个接口组装，
   * 周列表中没有已经预约过的单号数据，月列表中没有可预约的时间段数据
   */
  const mockData = () => {
    let beginDate, endDate;
    if (pageType == 0) {
      beginDate = moment().add(initWeek, 'week').startOf('week').format('YYYY-MM-DD');
      endDate = moment().add(initWeek, 'week').endOf('week').format('YYYY-MM-DD');
    } else {
      beginDate = moment().subtract(initMonth, 'months').startOf('month').format('YYYY-MM-DD');
      endDate = moment().subtract(initMonth, 'months').endOf('month').format('YYYY-MM-DD')
    }
    let data = {
      warehouseCode: warehouseCode[0],
      beginDate,
      endDate
    }
    Promise.all([
      API.getReservationForPanel(data),
      API.getUnit(data),
    ]).then(res => {
      let appointmentPanelUnitList: any = [], monthList: any = [];
      // 处理月接口
      if (res[0].success && res[0].data && res[0].data.length) {
        monthList = res[0].data.sort((a, b) => {
          return moment(a.appointmentTime).valueOf() - moment(b.appointmentTime).valueOf();
        });
        for (let i = 0; i < monthList.length; i++) {
          let t = monthList[i].reservationTimeClassifyList;
          let d = t.sort((a, b) => {
            return Date.parse('20 Aug 2000 ' + a.actualDate) - Date.parse('20 Aug 2000 ' + b.actualDate)
          });
          monthList[i].reservationTimeClassifyList = d;
        }
      }

      // 处理周接口
      if (res[1].success && res[1].data && res[1].data.appointmentPanelUnitList) {
        appointmentPanelUnitList = res[1].data.appointmentPanelUnitList
        if (!appointmentPanelUnitList.length) {
          setWeekResult({});
          return;
        }
        appointmentPanelUnitList.sort((a, b) => {
          return moment(a.appointmentTime).valueOf() - moment(b.appointmentTime).valueOf()
        });
        // 可能周接口中某一天没有返回时间段
        let notEmptyUnitTypeList = appointmentPanelUnitList.find(v => v.unitTypeList != null && v.unitTypeList.length > 0);
        if (notEmptyUnitTypeList) {
          for (let i in appointmentPanelUnitList) {
            if (!appointmentPanelUnitList[i].unitTypeList) {
              appointmentPanelUnitList[i]['unitTypeList'] = [];
              notEmptyUnitTypeList.unitTypeList.forEach((item, index) => {
                appointmentPanelUnitList[i]['unitTypeList'][index] = { ...item };
              });
              for (let j in appointmentPanelUnitList[i]['unitTypeList']) {
                appointmentPanelUnitList[i]['unitTypeList'][j]["reservationTimeClassifyList"] = [];
              }
            }
          }

          if (monthList.length) { // 遍历月接口
            for (let v in appointmentPanelUnitList) {
              let unitTypeList = appointmentPanelUnitList[v]['unitTypeList'];
              // 2个接口中匹配是否找到同一个的数据
              let obj = monthList.filter(val => val.appointmentTime == appointmentPanelUnitList[v].appointmentTime);
              /**
               * 如果能匹配到：周面板中unitTypeList不为空，则遍历填充单号数据；周面板中unitTypeList为空，则先填充满时间段，再填充单号数据
               * 单号填充规则：最早的丢到最前面，最晚的丢到最后面；如果没有匹配到，也需要填充满时间段数据
               */
              if (obj.length) {
                let timeList = obj[0]['reservationTimeClassifyList']; // 单号
                for (let i = 0; i < timeList.length; i++) {
                  for (let j = 0; j < unitTypeList.length; j++) {
                    unitTypeList[j]['reservationTimeClassifyList'] =
                      unitTypeList[j]['reservationTimeClassifyList'] && unitTypeList[j]['reservationTimeClassifyList'].length ? unitTypeList[j]['reservationTimeClassifyList'] : [];
                    let beginTime = Date.parse('20 Aug 2000 ' + unitTypeList[j].beginTime)
                    let endTime = Date.parse('20 Aug 2000 ' + unitTypeList[j].endTime)
                    let actualDate = Date.parse('20 Aug 2000 ' + timeList[i].actualDate)
                    // 最小， 中间能匹配到， 最大的找不到，就放到最后
                    if (actualDate < beginTime || (actualDate >= beginTime && actualDate < endTime) || (j == unitTypeList.length - 1 && actualDate >= endTime)) { // 最小 unshift
                      unitTypeList[j]['reservationTimeClassifyList'].push(timeList[i]);
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        Message.error(res[1].errors ? res[1].errors[0].errorMsg : res[1].msg);
      }
      setWeekResult({
        ...res[1].data, appointmentPanelUnitList
      });
    });
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
      if (pageType != 2) { // 获取周和月面板        
        mockData();
      } else {
        getMonthList();
      }
    }
  }, [initMonth, initWeek, pageType]);
  useEffect(() => {
    getApponitType();
    queryAvailableNo();
    mounted.current = true;
    if (!warehouseCode.length && whAll.length) {
      setVisible(true)
      return;
    }
  }, []);

  /**
   * 列表，周，月切换清空weekresult数据
   */
  const changeTab = (key) => {
    setWeekResult({});
    setPageType(key * 1);
  }
  const navStyle = {
    textAlign: 'right',
    display: 'inline-block',
    position: 'absolute',
    right: '12px',
    top: '56px'
  }
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
              style={{ width: 160, marginRight: 16 }} />
          </FormItem>
          {pageType != 2 && weekResult.isQueue == 'Y' &&
            <Button type="primary" onClick={() => weekRef.current.changeApVisible(true)}>{TYPE['R']}</Button>}
          {pageType == 2 &&
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
        {pageType == 0 && <>
          <h3>{moment().format('llll')}</h3>
          <div className={styles.calWeek}>
            <span><CustomIcon type="left"
              className={styles.left}
              onClick={() => changeWeek(0)} title={lang['fb4.last.week']} />
            </span>
            <span>{currentWeek} {lang['fb4.week']}</span>
            <span><CustomIcon type="right"
              className={styles.right}
              onClick={() => changeWeek(1)} title={lang['fb4.next.week']} />
            </span>
          </div>
        </>}
        {pageType == 1 && <>
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
        {pageType == 2 && <h3>{PAGE_TYPE[2]}</h3>}
      </div>
    </div>
  );
  const Remark = (
    <div className={styles.remark}>
      <span className={`${styles.appointBlock} ${styles.disabledbg}`}></span><span className={styles.text}>{lang['fb4.no.reservation']}</span>
      <span className={`${styles.appointBlock} ${styles.shohuoBlock}`}></span><span className={styles.text}>{lang['fb4.reservation']}</span>
      <span className={`${styles.appointBlock} ${styles.zengzhiBlock}`}></span><span className={styles.text}>{lang['fb4.reservation.value.add']}</span>
      <span className={`${styles.appointBlock} ${styles.paicangBlock}`}></span><span className={styles.text}>{lang['fb4.reservation.warehouse.queue']}</span>
    </div>
  );
  const Remark2 = (
    <div className={styles.remark}>
      <span className={`${styles.appointBlock} ${styles.disabledbg}`}></span><span className={styles.text}>{lang['fb4.no.reservation']}</span>
      <span className={`${styles.appointBlock} ${styles.primarybg}`}></span><span className={styles.text}>{lang['fb4.can.reservation']}</span>
    </div>
  );

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: lang['fb4.order.iconsignment.reservation'] }, { name: lang['fb4.order.iconsignment.my.reservation'] }]}
      />
      <div className="List">
        {ListHead}
        {pageType == 0 && Remark}
        {pageType == 1 && Remark2}
        <globalContext.Provider value={{
          lang,
          CustomIcon,
          TYPE,
          ICON,
          warehouseCode: warehouseCode[0],
          warehouseName,
          availableNoList,
          lists: weekResult,
          mockData,
          getMonthList
        }}>
          <Tab size="small" shape="wrapped" onChange={changeTab} defaultActiveKey={0} navStyle={navStyle} contentStyle={{ marginTop: 16 }}>
            <Tab.Item title={lang['fpx.list']} key="2">
              {
                pageType == 2 && monthResult.length > 0 &&
                <List
                  list={monthResult} />
              }
            </Tab.Item>
            <Tab.Item title={lang['fb4.week']} key="0">
              {
                pageType == 0 && Object.keys(weekResult).length > 0 &&
                <Week
                  lists={weekResult}
                  initWeek={initWeek} />
              }
            </Tab.Item>
            <Tab.Item title={lang['fb4.month']} key="1">
              {
                pageType == 1 && Object.keys(weekResult).length > 0 &&
                <Month
                  lists={weekResult}
                  initMonth={initMonth}
                  days={days} />
              }
            </Tab.Item>
          </Tab>

          <QueueDialog
            weekRef={weekRef}
            queueNumber={weekResult.queueNumber} />
        </globalContext.Provider>
        {WH_Dialog}
      </div>

      {Search}
    </>
  );
});
