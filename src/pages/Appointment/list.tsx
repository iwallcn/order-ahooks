import React, { useEffect, useRef } from 'react';
import { injectIntl } from 'react-intl';
import styles from './index.module.scss';
import CmlNoInput from './cmlNoInput';

export default injectIntl(({ intl, list, TYPE, ICON }) => {
  const cmlNoRef: any = useRef(null);

  // 第一步：按照天遍历 eg:2020-12-22
  const renderRow = () => {
    return Object.keys(list).map((val, index) => {
      return (
        <div className={styles.calRow} key={index}>
          <div className={styles.calCol1}>{list[val].appointmentTime.substr(5)}</div>
          <div className={styles.calCol2}>
            {renderItem(list[val].reservationTimeClassifyList)}
          </div>
        </div>
      )
    });
  };
  // 第二步：按照时间点遍历 eg:06:00
  const renderItem = (items) => {
    return Object.keys(items).map((val, i) => {
      let list = items[i].reservationTypeMap;
      let actualDate = items[i].actualDate;
      return (
        <div className={styles.calItem} key={i}>
          {
            Object.keys(list).map((val, index) => {
              return renderTypes(list[val], actualDate, index, val)
            })
          }
        </div>
      )
    })
  };
  // 第三步：按照类型遍历 eg:S
  const renderTypes = (list, actualDate, index, val) => {
    let color = `${ICON[val]}bg`;
    return (
      <div className={styles.types} key={index}>
        <span className={`${styles.point} ${styles[color]}`}></span>
        <span className={styles.time}>{actualDate}</span>
        <span className={styles.type}>{TYPE[val]}</span>
        <span className={styles.subItems}>
          {renderCmlNo(list)}
        </span>
      </div>
    )
  };
  // 第四步：按照柜号遍历 eg:cmlNo
  const renderCmlNo = (list) => {
    return Object.keys(list).map((v, i) => {
      return (
        <div className={styles.subItem} key={i}>
          <CmlNoInput
            cmlNoRef={cmlNoRef}
            data={list[v]}
            setIsShow={false}
            closeEditDialog={() => { }}
          />
        </div>
      )
    })
  }

  useEffect(() => {
  }, []);

  return (
    <div className={styles.calContent}>
      {renderRow()}
      {/* <div className={styles.calRow}>
        <div className={styles.calCol1}>
          12-22
        </div>
        <div className={styles.calCol2}>
          <div className={styles.calItem}>

            <div className={styles.types}>
              <span className={`${styles.point} ${styles.shohuobg}`}></span>
              <span className={styles.time}>06:00</span>
              <span className={styles.type}>收货预约</span>
              <div className={styles.subItem}>
                <Input value="TGBU8566995" style={{ width: 120 }} />
                <CustomIcon type="edit"></CustomIcon>
              </div>
              <div className={styles.subItem}>
                <Input value="TGBU8566995" style={{ width: 120 }} />
                <CustomIcon type="edit"></CustomIcon>
              </div>
              <span className={styles.btn}>取消预约</span>
            </div>

            <div className={styles.types}>
              <span className={`${styles.point} ${styles.shohuobg}`}></span>
              <span className={styles.time}>09:00</span>
              <span className={styles.type}>收货预约</span>
              <div className={styles.subItem}>
                <Input value="TGBU8566995" style={{ width: 120 }} />
                <CustomIcon type="edit"></CustomIcon>
              </div>
              <span className={styles.btn}>取消预约</span>
            </div>
          </div>

        </div>
      </div> */}
    </div>
  );
});
