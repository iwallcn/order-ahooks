import React from 'react';
import { Avatar, Overlay, Menu, Icon } from '@alifd/next';
import { injectIntl } from 'react-intl';
import styles from './index.module.scss';
import { CustomIcon } from "@/components/Iconfont";

const { Item } = Menu;
const { Popup } = Overlay;

const HeaderAvatar = injectIntl(({ user, intl }) => {
  let _url = ''
  if (window.origin.indexOf('test') > 0 || window.origin.indexOf('localhost') > 0) {
    _url = 'http://b.test.4px.com';
  } else if (window.origin.indexOf('uat') > 0) {
    _url = 'http://b.uat.4px.com';
  } else {
    _url = 'http://b.4px.com';
  }
  return (
    <Popup
      trigger={
        <div className={styles.headerAvatar}>
          <Avatar size="small" src={user.avatar} alt={intl.formatMessage({ id: 'fb4.header.userAvatar' })} />
          <span style={{ marginLeft: 10 }}>{user.fullName}</span>
        </div>
      }
      triggerType="click"
    >
      <div className={styles.avatarPopup}>
        {/* <div className={styles.panel}>
          <div>
            <h4>{intl.formatMessage({ id: 'fb4.header.personalInfo' })}</h4>
            <ul>
              <li>{intl.formatMessage({ id: 'fb4.header.name' })}：{user.name}</li>
              <li>{intl.formatMessage({ id: 'fb4.header.phone' })}：{user.phone}</li>
              <li>{intl.formatMessage({ id: 'fb4.header.email' })}：{user.email}</li>
              <li>{intl.formatMessage({ id: 'fb4.header.region' })}：{user.address}</li>
            </ul>
          </div>
          <div>
            <h4>{intl.formatMessage({ id: 'fb4.header.remark' })}</h4>
            <div>{user.remark}</div>
          </div>
        </div> */}
        <Menu className={styles.menu}>
          <Item>
            <a href={_url}>
              <CustomIcon type="account" size="small" />{intl.formatMessage({ id: 'fb4.header.account' })}
            </a>
          </Item>
          <Item>
            <a href="/logout">
              <CustomIcon type="logout" size="small" />{intl.formatMessage({ id: 'fb4.header.quit' })}
            </a>
          </Item>
        </Menu>
      </div>
    </Popup>
  );
});

export default HeaderAvatar;
