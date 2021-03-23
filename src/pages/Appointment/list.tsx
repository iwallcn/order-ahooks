import React, { useContext } from 'react';
import { injectIntl } from 'react-intl';
import styles from './index.module.scss';
import globalContext from '@/contexts/globalContext';
import CmlNoInputList from './cmlNoInputList';

export default injectIntl(({ intl, list }) => {
  const { TYPE, ICON } = useContext(globalContext);

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
    let type = `${ICON[val]}bg`;
    return (
      <div className={styles.types} key={index}>
        <span className={`${styles.point} ${styles[type]}`}></span>
        <span className={styles.time}>{actualDate}</span>
        <span className={styles.type}>{TYPE[val]}</span>
        <span className={styles.subItems}>
          {renderCmlNo(list, type)}
        </span>
      </div>
    )
  };
  // 第四步：按照柜号遍历 eg:cmlNo
  const renderCmlNo = (list, type) => {
    return Object.keys(list).map((v, i) => {
      return (
        <div className={styles.subItem} key={i}>
          <CmlNoInputList data={list[v]} />
        </div>
      )
    })
  }

  return (
    <div className={styles.calContent}>
      {renderRow()}
    </div>
  );
});
