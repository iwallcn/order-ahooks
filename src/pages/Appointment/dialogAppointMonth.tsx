import React, { useState, useContext, useImperativeHandle, useEffect } from 'react';
import { Field, Form, Dialog, Tab, Select, Input, Message, Radio } from '@alifd/next';
import globalContext from '@/contexts/globalContext';
import API from './api';
import moment from 'moment';
import styles from './index.module.scss';
const FormItem = Form.Item;


/**
 * 月面板预约弹窗
 */
export default ({ queueNumber, date, weekRef }) => {
  const { CustomIcon, TYPE, warehouseCode, warehouseName, mockData, availableNoList, lists } = useContext(globalContext);
  const lang = window.GLOBAL_LANG;

  const apField = Field.useField({ values: {} });
  const [apVisible, setApVisible] = useState(false); // 预约弹窗
  const [chkAppointType, setchkAppointType] = useState(''); // 选择预约类型
  const [chkAppointTime, setChkAppointTime] = useState(''); // 选择时间段
  const [availableTypes, setAvailableTypes] = useState({}); // 可供预约选择的类型时间

  // 选择预约类型之后，设置该类型下的第一个时间选中
  const changeAppointType = (v) => {
    console.log(v)
    setchkAppointType(v);
    setChkAppointTime(availableTypes[v][0]);
  }
  // 选择预约时间段
  const changeAppointTime = (v) => {
    setChkAppointTime(v);
  }

  // 根据日期获取该天可预约的类型和预约时间段
  const getDayAndUnit = () => {
    API.getDayUnit({ warehouseCode, date }).then(res => {
      if (res.success) {
        let obj = {};
        for (let v in res.data) {
          let item = res.data[v];
          if (item["appointmentType"] != 'E') {
            obj[item["appointmentType"]] = !obj[item["appointmentType"]] ? [].concat(item["beginTime"]) : obj[item["appointmentType"]].concat(item["beginTime"]);
          }
        }
        console.log(chkAppointType)
        setchkAppointType(Object.keys(obj).length > 0 ? Object.keys(obj)[0] : ''); // 默认设置第一个tab选中
        console.log(chkAppointType)
        setChkAppointTime(Object.keys(obj).length > 0 ? obj[Object.keys(obj)[0]][0] : ''); // 默认设置第一个tab中的时间段选中
        setAvailableTypes(obj); // 设置可预约类型和时间点
      }
    })
  };

  // 渲染预约类型选择
  const renderAppointTypes = (
    <Tab shape="wrapped" size="small" activeKey={chkAppointType} onChange={changeAppointType} contentStyle={{ padding: 16 }}>
      {
        Object.keys(availableTypes).map(v => {
          return (
            <Tab.Item key={v} title={TYPE[v]}>
              <Radio.Group dataSource={availableTypes[v]} value={chkAppointTime} onChange={changeAppointTime} />
            </Tab.Item>
          )
        })
      }
    </Tab >
  );

  // 控制预约弹窗
  useImperativeHandle(weekRef, () => ({
    changeApVisible: (newVal) => {
      setApVisible(newVal);
    }
  }));

  // 切换单号
  const changeTab = (key) => {
    if (key == 1) {
      apField.setValue('consignmentNos', '');
    } else {
      apField.setValue('cmlNo', '');
    }
  }

  // 点击确认预约
  const [flag, setFlag] = useState(false)
  const submitOK = () => {
    apField.validate((errors, values) => {
      if ((!values['consignmentNos'] && !values['cmlNo']) || (values['consignmentNos'] && values['cmlNo'])) {
        return Message.warning(lang['fb4.only.cabinet.ic']);
      }
      let arr: any = []
      if (values['consignmentNos']) {
        arr = values['consignmentNos'].split(/\n/).filter(val => val);
        for (let v in arr) {
          arr[v] = arr[v].trim();
        }
      }
      let data: any = {
        consignmentNos: values['consignmentNos'] ? arr : '',
        cmlNo: values['cmlNo'],
        toWarehouseCode: warehouseCode,
        actualDate: moment(date).add(chkAppointTime, 'h').format('YYYY-MM-DD HH:mm'),
        reservationType: lists.isArrangement == 'Y' ? 'W' : chkAppointType
      }
      setFlag(true)
      API.confirm(data).then(res => {
        if (res.success) {
          mockData();
          Dialog.confirm({
            title: lang['fb4.reminder'],
            content: res.msg,
            footerActions: [],
            onClose: () => { setApVisible(false), setFlag(false) },
          });
        } else {
          Dialog.confirm({
            title: lang['fb4.reminder'],
            content: res.errors ? res.errors[0].errorMsg : res.msg,
            footerActions: [],
            onClose: () => { setFlag(false) },
          });
        }
      });
    });
  };

  useEffect(() => {
    if (apVisible) {
      getDayAndUnit();
    }
  }, [apVisible]);

  return (
    <Dialog className={styles.whDialog}
      title={lists.isArrangement == 'Y' ? TYPE['W'] : lang['fb4.reservation.information']}
      visible={apVisible}
      okProps={{ loading: flag }}
      onOk={submitOK}
      onCancel={() => setApVisible(false)}
      onClose={() => setApVisible(false)}>
      <Form field={apField} labelAlign="left">
        {lists.isArrangement == 'Y' &&
          <div className={styles.apDr}>
            <span>{lang['fb4.period.full.tip']}</span>
          </div>
        }
        {chkAppointType == 'W' &&
          <div className={styles.apDr}>
            <span>{lang['fb4.period.full.tip']}</span>
          </div>
        }
        {chkAppointType == 'V' &&
          <div className={styles.apDr}>
            <span>{lang['fb4.current.booking.tip']}</span>
          </div>
        }
        {renderAppointTypes}

        <div className={styles.apDr}>
          <CustomIcon type="cangku" size="s" />
          {lang['fb4.warehouse']}: <span>{warehouseName}-{warehouseCode}</span>
        </div>
        <div className={styles.apDr}>
          <CustomIcon type="shijian" size="s" />
          {lang['fb4.receiving.time']}: <span>{date} </span>
          {
            queueNumber > 0 &&
            <span className={styles.numbers}>{lang['fb4.current.warehouse.queue.number']}：{queueNumber}</span>
          }
        </div>
        <Tab shape="wrapped" size="small" onChange={changeTab} navStyle={{ marginTop: 16 }}>
          <Tab.Item title={lang['fb4.cml.no']} key="1">
            <FormItem required requiredMessage={lang['fb4.required']}>
              <Select.AutoComplete
                style={{ width: '100%' }}
                name="cmlNo"
                placeholder={lang['fb4.select.cabinet.tip']}
                hasClear
                dataSource={availableNoList} />
            </FormItem>
          </Tab.Item>
          <Tab.Item title={lang['fb4.consignmentNo']} key="2">
            <FormItem required requiredMessage={lang['fb4.required']}>
              <Input.TextArea name="consignmentNos"
                autoHeight={{ minRows: 3, maxRows: 6 }}
                style={{ width: '100%' }}
                placeholder={lang['fb4.select.ic.tip']} />
            </FormItem>
          </Tab.Item>
        </Tab>
      </Form>
    </Dialog>
  )
};
