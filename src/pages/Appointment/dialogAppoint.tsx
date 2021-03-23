import React, { useState, useContext, useImperativeHandle } from 'react';
import { Field, Form, Dialog, Tab, Select, Input, Message } from '@alifd/next';
import globalContext from '@/contexts/globalContext';
import API from './api';
import moment from 'moment';
import styles from './index.module.scss';
const FormItem = Form.Item;


/**
 * 排队弹窗
 * 周和月面板共用一个
 * 
 */
export default ({ queueNumber, appointObj, weekRef }) => {
  const { CustomIcon, TYPE, warehouseCode, warehouseName, mockData, availableNoList } = useContext(globalContext);
  const lang = window.GLOBAL_LANG;
  const apField = Field.useField({ values: {} });
  const [apVisible, setApVisible] = useState(false); // 预约弹窗

  // 控制预约弹窗
  useImperativeHandle(weekRef, () => ({
    changeApVisible: (newVal) => {
      setApVisible(newVal);
    }
  }));

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
        actualDate: moment(appointObj.appointmentTime).add(appointObj.beginTime, 'h').format('YYYY-MM-DD HH:mm'),
        reservationType: appointObj.appointmentType
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
            onClose: () => { setFlag(false) }
          });
        }
      });
    });
  };

  return (
    <Dialog className={styles.whDialog}
      title={TYPE[appointObj.appointmentType]}
      visible={apVisible}
      onOk={submitOK}
      okProps={{ loading: flag }}
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
            queueNumber > 0 &&
            <span className={styles.numbers}>{lang['fb4.current.warehouse.queue.number']}：{queueNumber}</span>
          }
        </div>
        <Tab shape="wrapped" size="small" onChange={changeTab}>
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
