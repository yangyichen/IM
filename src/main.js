import Vue from 'vue'
import {
  Tabs,
  TabPane,
  Collapse,
  CollapseItem,
  Notification,
  Message,
  MessageBox

} from 'element-ui'
import App from './App.vue'


Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Collapse);
Vue.use(CollapseItem);
Vue.prototype.$notify = Notification;
Vue.prototype.$message = Message;
Vue.prototype.$msgbox = MessageBox;
// Vue.prototype.$alert = MessageBox.alert;

if (!window.WebSocket) {
  alert('您使用的浏览器暂不支持即时通讯，请使用IE9以上版本！');
}

new Vue({
  el: '#app',
  render: h => h(App)
})