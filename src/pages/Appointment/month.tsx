import React, { useState, useEffect, useRef } from 'react';
import { injectIntl } from 'react-intl';
import { Input } from '@alifd/next';
import moment from 'moment';
import styles from './index.module.scss';
import CmlNoInput from './cmlNoInput';
import { CustomIcon } from '@/components/Iconfont';

export default injectIntl(({ intl, list, initMonth, days, TYPE, ICON }) => {
  const cmlNoRef: any = useRef(null);
  const [isShow, setIsShow] = useState(false); // 修改预约弹窗
  const [chkItems, setChkItems] = useState([]); // 点击选中类型的所有柜号
  const [chkType, setChkType] = useState(''); // 点击选中的类型
  const [client, setclient] = useState({ X: 0, Y: 0 });
  const lang = window.GLOBAL_LANG;
  // 计算每个月的第一天是周几
  const getGutter = (n) => {
    return new Date(moment().subtract(n, 'months').format('YYYY-MM')).getDay();
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

  /**
   * 遍历每列的格子
   * 并且算出一个月前后格子日期填充
   * 并且高亮今天
   */
  const renderCell = () => {
    let temp: any = [];
    let start = getGutter(initMonth);
    let preMonthDay = moment().subtract(initMonth + 1, 'months').daysInMonth();
    if (start > 0) {
      for (let j = preMonthDay - start + 1; j <= preMonthDay; j++) {
        temp.push(
          <div className={styles.calCell} key={Math.random()}>
            <h4 className={styles.disabled}>{j}</h4>
          </div>
        )
      }
    }
    for (let i = 1; i <= days; i++) {
      // 记录下切换月份的起始第一天时间节点
      var date = moment(new Date()).startOf('month').subtract(initMonth, 'month').add(i - 1, 'day').format("YYYY-MM-DD");
      let isToday = !initMonth && moment().get('date') == i;
      let items = list.filter(val => val.appointmentTime === date); // 匹配到的某一天数据
      if (items && items.length) { // 匹配到数据
        let html = (
          <div className={`${styles.calCell} ${isToday ? styles.today : ''}`} key={i}>
            <h4>{i}</h4>
            <Input value={date} htmlType="hidden" />
            {handleCell(items[0].reservationTimeClassifyList)}
          </div>
        )
        temp.push(html);
      } else {
        temp.push(
          <div className={`${styles.calCell} ${isToday ? styles.today : ''}`} key={i}>
            <h4>{i}</h4>
            <Input value={date} htmlType="hidden" />
          </div>
        )
      }
    }
    let end = getGutter(initMonth - 1);
    if (end <= 6 && end > 0) {
      for (let k = 1; k <= 6 - end + 1; k++) {
        temp.push(
          <div className={styles.calCell} key={Math.random()}>
            <h4 className={styles.disabled}>{k}</h4>
          </div>
        )
      }
    }
    return temp;
  }
  const handleCell = (items) => {
    return Object.keys(items).map((val, index) => {
      let list = items[val].reservationTypeMap;
      let actualDate = items[val].actualDate;
      return Object.keys(list).map((v, i) => {
        let color = `${ICON[v]}bg`;
        return (
          <div className={styles.calInfo} key={v} onClick={() => editAppointFn(list[v], v, event)}>
            <span className={`${styles.point} ${styles[color]}`}></span>
            <span className={styles.time}>{actualDate}</span>
            <span className={styles.type}>{TYPE[v]}</span>
            <span className={styles.unit}>{list[v].length}</span>
          </div>
        )
      });
    });
  };

  // 点击每一条预约信息
  const editAppointFn = (item, v, event) => {
    console.log('item:', item, v)
    let X;
    if (document.body.offsetWidth - event.screenX < 300) {
      X = event.screenX - 350
    } else {
      X = event.clientX - event.layerX - 81
    }
    setclient({
      X,
      Y: event.pageY + 39
    });
    setIsShow(true);
    setChkItems(item);
    setChkType(v);
  }

  // 关闭
  const closeEditDialog = () => {
    setIsShow(false)
    cmlNoRef.current.changeDisabled();
  };
  // 修改预约弹窗
  const editDialog = () => {
    return (
      <div className={`${isShow ? styles.active : ''}  ${styles.editDialog}`}
        style={{ left: client.X, top: client.Y }}>
        <div className={styles.head}>
          <span className={`${styles.label} ${styles[ICON[chkType]]}`}>{TYPE[chkType]}</span>
          <div className={styles.btn}>
            {/* <span onClick={() => { cmlNoRef.current.cancelAppoint() }}>取消预约</span>
            <span>|</span> */}
            <CustomIcon type="close2" onClick={closeEditDialog} />
          </div>
        </div>
        <div className={styles.title}>{lang['fb4.cabinet.no']}</div>
        <div className={styles.items}>
          {
            chkItems && chkItems.length && Object.keys(chkItems).map((v, i) => {
              return (
                <div className={styles.item} key={i}>
                  <CmlNoInput
                    cmlNoRef={cmlNoRef}
                    data={chkItems[v]}
                    setIsShow={setIsShow}
                    closeEditDialog={closeEditDialog}
                  />
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }

  /**
   * 每次标记的起始数改变之后，都会重新计算
   * 设置月份数
   * 设置该月的天数
   * 重新渲染格子
   */
  useEffect(() => {
    renderCell();
  }, [initMonth]);

  return (
    <>
      <div className={styles.calContent}>
        <div className={styles.calHeaderM}>
          {renderWeekDay()}
        </div>

        <div className={styles.calBodyM}>
          {renderCell()}
        </div>
      </div>
      {editDialog()}
    </>
  );
});
