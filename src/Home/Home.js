import './Home.css';
import {SESSION, ROUTE, ROLE, STYLE, COLOR, FILE_SERVER, SERVER, RESULT} from './../App/PublicConstant.js';
import {clearSession, isEmployee} from './../App/PublicMethod.js';
import React from 'react';
import { Layout, Menu, Icon, Avatar, notification, Button, Tag, message} from 'antd';
import {browserHistory} from 'react-router';
import ProfileEditModal from './ProfileEditModal.js';
import $ from 'jquery';
const { Header, Content, Footer, Sider} = Layout;

var close = () => {
  console.log('Notification was closed. Either the close button was clicked or duration time elapsed.');
}

class Home extends React.Component {
  state = {
      collapsed: false,
      mode: 'inline',

      //个人资料编辑框
      profileEditModalVisible: false,
      userInfo: {valid: 0}

  };
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  handleLogout = (e) => {

    e.preventDefault();
    browserHistory.push(ROUTE.MAIN.URL);

    // const key = `open${Date.now()}`;
    // const btnClick = function () {
    //
    //   clearSession();
    //   notification.close(key);
    //   browserHistory.push(ROUTE.MAIN.URL);
    // };
    // const btn = (
    //   <Button type="primary" size="small" onClick={btnClick}>
    //     确定
    //   </Button>
    // );
    //
    // notification.open({
    //   message: '您确定要退出系统吗?',
    //   btn,
    //   key,
    //   onClose: close,
    // });
  }

  //根据角色决定布局
  initLayoutStyleByRole(role) {

    let layoutStyle;

    //主色调、用户管理、检查项目、原始资料、化验/医技数据、健康管理
    if(role === ROLE.EMPLOYEE_ADMIN) layoutStyle = this.getLayoutStyle(COLOR.RED, STYLE.BLOCK);
    else if(role === ROLE.EMPLOYEE_INPUTER) layoutStyle = this.getLayoutStyle(COLOR.ORANGE, STYLE.NONE);
    else if(role === ROLE.EMPLOYEE_HANDLER) layoutStyle = this.getLayoutStyle(COLOR.BLUE, STYLE.NONE);
    else if(role === ROLE.EMPLOYEE_VISITOR) layoutStyle = this.getLayoutStyle(COLOR.GREEN, STYLE.NONE);
    else layoutStyle = this.getLayoutStyle(COLOR.GREEN, STYLE.NONE);

    return layoutStyle;
  }

  getLayoutStyle(roleTagColor,
                 userManageMenuItemDisplay) {

      let layoutStyle = {
        roleTagColor: roleTagColor,
        userManageMenuItemDisplay: userManageMenuItemDisplay
      };

      return layoutStyle;
  }


  handleMenuItemClick = (e) => {

    let targetUrl = ROUTE.WELCOME.URL_PREFIX + "/" + ROUTE.WELCOME.MENU_KEY;
    switch(e.key) {
      case ROUTE.WELCOME.MENU_KEY: targetUrl = ROUTE.WELCOME.URL_PREFIX + "/" + ROUTE.WELCOME.MENU_KEY; break;
      case ROUTE.USER_MANAGE.MENU_KEY: targetUrl = ROUTE.USER_MANAGE.URL_PREFIX + "/" + ROUTE.USER_MANAGE.MENU_KEY; break;
      default:;break;
    }

    //跳转
    browserHistory.push(targetUrl);
  }

  /**
  * 弹出编辑个人信息对话框
  */
  showProfileEditModal = () => {

    this.setState({profileEditModalVisible: true});
    this.requestMember(sessionStorage.getItem(SESSION.USER_ID));
  }

  closeProfileEditModal = () => this.setState({profileEditModalVisible: false})

  //查询memberId会员信息显示到对话框内
  requestMember = (memberId) => {

    console.log('查询会员', memberId);

    $.ajax({
        url : SERVER + '/api/user/' + memberId,
        type : 'GET',
        dataType : 'json',
        beforeSend: (request) => request.setRequestHeader(SESSION.TOKEN, sessionStorage.getItem(SESSION.TOKEN)),
        success : (result) => {

            console.log(result);
            if(result.code === RESULT.SUCCESS) {

                this.setState({userInfo: result.content});
                return;
            } else {
                message.error(result.reason, 2);
                return;
            }
        }
    });
  }

  render() {

    const role = sessionStorage.getItem(SESSION.ROLE);
    const layoutStyle = this.initLayoutStyleByRole(role);

    return (
      <Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}>
          <div className="logo"/>
          <Menu theme="dark" mode="inline" selectedKeys={[this.props.params.menuKey]} onClick={this.handleMenuItemClick}>
            <Menu.Item key={ROUTE.WELCOME.MENU_KEY}>
              <Icon type="home" className="menu-item-font"/>
              <span className="nav-text menu-item-font">首页</span>
            </Menu.Item>
            <Menu.Item key={ROUTE.USER_MANAGE.MENU_KEY} style={{display: layoutStyle.userManageMenuItemDisplay}}>
              <Icon type="team" className="menu-item-font"/>
              <span className="nav-text menu-item-font">员工管理</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 ,textAlign: 'center'}}>
            <Icon className="trigger" type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'} onClick={this.toggle}/>
            <Icon type="logout" className="logout-icon" onClick={this.handleLogout}/>
            <Avatar size="large" src={FILE_SERVER + sessionStorage.getItem(SESSION.AVATAR)} className="avatar-header" style={{backgroundColor: 'white'}} onClick={this.showProfileEditModal}/>
            <ProfileEditModal ref="profileEditForm" visible={this.state.profileEditModalVisible} onCancel={this.closeProfileEditModal} userInfo={this.state.userInfo}/>

            <a className='name' onClick={this.showProfileEditModal}>{sessionStorage.getItem(SESSION.NAME)}</a>
            <Tag color={layoutStyle.roleTagColor} style={{marginLeft:7, float:'right', marginTop:21}}>{role}</Tag>

          </Header>
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 800 }}>
            {this.props.children}
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            同仁医院 ©2017 Created by BUPT
          </Footer>
        </Layout>
      </Layout>
    );
  }
}

export default Home
