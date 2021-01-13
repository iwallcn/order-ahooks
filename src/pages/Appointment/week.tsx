import React, { useState, useEffect, useContext, useImperativeHandle } from 'react';
import { injectIntl } from 'react-intl';
import { Field, Form, Button, Dialog, Tab, Select, DatePicker, Input, Message } from '@alifd/next';
import moment from 'moment';
import styles from './index.module.scss';
import globalContext from '@/contexts/globalContext';
import API from './api';
import Cookies from 'js-cookie';

const FormItem = Form.Item;

export default injectIntl(({ intl, lists, initWeek, weekRef, warehouseCode, warehouseName, TYPE, ICON, getWeekList }) => {
  const isArrangement = lists.isArrangement;
  const { CustomIcon } = useContext(globalContext);
  const lang = window.GLOBAL_LANG;
  const apField = Field.useField({ values: {} });
  const [appointObj, setAppointObj] = useState({
    appointmentTime: '',
    appointmentType: '',
    beginTime: '',
    endTime: ''
  }); // 当前点击的格子

  const [apVisible, setApVisible] = useState(false); // 预约弹窗
  const [pdVisible, setPdVisible] = useState(false); // 排队弹窗
  const [weekDay, setWeekDay] = useState({}); // 计算每周的日期和星期 {'周日':'12-07', ...}
  const timeNow: any = new Date(); // 当前时间
  const weekOfday: any = moment(timeNow).format('E'); // 计算今天是这周第几天 4
  // 控制排队弹窗
  useImperativeHandle(weekRef, () => ({
    changeApVisible: (newVal) => {
      setPdVisible(newVal);
    }
  }));
  // order；已经过去的日期，就不允许预约了
  const overdue = (d) => {
    return moment().valueOf() - moment(d).valueOf()
  }

  // 查询客预约单号
  const [availableNoList, setAvailableNoList] = useState([]);
  const queryAvailableNo = () => {
    API.queryAvailableNo().then(res => {
      if (res.success) {
        res.data.map(val => {
          let obj = {
            value: val,
            key: val
          }
          availableNoList.push(obj);
        })
        setAvailableNoList(availableNoList);
      } else {
        Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
      }
    })
  }

  // 动态获取第几周的第几天
  const calWeekOfday = (w, d) => {
    return moment().weekday(w * 7 + d).format('MM-DD');
  }

  // 获取周日-周六标题数据
  const calcWeekDay = () => {
    let weekDay = [lang['fb4.html.Sunday'], lang['fb4.html.Monday'], lang['fb4.html.Tuesday'],
    lang['fb4.html.Wednesday'], lang['fb4.html.Thursday'], lang['fb4.html.Friday'], lang['fb4.html.Saturday']];
    let everyWeek = {};
    if (Cookies.get('lang') == 'zh' || Cookies.get('lang') == undefined) {
      console.log(987)
      everyWeek = {
        [weekDay[1]]: calWeekOfday(initWeek, 0),
        [weekDay[2]]: calWeekOfday(initWeek, 1),
        [weekDay[3]]: calWeekOfday(initWeek, 2),
        [weekDay[4]]: calWeekOfday(initWeek, 3),
        [weekDay[5]]: calWeekOfday(initWeek, 4),
        [weekDay[6]]: calWeekOfday(initWeek, 5),
        [weekDay[0]]: calWeekOfday(initWeek, 6)
      }
    } else {
      everyWeek = {
        [weekDay[0]]: calWeekOfday(initWeek, 0),
        [weekDay[1]]: calWeekOfday(initWeek, 1),
        [weekDay[2]]: calWeekOfday(initWeek, 2),
        [weekDay[3]]: calWeekOfday(initWeek, 3),
        [weekDay[4]]: calWeekOfday(initWeek, 4),
        [weekDay[5]]: calWeekOfday(initWeek, 5),
        [weekDay[6]]: calWeekOfday(initWeek, 6)
      }
    }
    let newEveryWeek = {}
    if (!initWeek) { // 只有initWeek=0，才是本周，才有今天
      Object.keys(everyWeek).map((key, index) => {
        let d = Cookies.get('lang') == 'zh' || Cookies.get('lang') == undefined ? weekOfday * 1 - 1 : weekOfday * 1
        if (index === d) {
          newEveryWeek[lang['fb4.date.input.component.today']] = everyWeek[key];
        } else {
          newEveryWeek[key] = everyWeek[key];
        }
      });
    }
    setWeekDay(!initWeek ? newEveryWeek : everyWeek);
  };

  // 渲染周日-周六标题
  const renderWeekDay = () => {
    return (
      <>
        <div className={styles.calTitle}>
          <CustomIcon size="s" type="shijian" className={styles.shijian} />
        </div>
        {
          weekDay && Object.keys(weekDay).map((val, key) => {
            return (
              <div className={styles.calTitle} key={val}>
                <h4 className={`${val === lang['fb4.date.input.component.today'] ? styles.calToday : ''}`}>{val}</h4>
                <h6>{weekDay[val]}</h6>
              </div>
            )
          })
        }
      </>
    )
  };

  /**
   * 获取左侧时间段
   * 从七天中任意找到一天有时间段的拿来作为左侧列
   * 如果七天都没有，则返回空
   */
  const renderTimeSlot = () => {
    let olist = lists.appointmentPanelUnitList;
    let someday: any = [];
    if (olist && olist.length) {
      for (let i = 0; i < olist.length; i++) {
        if (olist[i].unitTypeList && olist[i].unitTypeList.length) {
          someday = olist[i].unitTypeList;
          break;
        }
      }
    }
    if (someday.length) {
      let temp: any = [];
      for (let i = 0; i < someday.length; i++) {
        temp.push(someday[i].beginTime);
      }
      temp = temp.sort();
      return Object.keys(temp).map((k, i) => {
        return (
          <div className={styles.calCol} key={i}>{temp[k]}</div>
        )
      });
    } else {
      return '';
    }
  }

  /**
   * 渲染七天所有格子: 纵向一条一条的遍历
   * 1.先根据isArrangement判断是否排仓，如果是排仓Y，
   *      则一周面板的最底部一行全部显示排仓，其他格子全部都是约满
   * 2.再根据isQueue判断是否排队，如果是排队，则其他格子全部都是约满，然后排队按钮可用
   * 3.如果上面两个字段都是N，则正常遍历
   */
  const renderCol = () => {
    return Object.keys(lists['appointmentPanelUnitList']).map((key, index) => {
      const obj = lists['appointmentPanelUnitList'][key];
      // 已经过去的日期，不包含今天
      if (overdue(obj.appointmentTime) >= 0 && obj.appointmentTime != moment().format('YYYY-MM-DD')) {
        return (
          <div className={styles.calCol} key={key}>
            { renderNoAppointment(lists['appointmentPanelUnitList'], obj, 1)}
          </div>
        )
      } else {
        if (lists.isArrangement == 'Y') { // 排仓遍历
          return (
            <div className={styles.calCol} key={key}>
              {/* {index == 0 && renderNoAppointment(obj, 1)}
              {index != 0 && renderPaicang(obj)} */}
              {renderPaicang(lists['appointmentPanelUnitList'], obj)}
            </div>
          );
        } else if (lists.isQueue == 'Y') { // 排队遍历
          return (
            <div className={styles.calCol} key={key}>
              {index == 6 && renderNoAppointment(lists['appointmentPanelUnitList'], obj, 0)}
              {index != 6 && renderNoAppointment(lists['appointmentPanelUnitList'], obj, 1)}
            </div>
          );
        } else {
          return (
            <div className={styles.calCol} key={key}>
              {renderCell(lists['appointmentPanelUnitList'], obj)}
            </div>
          );
        }
      }
    });
  };

  // 渲染不可预约和排仓情况
  const renderNoAppointment = (unitList, obj, type) => {
    let str = type ? lang['fb4.no.reservation'] : lang['fb4.reservation.full'];
    let tempTime: any = [];
    for (let i = 0; i < unitList.length; i++) {
      if (unitList[i].unitTypeList && unitList[i].unitTypeList.length) {
        tempTime = unitList[i].unitTypeList;
      }
    }
    return Object.keys(tempTime).map(val => {
      return <div className={`${styles.calCell} ${styles.full}`} key={val}>{str}</div>
    });
  }

  // 渲染排仓 TODO
  const renderPaicang = (unitList, obj) => {
    let list = obj.unitTypeList;

    // 取得任意一个天不为空的时间段
    let tempTime: any = [];
    for (let i = 0; i < unitList.length; i++) {
      if (unitList[i].unitTypeList && unitList[i].unitTypeList.length) {
        tempTime = unitList[i].unitTypeList;
        break;
      }
    }
    return Object.keys(tempTime).map((val, index) => {
      // 如果日期大于最远日期，或者某一天设置了不可预约
      if (moment(obj.appointmentTime).valueOf() - moment(lists.maxReservationTime).valueOf() > 0 || obj.isAppointment == 'N') {
        return <div className={`${styles.calCell} ${styles.full}`} key={index}>{lang['fb4.no.reservation']}</div>
      } else {
        if (index < tempTime.length - 1) { // 排满
          return <div className={`${styles.calCell} ${styles.full}`} key={Math.random()}>{lang['fb4.reservation.full']}</div>
        } else { // 最后一个格子是排仓
          return (
            <div className={`${styles.calCell}`} key={index}>
              <h6>{lang['fb4.free']}</h6>
              <Button className={styles.btn} onClick={() => handleAppointDialog(obj.appointmentTime, list ? list[index] : tempTime[index])}>
                <CustomIcon type="paicang" size="S" className={`${styles.paicang} ${styles.iconbg}`} />
                {TYPE['W']}
              </Button>
            </div>
          )
        }
      }
    });
  };

  // 普通情况：遍历每列的格子
  const renderCell = (unitList, obj) => {
    // 取得任意一个天不为空的时间段
    let tempTime: any = [];
    for (let i = 0; i < unitList.length; i++) {
      if (unitList[i].unitTypeList && unitList[i].unitTypeList.length) {
        tempTime = unitList[i].unitTypeList;
        break;
      }
    }
    if (obj.isAppointment == 'N') { // 不可预约
      return Object.keys(tempTime).map((val, index) => {
        return <div className={`${styles.calCell} ${styles.full}`} key={index}>{lang['fb4.no.reservation']}</div>
      });
    } else {
      return Object.keys(obj.unitTypeList).map((val, index) => {
        let item = obj.unitTypeList ? obj.unitTypeList[index] : {};
        let appointmentType = item.appointmentType;
        if (item.appointmentType == 'E') { // 表示这个格子约满
          return <div className={`${styles.calCell} ${styles.full}`} key={index}>{lang['fb4.reservation.full']}</div>
        } else {
          return (
            <div className={`${styles.calCell}`} key={index}>
              <h6>{lang['fb4.free']}</h6>
              <Button className={styles.btn} onClick={() => handleAppointDialog(obj.appointmentTime, item)}>
                <CustomIcon type="shohuo" size="S" className={`${styles[ICON[appointmentType]]} ${styles.iconbg}`} />
                {TYPE[appointmentType]}
              </Button>
            </div>
          )
        }
      });
    }
  }
  const disabledDate = (date, view) => {
    // 当前切换周的最后一天
    // let currentDate: any = moment().add(initWeek, 'week').endOf('week');
    const currentDate = moment();
    switch (view) {
      case 'date':
        return date.valueOf() < currentDate.valueOf();
      case 'year':
        return date.year() < currentDate.year();
      case 'month':
        return date.year() * 100 + date.month() < currentDate.year() * 100 + currentDate.month();
      default: return false;
    }
  }
  // 点击预约按钮
  const handleAppointDialog = (appointmentTime, item) => {
    console.log(appointmentTime, item)
    if (isArrangement == 'Y') { // 排仓
      setAppointObj({ ...item, appointmentTime, appointmentType: 'W' });
    } else {
      setAppointObj({ ...item, appointmentTime });
    }
    setApVisible(true);
  }

  // 点击确认预约
  const submitOK = (type) => {
    apField.validate((errors, values) => {
      if ((!values['consignmentNos'] && !values['cmlNo']) || (values['consignmentNos'] && values['cmlNo'])) {
        return Message.warning(lang['fb4.only.cabinet.ic']);
      }
      let arr: any = []
      if (values['consignmentNos']) {
        arr = values['consignmentNos'].split(/\n/);
        for (let v in arr) {
          arr[v] = arr[v].trim();
        }
      }
      let data: any = {
        consignmentNos: values['consignmentNos'] ? arr : '',
        cmlNo: values['cmlNo'],
        toWarehouseCode: warehouseCode
      }
      if (type == 'P') { // 普通预约
        data.actualDate = moment(appointObj.appointmentTime).add(appointObj.beginTime, 'h').format('YYYY-MM-DD HH:mm');
        data.reservationType = appointObj.appointmentType;
        API.confirm(data).then(res => {
          if (res.success) {
            getWeekList();
            Dialog.confirm({
              title: lang['fb4.reminder'],
              content: res.msg,
              footerActions: [],
              onClose: () => setApVisible(false),
              onCancel: () => console.log('onCancel')
            });
          } else {
            Dialog.confirm({
              title: lang['fb4.reminder'],
              content: res.errors ? res.errors[0].errorMsg : res.msg,
              footerActions: [],
              onCancel: () => console.log('onCancel')
            });
          }
        });
      } else { // 排队预约
        data.actualDate = values['actualDate'];
        API.queue(data).then(res => {
          if (res.success) {
            getWeekList();
            Dialog.confirm({
              title: lang['fb4.reminder'],
              content: res.msg,
              footerActions: [],
              onClose: () => setPdVisible(false),
              onCancel: () => console.log('onCancel')
            });
          } else {
            Dialog.confirm({
              title: lang['fb4.reminder'],
              content: res.errors ? res.errors[0].errorMsg : res.msg,
              footerActions: [],
              onCancel: () => console.log('onCancel')
            });
          }
        })
      }
    });
  };

  // 排队预约弹出框
  const PD_Dialog = (
    <Dialog className={styles.whDialog}
      title={TYPE['R']}
      visible={pdVisible}
      onOk={() => submitOK('R')}
      onCancel={() => setPdVisible(false)}
      onClose={() => setPdVisible(false)}>
      <Form field={apField} labelAlign="left">
        <div className={styles.apDr}>
          <span>{lang['fb4.this.time.full']}</span>
        </div>
        <div className={styles.apDr}>
          <CustomIcon type="cangku" size="s" />
          {lang['fb4.warehouse']}: <span>{warehouseName}-{warehouseCode}</span>
          <span className={styles.numbers}>{lang['fb4.current.queue.number']}：{lists.queueNumber}</span>
        </div>
        <div className={styles.apDr}>
          <FormItem required>
            <DatePicker style={{ width: '100%' }} label={lang['fb4.expected.delivery.time']} name="actualDate" disabledDate={disabledDate} />
          </FormItem>
        </div>
        <Tab shape="wrapped" size="small">
          <Tab.Item title={lang['fb4.cml.no']} key="1">
            <FormItem required>
              <Select.AutoComplete
                style={{ width: '100%' }}
                name="cmlNo"
                placeholder={lang['fb4.select.cabinet.tip']}
                hasClear
                dataSource={availableNoList} />
            </FormItem>
          </Tab.Item>
          <Tab.Item title={lang['fb4.consignmentNo']} key="2">
            <FormItem required >
              <Input.TextArea name="consignmentNos"
                autoHeight={{ minRows: 3, maxRows: 6 }}
                style={{ width: '100%' }}
                placeholder={lang['fb4.select.ic.tip']} />
            </FormItem>
          </Tab.Item>
        </Tab>
      </Form>
    </Dialog>
  );

  // 预约弹出框
  const AP_Dialog = (
    <Dialog className={styles.whDialog}
      title={TYPE[appointObj.appointmentType]}
      visible={apVisible}
      onOk={() => submitOK('P')}
      onCancel={() => setApVisible(false)}
      onClose={() => setApVisible(false)}>
      <Form field={apField} labelAlign="left">
        {appointObj.appointmentType == 'W' &&
          <div className={styles.apDr}>
            <span>{lang['fb4.period.full.tip']}</span>
          </div>
        }
        {appointObj.appointmentType == 'V' &&
          <div className={styles.apDr}>
            <span>{lang['fb4.current.booking.tip']}</span>
          </div>
        }
        <div className={styles.apDr}>
          <CustomIcon type="cangku" size="s" />
          {lang['fb4.warehouse']}: <span>{warehouseName}-{warehouseCode}</span>
        </div>
        <div className={styles.apDr}>
          <CustomIcon type="shijian" size="s" />
          {lang['fb4.receiving.time']}: <span>{appointObj.appointmentTime} {appointObj.beginTime}</span>
          {
            lists.queueNumber > 0 &&
            <span className={styles.numbers}>{lang['fb4.current.warehouse.queue.number']}：{lists.queueNumber}</span>
          }
        </div>
        <Tab shape="wrapped" size="small">
          <Tab.Item title={lang['fb4.cml.no']} key="1">
            <FormItem required>
              <Select.AutoComplete
                style={{ width: '100%' }}
                name="cmlNo"
                placeholder={lang['fb4.select.cabinet.tip']}
                hasClear
                dataSource={availableNoList} />
            </FormItem>
          </Tab.Item>
          <Tab.Item title={lang['fb4.consignmentNo']} key="2">
            <FormItem required >
              <Input.TextArea name="consignmentNos"
                autoHeight={{ minRows: 3, maxRows: 6 }}
                style={{ width: '100%' }}
                placeholder={lang['fb4.select.ic.tip']} />
            </FormItem>
          </Tab.Item>
        </Tab>
      </Form>
    </Dialog>
  );

  /**
   * 加载当前客户的所有柜号
   * 获取周日-周六标题数据
   */
  useEffect(() => {
    if (!availableNoList.length) {
      queryAvailableNo();
    }
    calcWeekDay();
  }, [initWeek]);

  return (
    <>
      <div className={styles.calContent}>
        <div className={styles.calHeader}>
          {renderWeekDay()}
        </div>

        <div className={styles.calBody}>
          <div className={styles.calLeft}>
            {renderTimeSlot()}
          </div>
          <div className={styles.calRight}>
            {renderCol()}
            {/* <div className={styles.calCol}>
                <div className={`${styles.calCell} ${styles.full}`}>不可预约</div>
              </div>
              <div className={styles.calCol}>2</div>
              <div className={styles.calCol}>3</div>
              <div className={styles.calCol}>4</div>
              <div className={styles.calCol}>5</div>
              <div className={styles.calCol}>6</div>
              <div className={styles.calCol}>7</div> */}

            {/* <div className={`${styles.calCell} ${styles.full}`}>不可预约</div>
              <div className={`${styles.calCell} `}>
                <h6>我已预约</h6>
                <h5>4</h5>
                <Button className={styles.btn}>icon 收货预约</Button>
              </div>
              <div className={`${styles.calCell} `}>
                <h6>我已预约</h6>
                <h5>4</h5>
                <Button className={styles.btn}>icon 增值预约</Button>
              </div>
              <div className={styles.calCell}>
                <h6>我已预约</h6>
                <h5>4</h5>
              </div>
              <div className={`${styles.calCell} ${styles.full} `}>约满</div>
              <div className={`${styles.calCell} ${styles.pd} `}>
                <h6>排队预约</h6>
                <h5>1</h5>
              </div>
              <div className={`${styles.calCell} ${styles.full} `}>约满</div>
              <div className={`${styles.calCell} ${styles.full} `}>不可预约</div>
              <div className={`${styles.calCell} ${styles.kx} `}>
                <h6>空闲</h6>
                <Button className={styles.btn}>icon 收货预约</Button>
              </div> */}
          </div>
        </div>
      </div>
      {AP_Dialog}
      {PD_Dialog}
    </>
  );
});
