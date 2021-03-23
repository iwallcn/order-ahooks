import React, { useState, useEffect, useContext, useRef } from 'react';
import { injectIntl } from 'react-intl';
import { Dialog } from '@alifd/next';
import moment from 'moment';
import styles from './index.module.scss';
import globalContext from '@/contexts/globalContext';
import Cookies from 'js-cookie';
import CmlNoInput from './cmlNoInput';
import DialogAppoint from './dialogAppoint';

export default injectIntl(({ intl, lists, initWeek }) => {
  console.log(lists, '周面板组装数据')
  const weekRef: any = useRef();
  const { CustomIcon, ICON } = useContext(globalContext);
  const cmlNoRef: any = useRef(null);
  const isArrangement = lists.isArrangement;
  const lang = window.GLOBAL_LANG;
  const [appointObj, setAppointObj] = useState({
    appointmentTime: '',
    appointmentType: '',
    beginTime: '',
    endTime: ''
  }); // 当前点击的格子

  const [weekDay, setWeekDay] = useState({}); // 计算每周的日期和星期 {'周日':'12-07', ...}
  const timeNow: any = new Date(); // 当前时间
  const weekOfday: any = moment(timeNow).format('E'); // 计算今天是这周第几天 4

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
          {lists.isQueue == 'Y' && lang['fb4.reservation.full']}
          {lists.isQueue == 'N' && <CustomIcon size="s" type="shijian" className={styles.shijian} />}
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
   * 不可预约判断包含：日期是否已经过期，日期是否设置了不可预约，日期是否大于最远日期
   */
  const renderCol = () => {
    return Object.keys(lists['appointmentPanelUnitList']).map(index => {
      let appointmentPanelUnitList = lists['appointmentPanelUnitList'], obj = appointmentPanelUnitList[index], unitTypeList = obj.unitTypeList;
      let disable = lists['appointmentPanelUnitList'][index]['isAppointment'] == 'N' ||
        moment(obj.appointmentTime).startOf('day').valueOf() > moment(lists.maxReservationDate).startOf('day').valueOf();

      // 取得任意一个天不为空的时间段
      let tempTime: any = [];
      for (let i = 0; i < appointmentPanelUnitList.length; i++) {
        if (appointmentPanelUnitList[i].unitTypeList && appointmentPanelUnitList[i].unitTypeList.length) {
          tempTime = appointmentPanelUnitList[i].unitTypeList;
          break;
        }
      }
      let mapArr = unitTypeList ? unitTypeList : tempTime;
      if (lists.isArrangement == 'Y') { // 排仓遍历
        return (
          <div className={styles.calCol} key={index}>
            {renderPaicang(obj, mapArr, disable)}
          </div>
        );
      } else if (lists.isQueue == 'Y') { // 排队遍历
        return (
          <div className={styles.calCol} key={index}>
            {renderQueue(obj, mapArr)}
          </div>
        );
      } else {
        return (
          <div className={styles.calCol} key={index}>
            {renderCell(obj, mapArr, disable)}
          </div>
        );
      }
    });
  };

  /**
   * * 排仓情况：
   *  如果日期比今天小，或者该日期设置了不可预约，则灰色显示，无排仓按钮，单号显示同下；
      如果日期是今天之后包含今天，并且日期在最远可约日期范围内，则蓝色显示，有排仓按钮，单号显示同下；
      单号显示规则：有单号则显示单号，单号最多显示2行，超过采用还有xx项；
      点击每个单号显示单号，可以换柜和取消；点击还有XX项，则显示所有单号，可以换柜和取消。
   * @param obj  某一天的数据
   * @param mapArr  一天中的时间段集合
   * @param disable  该天是否可预约
   */
  const renderPaicang = (obj, mapArr, disable) => {
    return Object.keys(mapArr).map((val, index) => {
      let item = mapArr[index], appointmentType = item.appointmentType, reservationTimeClassifyList = item.reservationTimeClassifyList;
      // 排仓有数据的情况下：先判断外层类型，然后再判断是否可以排仓预约
      if (reservationTimeClassifyList) {
        let count = computeCml(reservationTimeClassifyList);
        if (disable || index < mapArr.length - 1) { // 如果已经过期或者设置了不可预约，或者不是一列的最后一个格子,则只显示单号
          return (
            <div className={`${styles.calCell} ${styles.full}`} key={index}>
              {reservationTimeClassifyList && renderCml(obj.appointmentTime, reservationTimeClassifyList, count)}
            </div>
          )
        } else { // 显示单号并且有排仓按钮
          return (
            <div className={`${styles.calCell} ${styles['E']}`} key={index} onClick={() => handleAppointDialog(obj.appointmentTime, item)}>
              {reservationTimeClassifyList && renderCml(obj.appointmentTime, reservationTimeClassifyList, count)}
            </div>
          )
        }
      } else {
        // 排仓没有数据的情况：判断是否是过去的日期，并且是否遵循规则：最底部都是预约
        if (disable || index < mapArr.length - 1) { // 如果已经过期或者设置了不可预约
          return <div className={`${styles.calCell} ${styles.full}`} key={Math.random()}></div>
        } else { // 没有过期，判断是否是当天最后一个，最后一个要出现排仓按钮，非最后一个全部灰色背景
          return <div className={`${styles.calCell} ${styles['E']}`} key={index} onClick={() => handleAppointDialog(obj.appointmentTime, item)} />
        }
      }
    });
  };

  /**
   *  * 排队情况：
   *  每个格子都是灰色，没有按钮；有单号就显示
   * @param obj 
   * @param mapArr 
   */
  const renderQueue = (obj, mapArr) => {
    return Object.keys(mapArr).map(index => {
      let item = mapArr[index], reservationTimeClassifyList = item.reservationTimeClassifyList;
      if (reservationTimeClassifyList) {
        let count = computeCml(reservationTimeClassifyList);
        return (
          <div className={`${styles.calCell} ${styles.full}`} key={index}>
            {reservationTimeClassifyList && renderCml(obj.appointmentTime, reservationTimeClassifyList, count)}
          </div>
        )
      } else {
        return <div className={`${styles.calCell} ${styles.full}`} key={index}></div>
      }
    });
  }

  /**
   * 普通情况：
   *  如果日期比今天小，或者该日期设置了不可预约，则灰色显示，无按钮，单号显示同上；
      如果日期是今天之后包含今天，并且日期在最远可约日期范围内，则蓝色显示，有按钮（根据类型来判断是什么预约按钮），单号显示同上；
      单号显示规则：有单号则显示单号，单号最多显示2行，超过采用还有xx项；
      点击每个单号显示单号，可以换柜和取消；点击还有XX项，则显示所有单号，可以换柜和取消。
   */
  const renderCell = (obj, mapArr, disable) => {
    // console.log(obj, mapArr, disable)
    return Object.keys(mapArr).map((val, index) => {
      let item = mapArr[index], appointmentType = item.appointmentType, reservationTimeClassifyList = item.reservationTimeClassifyList;
      // 如果有数据，是满并且不可约，则灰色背景展示数据；不是满，则展示单号可点击格子
      if (reservationTimeClassifyList) {
        let count = computeCml(reservationTimeClassifyList);
        if (appointmentType == 'E' || disable) {
          return (
            <div className={`${styles.calCell} ${styles.full}`} key={index}>
              {reservationTimeClassifyList && renderCml(obj.appointmentTime, reservationTimeClassifyList, count)}
            </div>
          )
        } else {
          return (
            <div className={`${styles.calCell} ${styles[appointmentType]}`} key={index} onClick={() => handleAppointDialog(obj.appointmentTime, item)}>
              {reservationTimeClassifyList && renderCml(obj.appointmentTime, reservationTimeClassifyList, count)}
            </div>
          )
        }
      } else { // 没有数据的情况下：先判断外层类型，然后再判断是否可以预约
        if (appointmentType == 'E' || disable) {
          return <div className={`${styles.calCell} ${styles.full}`} key={index}></div>
        } else {
          return <div className={`${styles.calCell} ${styles[appointmentType]}`} key={index} onClick={() => handleAppointDialog(obj.appointmentTime, item)} />
        }
      }
    });
  }

  // 计算每天每个格子有多少个单号数量
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
  // 点击单行或者还有XX项，弹窗
  const [iscml, setIscml] = useState(false);
  const [reservationTimeClassifyList, setReservationTimeClassifyList] = useState([]);
  const [cmlObj, setCmlObj] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [type, setType] = useState('');
  /**
   * 当前天， 当前时间段的list为了方便取时间点，当前点击数据项，当前点击的是几条索引
   * 2021-01-24 [{},{}], {}, R, 0
   */
  const editCmlSingle = (appointmentTime, reservationTimeClassifyList, obj, k, i) => {
    setAppointmentTime(appointmentTime);
    setReservationTimeClassifyList(reservationTimeClassifyList);
    setCmlObj(obj);
    setType(k);
    setIscml(true)
  }
  // 关闭
  const closeEditDialog = () => {
    setIscml(false)
    cmlNoRef.current.changeDisabled();
  };
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
   * 当前天， 当前时间段的list，为了方便取时间点，当前时间点总共有多少条数据，当前点击的是几条
   * @param appointmentTime 
   * @param reservationTimeClassifyList 
   * @param count 
   * @param i 
   */
  const renderCml = (appointmentTime, reservationTimeClassifyList, count) => {
    if (reservationTimeClassifyList == undefined || !reservationTimeClassifyList.length) {
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
                editCmlSingle(appointmentTime, reservationTimeClassifyList, mapList[v][k], v, i)
              }}>
                <span className={`${styles.point} ${styles[color]}`}></span>
                <span className={styles.cmlOverflow} title={_cml}>{_cml}</span>
              </div>
            )
          } else if (start == 2) {
            start++;
            return <div className={styles.cml} key={i} onClick={(e) => {
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

  // 点击预约按钮
  const handleAppointDialog = (appointmentTime, item) => {
    if (isArrangement == 'Y') { // 排仓
      setAppointObj({ ...item, appointmentTime, appointmentType: 'W' });
    } else {
      setAppointObj({ ...item, appointmentTime });
    }
    weekRef.current.changeApVisible(true)
  }

  /**
   * 加载当前客户的所有柜号
   * 获取周日-周六标题数据
   */
  useEffect(() => {
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
          </div>
        </div>
      </div>

      <DialogAppoint
        queueNumber={lists.queueNumber}
        appointObj={appointObj}
        weekRef={weekRef} />

      {EDIT_Dialog()}
    </>
  );
});
