import React, { useState, useEffect, useContext, useRef } from 'react';
import { injectIntl } from 'react-intl';
import { Dialog, Input } from '@alifd/next';
import moment from 'moment';
import styles from './index.module.scss';
import globalContext from '@/contexts/globalContext';
import CmlNoInput from './cmlNoInput';
import DialogAppointMonth from './dialogAppointMonth';

export default injectIntl(({ intl, lists, initMonth, days }) => {
  console.log(lists, '月面板组装数据')
  const { ICON } = useContext(globalContext);
  const weekRef: any = useRef();
  const [currentCell, setCurrentCell] = useState('');
  const cmlNoRef: any = useRef(null);
  const lang = window.GLOBAL_LANG;
  // 计算每个月的第一天是周几
  const getGutter = (n) => {
    return moment().subtract(n, 'months').startOf("month").day()
  }

  // 渲染周日-周六标题
  const renderWeekDay = () => {
    let weekDay = [lang['fb4.html.Sunday'], lang['fb4.html.Monday'], lang['fb4.html.Tuesday'],
    lang['fb4.html.Wednesday'], lang['fb4.html.Thursday'], lang['fb4.html.Friday'], lang['fb4.html.Saturday']];
    return (
      <>
        {
          Object.keys(weekDay).map((val, key) => {
            return (
              <div className={styles.calTitle} key={val}>
                <h4>{weekDay[val]}</h4>
              </div>
            )
          })
        }
      </>
    )
  };

  // 点击某天格子
  const showAppointDialog = (date) => {
    setCurrentCell(date);
    weekRef.current.changeApVisible(true)
  }

  /**
   * 遍历每列的格子
   * 并且算出每个月月初之前的日期，和月末之后的日期
   *    判断小于当前日期的都不能预约，但需要展示单号
   *    大于的得判断最远日期
   * 并且高亮今天
   */
  const renderCol = () => {
    let temp: any = [];
    let start = getGutter(initMonth);
    let preMonthDay = moment().subtract(initMonth + 1, 'months').daysInMonth();
    if (start > 0) { // 0 周日
      for (let j = preMonthDay - start + 1; j <= preMonthDay; j++) {
        temp.push(
          <div className={`${styles.calCell} ${styles.disabledCell}`} key={Math.random()}>
            <h4 className={styles.disabled}>{j}</h4>
          </div>
        )
      }
    }
    /**
     * 遍历一个月的每天，并且判断每个日期是否可约: 排队情况：都不可约；排仓情况和普通一样
     * 灰色格子不能点击的情况：排队，日期大于最远可约日期，过期的日期，设置了不可预约
     */
    let _today = moment().format('YYYY-MM-DD');
    for (let i = 0; i < lists.appointmentPanelUnitList.length; i++) {
      let date = lists.appointmentPanelUnitList[i].appointmentTime;
      let appointList = lists['appointmentPanelUnitList'][i]
      let disabledStatus = false
      if (lists.isArrangement === 'Y') {
        disabledStatus = false
      } else {
        let compareList = appointList['unitTypeList']
        disabledStatus = !compareList.some(item => {
          return item.appointmentType !== 'E'
        })
      }
      if (appointList['isAppointment'] == 'N') {
        disabledStatus = true
      }
      let unavailable = moment(date).startOf('day').valueOf() < moment().startOf('day').valueOf() || disabledStatus;
      // let unavailable = lists['appointmentPanelUnitList'][i]['isAppointment'] == 'N';
      let disable = lists.isQueue == 'Y' || moment(date).startOf('day').valueOf() > moment(lists.maxReservationDate).startOf('day').valueOf() || unavailable;
      let html = (
        <div className={`${styles.calCell} ${disable ? styles.disabledCell : styles.blueCell} ${date == _today ? styles.today : ''}`} key={i}
          onClick={disable ? () => { } : () => showAppointDialog(date)}>
          <h4>{i + 1}</h4>
          <Input value={date} htmlType="hidden" />
          <div className={styles.calCmls}>
            {renderCell(lists, i)}
          </div>
        </div>
      )
      temp.push(html);
    }

    let end = getGutter(initMonth - 1);
    if (end <= 6 && end > 0) {
      for (let k = 1; k <= 6 - end + 1; k++) {
        temp.push(
          <div className={`${styles.calCell} ${styles.disabledCell}`} key={Math.random()}>
            <h4 className={styles.disabled}>{k}</h4>
          </div>
        )
      }
    }
    return temp;
  }
  // 计算每天每个格子有多少项
  const computeCml = (reservationTimeClassifyList) => {
    let count = 0;
    if (!reservationTimeClassifyList || !reservationTimeClassifyList.length) {
      return 0;
    }
    for (let i = 0; i < reservationTimeClassifyList.length; i++) {
      let map = reservationTimeClassifyList[i]['reservationTypeMap'];
      Object.keys(map).map(v => {
        count += map[v].length;
      })
    }
    return count;
  }
  /**
   * 格子显示：类型点+时间+单号（2行+还有XX）
   */
  const renderCell = (lists, i) => {
    let unitList = lists['appointmentPanelUnitList'], item = unitList[i];
    let { appointmentTime, unitTypeList } = item;
    // 取得任意一个天不为空的时间段
    let tempTime: any = [];
    for (let i = 0; i < unitList.length; i++) {
      if (unitList[i].unitTypeList && unitList[i].unitTypeList.length) {
        tempTime = unitList[i].unitTypeList;
        break;
      }
    }
    let reservationTimeClassifyList: any = [];
    Object.keys(unitTypeList ? unitTypeList : tempTime).map((val, index) => {
      let _unitTypeList: any = unitTypeList ? unitTypeList[index] : {};
      let arr: any = _unitTypeList.reservationTimeClassifyList && _unitTypeList.reservationTimeClassifyList.length ? _unitTypeList.reservationTimeClassifyList : ''
      arr && reservationTimeClassifyList.push(...arr);
    });
    if (reservationTimeClassifyList.length) {
      let count = computeCml(reservationTimeClassifyList);
      return reservationTimeClassifyList && renderCml(appointmentTime, reservationTimeClassifyList, count)
    }
  };
  /**
   * 当前天， 当前时间段的list，为了方便取时间点，当前时间点总共有多少条数据，当前点击的是几条
   * @param appointmentTime 
   * @param reservationTimeClassifyList 
   * @param count 
   * @param i 
   */
  const renderCml = (appointmentTime, reservationTimeClassifyList, count) => {
    if (!reservationTimeClassifyList || !reservationTimeClassifyList.length) {
      return ''
    }
    let start = 0;
    return Object.keys(reservationTimeClassifyList).map((v, i) => {
      let mapList = reservationTimeClassifyList[v].reservationTypeMap;
      return Object.keys(mapList).map((v, index) => {
        let color = `${ICON[v]}bg`;
        return Object.keys(mapList[v]).map((k, i) => {
          if (start < 2) {
            start++;
            let _cml = mapList[v][k].cmlNo || mapList[v][k].deliveryCode;
            return (
              <div className={styles.cml} key={i} onClick={(e) => {
                e.stopPropagation();
                editCmlSingle(appointmentTime, reservationTimeClassifyList, mapList[v][k], v, i);
              }}>
                <span className={`${styles.point} ${styles[color]}`}></span>
                <span title={_cml} className={styles.cmlOverflow}>{_cml}</span>
              </div>
            )
          } else if (start == 2) {
            start++;
            return <div className={styles.cmlmore} key={i}
              onClick={(e) => {
                e.stopPropagation();
                editCmlSingle(appointmentTime, reservationTimeClassifyList, '', v, i)
              }}>{lang['fpx.also']}{count - start + 1}{lang['fpx.item']}</div>
          } else {
            return ''
          }
        })
      })
    })
  }

  // 关闭
  const closeEditDialog = () => {
    setIscml(false);
    cmlNoRef.current.changeDisabled();
  };

  // 点击单行或者还有XX项，弹窗
  const [iscml, setIscml] = useState(false);
  const [reservationTimeClassifyList, setReservationTimeClassifyList] = useState([]);
  const [cmlObj, setCmlObj] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [type, setType] = useState('');
  /**
   * 当前天， 当前时间段的list为了方便取时间点，当前点击数据项，当前点击的是几条索引
   */
  const editCmlSingle = (appointmentTime, reservationTimeClassifyList, obj, k, i) => {
    setType(k);
    setIscml(true)
    setReservationTimeClassifyList(reservationTimeClassifyList);
    setCmlObj(obj);
    setAppointmentTime(appointmentTime);
  }

  const EDIT_Dialog = () => {
    return (
      <Dialog
        style={{ width: 300 }}
        title={appointmentTime}
        visible={iscml}
        footerActions={[]}
        onCancel={() => setIscml(false)}
        onClose={() => setIscml(false)}>
        {cmlObj &&
          <>
            <div className={styles.cml}>
              <CmlNoInput
                ICON={ICON}
                type={type}
                cmlNoRef={cmlNoRef}
                data={cmlObj}
                setIscml={setIscml}
                closeEditDialog={closeEditDialog}
              />
            </div>
          </>
        }
        {!cmlObj &&
          <>
            {
              Object.keys(reservationTimeClassifyList).map(i => {
                let map = reservationTimeClassifyList[i]['reservationTypeMap'];
                return Object.keys(map).map((k, i) => {
                  return Object.keys(map[k]).map((j, index) => {
                    return (
                      <div className={styles.cml} key={j}>
                        <CmlNoInput
                          ICON={ICON}
                          type={k}
                          cmlNoRef={cmlNoRef}
                          data={map[k][j]}
                          setIscml={setIscml}
                          closeEditDialog={closeEditDialog}
                        />
                      </div>
                    )
                  })
                })
              })
            }
          </>
        }
      </Dialog>
    )
  }
  /**
   * 每次标记的起始数改变之后，都会重新计算
   * 设置月份数
   * 设置该月的天数
   * 重新渲染格子
   */
  useEffect(() => {
    renderCol();
  }, [initMonth]);

  return (
    <>
      <div className={styles.calContent}>
        <div className={styles.calHeaderM}>
          {renderWeekDay()}
        </div>

        <div className={styles.calBodyM}>
          {renderCol()}
        </div>
      </div>

      <DialogAppointMonth
        queueNumber={lists.queueNumber}
        date={currentCell}
        weekRef={weekRef} />

      {EDIT_Dialog()}
    </>
  );
});
