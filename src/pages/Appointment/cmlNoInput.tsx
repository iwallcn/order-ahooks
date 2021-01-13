import React, { useState, useContext, useImperativeHandle, useEffect } from 'react';
import { Input, Form, Field, Message, Dialog } from '@alifd/next';
import globalContext from '@/contexts/globalContext';
import API from './api';

const FormItem = Form.Item;

// 编辑表单组件
export default ({ cmlNoRef, data, setIsShow, closeEditDialog }) => {
  const apField = Field.useField({ values: {} });
  const { CustomIcon, getMonthList } = useContext(globalContext);
  const [disabled, setDisabled] = useState(true);
  const [cmlNo, setCmlNo] = useState(data.cmlNo || '');
  const [receivingPlanNo, setReceivingPlanNo] = useState(data.receivingPlanNo || '');

  useEffect(() => {
    setCmlNo(data.cmlNo);
    setReceivingPlanNo(data.receivingPlanNo);
  }, [data]);

  /**
   * 点击关闭：可能用户先点击修改按钮，然后清空了输入框，再点击关闭，
   * 此时需要把原来的值填充，然后再关闭
   */
  useImperativeHandle(cmlNoRef, () => ({
    changeDisabled: () => {
      setDisabled(true);
    }
  }));
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
          setCmlNo(values.cmlNo);
          setIsShow = false;
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
            closeEditDialog();
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
    <Form field={apField} responsive>
      <FormItem required colSpan={9}>
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
      <FormItem colSpan={3} style={{ marginTop: 6 }}>
        <CustomIcon type={disabled ? 'edit' : 'save'} size="s"
          onClick={changeIcon} />
        <CustomIcon type="close" size="s"
          onClick={cancelAppoint} />
      </FormItem>
    </Form>
  )
};