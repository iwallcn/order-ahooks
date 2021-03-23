import React, { useState, useContext, useEffect } from 'react';
import { Input, Form, Field, Message, Dialog } from '@alifd/next';
import globalContext from '@/contexts/globalContext';
import API from './api';
import styles from './index.module.scss';

const FormItem = Form.Item;

// 编辑表单组件
export default ({ data }) => {
  const lang = window.GLOBAL_LANG;
  let no = data.cmlNo || data.deliveryCode || '';
  const apField = Field.useField({ values: {} });
  const { CustomIcon, getMonthList } = useContext(globalContext);
  const [disabled, setDisabled] = useState(true);
  const [cmlNo, setCmlNo] = useState(no);
  const [receivingPlanNo, setReceivingPlanNo] = useState(data.receivingPlanNo || '');

  useEffect(() => {
    setCmlNo(no);
    setReceivingPlanNo(data.receivingPlanNo);
  }, [data]);

  // 切换icon，编辑和保存模式切换
  const changeIcon = () => {
    setDisabled(!disabled);
    if (disabled) return;
    apField.validate((errors, values: any) => {
      if (errors) {
        return;
      }
      API.updateCmlNo({ cmlNo: values.cmlNo, receivingPlanNo: data.receivingPlanNo }).then(res => {
        if (res.success) {
          Message.success(res.msg);
          setDisabled(false);
          setCmlNo(values.cmlNo);
          getMonthList();
        } else {
          setCmlNo(data.cmlNo);
          Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
        }
      })
    });
  }
  // 取消预约
  const cancelAppoint = () => {
    Dialog.confirm({
      title: '确定取消当前预约？',
      content: '取消后如有送仓，需重新预约',
      onOk: () => {
        API.cancelReceivingPlan(receivingPlanNo).then(res => {
          if (res.success) {
            Message.success(res.msg);
            getMonthList();
          } else {
            Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
          }
        });
      },
      onCancel: () => console.log('cancel')
    });
  }
  return (
    <Form field={apField} className={styles.cmlform} inline>
      <FormItem required style={{ margin: '6px 0' }}>
        <Input
          trim
          name="cmlNo"
          value={cmlNo}
          readOnly={disabled}
          hasBorder={!disabled}
          onChange={val => {
            setCmlNo(val);
          }} />
      </FormItem>
      <FormItem style={{ margin: '12px 2px' }}>
        <CustomIcon type={disabled ? 'edit' : 'save'} size="s" title={disabled ? lang['fpx.change.cabinet'] : lang['fb4.save']}
          onClick={changeIcon} />
        <CustomIcon type="close" size="s" title={lang['fb4.cancel']}
          onClick={cancelAppoint} />
      </FormItem>
    </Form>
  )
};