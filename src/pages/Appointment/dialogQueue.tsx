import React, { useState, useContext, useEffect, useImperativeHandle } from 'react';
import { Field, Form, Dialog, Tab, Select, DatePicker, Input, Message } from '@alifd/next';
import globalContext from '@/contexts/globalContext';
import API from './api';
import styles from './index.module.scss';
import moment from 'moment';
const FormItem = Form.Item;


/**
 * 排队弹窗
 * 周和月面板共用一个
 * 
 */
export default ({ weekRef, queueNumber }) => {
  const apField = Field.useField({ values: {} });
  const [pdVisible, setPdVisible] = useState(false); // 排队弹窗
  const lang = window.GLOBAL_LANG;
  const { CustomIcon, mockData, TYPE, warehouseCode, warehouseName, availableNoList } = useContext(globalContext);

  // 控制排队弹窗
  useImperativeHandle(weekRef, () => ({
    changeApVisible: (newVal) => {
      setPdVisible(newVal);
    }
  }));

  const changeTab = (key) => {
    if (key == 1) {
      apField.setValue('consignmentNos', '');
    } else {
      apField.setValue('cmlNo', '');
    }
  }

  const disabledDate = (date, view) => {
    // 当前切换周的最后一天
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
        actualDate: moment(values['actualDate']).format('YYYY-MM-DD')
      }
      setFlag(true)
      API.queue(data).then(res => {
        if (res.success) {
          mockData();
          Dialog.confirm({
            title: lang['fb4.reminder'],
            content: res.msg,
            footerActions: [],
            onClose: () => { setPdVisible(false), setFlag(false) },
          });
        } else {
          Dialog.confirm({
            title: lang['fb4.reminder'],
            content: res.errors ? res.errors[0].errorMsg : res.msg,
            footerActions: [],
            onClose: () => { setFlag(false) }
          });
        }
      })
    });
  };

  return (
    <Dialog className={styles.whDialog}
      title={TYPE['R']}
      visible={pdVisible}
      okProps={{ loading: flag }}
      onOk={submitOK}
      onCancel={() => setPdVisible(false)}
      onClose={() => setPdVisible(false)}>
      <Form field={apField} labelAlign="left">
        <div className={styles.apDr}>
          <span>{lang['fb4.this.time.full']}</span>
        </div>
        <div className={styles.apDr}>
          <CustomIcon type="cangku" size="s" />
          {lang['fb4.warehouse']}: <span>{warehouseName}-{warehouseCode}</span>
          <span className={styles.numbers}>{lang['fb4.current.queue.number']}：{queueNumber}</span>
        </div>
        <div className={styles.apDr}>
          <FormItem required requiredMessage={lang['fb4.required']}>
            <DatePicker style={{ width: '100%' }} label={lang['fb4.expected.delivery.time']} name="actualDate" disabledDate={disabledDate} />
          </FormItem>
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
